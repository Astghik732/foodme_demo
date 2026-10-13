package am.foodme.backend.service;

import am.foodme.backend.dto.OrderRatingDto;
import am.foodme.backend.dto.OrderRatingRequestDto;
import am.foodme.backend.exceptionHandler.BadRequestException;
import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Chef;
import am.foodme.backend.model.Customer;
import am.foodme.backend.model.Order;
import am.foodme.backend.model.OrderRating;
import am.foodme.backend.repository.ChefRepository;
import am.foodme.backend.repository.CustomerRepository;
import am.foodme.backend.repository.OrderRatingRepository;
import am.foodme.backend.repository.OrderRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OrderRatingService {

    static final String NOT_DELIVERED_MESSAGE = "Only delivered orders can be reviewed.";
    static final String ALREADY_REVIEWED_MESSAGE = "Order already reviewed.";

    private final OrderRatingRepository orderRatingRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ChefRepository chefRepository;

    public OrderRatingService(OrderRatingRepository orderRatingRepository, OrderRepository orderRepository,
                              CustomerRepository customerRepository, ChefRepository chefRepository) {
        this.orderRatingRepository = orderRatingRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.chefRepository = chefRepository;
    }

    @Transactional
    public OrderRatingDto rate(String customerEmail, String orderNumber, OrderRatingRequestDto request) {
        Customer customer = customerRepository.findByEmail(customerEmail == null ? "" : customerEmail.trim().toLowerCase())
                .orElseThrow(() -> new NotFoundException("Customer not found"));

        // Someone else's order is reported exactly like a missing one.
        Order order = orderRepository.findByNumber(orderNumber)
                .filter(o -> o.getCustomer() != null && customer.getId().equals(o.getCustomer().getId()))
                .orElseThrow(() -> new NotFoundException("Order " + orderNumber + " not found"));

        if (!"DELIVERED".equals(order.getStatus())) {
            throw new BadRequestException(NOT_DELIVERED_MESSAGE);
        }
        if (orderRatingRepository.existsByOrderId(order.getId())) {
            throw new BadRequestException(ALREADY_REVIEWED_MESSAGE);
        }

        double rawStars = request.getStars();
        if (rawStars != Math.rint(rawStars)) {
            throw new BadRequestException(OrderRatingRequestDto.STARS_MESSAGE);
        }

        Chef chef = order.getChef();
        if (chef == null) {
            throw new NotFoundException("Order " + orderNumber + " has no chef");
        }

        OrderRating rating = new OrderRating();
        rating.setOrder(order);
        rating.setCustomer(customer);
        rating.setChef(chef);
        rating.setStars((int) rawStars);
        rating.setComment(request.getComment() == null || request.getComment().isBlank()
                ? null : request.getComment().trim());
        rating.setCreatedAt(LocalDateTime.now());

        OrderRating saved;
        try {
            // Flush now so the unique(order_id) constraint catches a concurrent double submit.
            saved = orderRatingRepository.saveAndFlush(rating);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException(ALREADY_REVIEWED_MESSAGE);
        }

        recalculateChefRating(chef.getId());
        return OrderRatingDto.mapEntityToDto(saved);
    }

    /** Chef rating = average of all of the chef's ratings, rounded to one decimal. */
    private void recalculateChefRating(Long chefId) {
        Double average = orderRatingRepository.averageStarsForChef(chefId);
        if (average == null) {
            return;
        }
        Chef chef = chefRepository.findById(chefId)
                .orElseThrow(() -> new NotFoundException("Chef " + chefId + " not found"));
        chef.setRating(Math.round(average * 10.0) / 10.0);
        chefRepository.save(chef);
    }
}
