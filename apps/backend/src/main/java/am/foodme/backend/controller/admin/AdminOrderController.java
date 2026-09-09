package am.foodme.backend.controller.admin;

import am.foodme.backend.dto.AdminListResponseDto;
import am.foodme.backend.dto.OrderDto;
import am.foodme.backend.dto.OrderStatusUpdateDto;
import am.foodme.backend.service.AdminOrderService;
import am.foodme.backend.utils.ControllerUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ControllerUtil.ADMIN_ORDER_CONTROLLER)
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    public AdminListResponseDto<OrderDto> list(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size,
                                                @RequestParam(required = false) String status) {
        return adminOrderService.list(page, size, status);
    }

    @GetMapping("/{id}")
    public OrderDto getById(@PathVariable Long id) {
        return adminOrderService.getById(id);
    }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateDto request) {
        return adminOrderService.updateStatus(id, request.getStatus(), request.getRejectReason());
    }
}
