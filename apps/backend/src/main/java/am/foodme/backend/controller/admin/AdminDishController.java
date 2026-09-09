package am.foodme.backend.controller.admin;

import am.foodme.backend.dto.AdminListResponseDto;
import am.foodme.backend.dto.DishDto;
import am.foodme.backend.model.Dish;
import am.foodme.backend.service.AdminDishService;
import am.foodme.backend.utils.ControllerUtil;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(ControllerUtil.ADMIN_DISH_CONTROLLER)
public class AdminDishController {

    private final AdminDishService adminDishService;

    public AdminDishController(AdminDishService adminDishService) {
        this.adminDishService = adminDishService;
    }

    @GetMapping
    public AdminListResponseDto<DishDto> list(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size,
                                               @RequestParam(required = false) Long chefId) {
        Page<Dish> dishPage = adminDishService.list(page, size, chefId);
        List<DishDto> list = dishPage.getContent().stream()
                .map(DishDto::mapEntityToDto)
                .collect(Collectors.toList());
        return new AdminListResponseDto<>(list, dishPage.getTotalElements());
    }

    @GetMapping("/{id}")
    public DishDto getById(@PathVariable Long id) {
        return DishDto.mapEntityToDto(adminDishService.getById(id));
    }

    @PutMapping("/{id}")
    public DishDto update(@PathVariable Long id, @RequestBody DishDto dishDto) {
        return DishDto.mapEntityToDto(adminDishService.update(id, dishDto));
    }
}
