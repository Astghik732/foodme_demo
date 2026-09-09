package am.foodme.backend.service;

import am.foodme.backend.dto.AddressDto;
import am.foodme.backend.dto.CreateOrderDishDto;
import am.foodme.backend.dto.DeliveryPriceRequestDto;
import am.foodme.backend.dto.DeliveryPriceResponseDto;
import am.foodme.backend.dto.OrderCreateResponseDto;
import am.foodme.backend.dto.OrderDto;
import am.foodme.backend.exceptionHandler.BadRequestException;
import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Address;
import am.foodme.backend.model.Chef;
import am.foodme.backend.model.Dish;
import am.foodme.backend.model.Order;
import am.foodme.backend.model.OrderDish;
import am.foodme.backend.repository.ChefRepository;
import am.foodme.backend.repository.DishRepository;
import am.foodme.backend.repository.OrderRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ChefRepository chefRepository;
    private final DishRepository dishRepository;
    private final MeterRegistry meterRegistry;

    public OrderService(OrderRepository orderRepository, ChefRepository chefRepository,
                         DishRepository dishRepository, MeterRegistry meterRegistry) {
        this.orderRepository = orderRepository;
        this.chefRepository = chefRepository;
        this.dishRepository = dishRepository;
        this.meterRegistry = meterRegistry;
    }

    public DeliveryPriceResponseDto calculateDeliveryPrice(DeliveryPriceRequestDto request) {
        Chef chef = chefRepository.findById(request.getChefId())
                .orElseThrow(() -> new NotFoundException("Chef " + request.getChefId() + " not found"));

        if ("TAKEAWAY".equals(request.getDeliveryMethod())) {
            return new DeliveryPriceResponseDto(0.0, chef.getFreeDeliveryFrom());
        }

        double subtotal = request.getSubtotal() == null ? 0.0 : request.getSubtotal();
        double deliveryPrice = chef.getDeliveryPrice();
        // FM-BUG-03
        if (chef.getFreeDeliveryFrom() != null && subtotal > chef.getFreeDeliveryFrom()) {
            deliveryPrice = 0.0;
        }
        return new DeliveryPriceResponseDto(deliveryPrice, chef.getFreeDeliveryFrom());
    }

    @Transactional
    public OrderCreateResponseDto createOrder(OrderDto orderDto) {
        if (!"CASH".equals(orderDto.getPaymentType())) {
            throw new BadRequestException("Only CASH payment is supported");
        }

        Chef chef = chefRepository.findById(orderDto.getChefId())
                .orElseThrow(() -> new NotFoundException("Chef " + orderDto.getChefId() + " not found"));

        Order order = new Order();
        order.setChef(chef);
        order.setStatus("NEW");
        order.setReceiverName(orderDto.getReceiverName());
        order.setReceiverPhoneNumber(orderDto.getReceiverPhoneNumber());
        order.setReceiverEmail(orderDto.getReceiverEmail());
        order.setPaymentType(orderDto.getPaymentType());
        order.setDeliveryMethod(orderDto.getDeliveryMethod());
        order.setNote(orderDto.getNote());
        // FM-BUG-06
        order.setCreatedAt(LocalDateTime.now());

        if ("DELIVERY".equals(orderDto.getDeliveryMethod()) && orderDto.getAddressDto() != null) {
            Address address = AddressDto.mapDtoToEntity(orderDto.getAddressDto());
            order.setAddress(address);
        }

        List<OrderDish> orderDishes = new ArrayList<>();
        double subtotal = 0.0;
        for (CreateOrderDishDto item : orderDto.getCreateOrderDishes()) {
            // FM-BUG-05
            Dish dish = dishRepository.findById(item.getDishId())
                    .orElseThrow(() -> new NotFoundException("Dish " + item.getDishId() + " not found"));

            OrderDish orderDish = new OrderDish();
            orderDish.setOrder(order);
            orderDish.setDish(dish);
            orderDish.setNameEn(dish.getNameEn());
            orderDish.setNameAm(dish.getNameAm());
            orderDish.setNameRu(dish.getNameRu());
            orderDish.setUrl(dish.getUrl());
            orderDish.setPrice(dish.getPrice());
            orderDish.setQuantity(item.getQuantity());
            orderDishes.add(orderDish);

            // FM-BUG-01
            subtotal += (int) (dish.getPrice() * item.getQuantity());
        }
        order.setOrderDishList(orderDishes);

        double deliveryPrice = 0.0;
        if ("DELIVERY".equals(orderDto.getDeliveryMethod())) {
            DeliveryPriceRequestDto priceRequest = new DeliveryPriceRequestDto(chef.getId(), subtotal, "DELIVERY");
            deliveryPrice = calculateDeliveryPrice(priceRequest).getDeliveryPrice();
        }
        order.setDeliveryPrice(deliveryPrice);
        order.setTotalPrice(subtotal + deliveryPrice);

        long seqValue = orderRepository.nextOrderNumberSequenceValue();
        order.setNumber("FM-" + (100000 + seqValue));

        Order saved = orderRepository.save(order);

        meterRegistry.counter("foodme.orders").increment();

        return new OrderCreateResponseDto(saved.getNumber(), saved.getStatus(), saved.getTotalPrice());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByNumber(String number) {
        // FM-VULN-01
        Order order = orderRepository.findByNumber(number)
                .orElseThrow(() -> new NotFoundException("Order " + number + " not found"));
        return OrderDto.mapEntityToDto(order);
    }
}
