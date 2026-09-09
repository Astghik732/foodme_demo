package am.foodme.backend.controller.admin;

import am.foodme.backend.dto.AdminLoginRequestDto;
import am.foodme.backend.dto.AdminLoginResponseDto;
import am.foodme.backend.service.AdminAuthService;
import am.foodme.backend.utils.ControllerUtil;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ControllerUtil.ADMIN_AUTH_CONTROLLER)
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public AdminLoginResponseDto login(@RequestBody AdminLoginRequestDto request) {
        return adminAuthService.login(request);
    }
}
