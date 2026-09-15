package am.foodme.backend.controller.api;

import am.foodme.backend.dto.CustomerAuthDto;
import am.foodme.backend.dto.CustomerLoginRequestDto;
import am.foodme.backend.dto.CustomerRegisterRequestDto;
import am.foodme.backend.service.CustomerAuthService;
import am.foodme.backend.utils.ControllerUtil;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ControllerUtil.API_AUTH_CONTROLLER)
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    public CustomerAuthController(CustomerAuthService customerAuthService) {
        this.customerAuthService = customerAuthService;
    }

    @PostMapping("/register")
    public CustomerAuthDto register(@Valid @RequestBody CustomerRegisterRequestDto request) {
        return customerAuthService.register(request);
    }

    @PostMapping("/login")
    public CustomerAuthDto login(@Valid @RequestBody CustomerLoginRequestDto request) {
        return customerAuthService.login(request);
    }
}
