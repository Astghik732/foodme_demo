package am.foodme.backend.service;

import am.foodme.backend.dto.OrderDto;
import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Order;
import am.foodme.backend.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminOrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    private AdminOrderService adminOrderService;

    private Order orderWithStatus(String status) {
        Order order = new Order();
        order.setId(1L);
        order.setStatus(status);
        return order;
    }

    @Test
    void updateStatus_newToAccepted_succeeds() {
        adminOrderService = new AdminOrderService(orderRepository);
        Order order = orderWithStatus("NEW");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDto result = adminOrderService.updateStatus(1L, "ACCEPTED", null);

        assertEquals("ACCEPTED", result.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void updateStatus_unknownOrderId_throwsNotFound() {
        adminOrderService = new AdminOrderService(orderRepository);
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> adminOrderService.updateStatus(99L, "ACCEPTED", null));

        assertEquals("Order 99 not found", ex.getMessage());
    }
}
