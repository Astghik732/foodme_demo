package am.foodme.backend.controller.api;

import am.foodme.backend.utils.ControllerUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ControllerUtil.API_DEBUG_CONTROLLER)
public class DebugController {

    @GetMapping("/boom")
    public String boom() {
        throw new RuntimeException("Boom! This is a test exception for the error tracker.");
    }
}
