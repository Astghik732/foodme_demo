package am.foodme.backend.controller.api;

import am.foodme.backend.dto.ChefTagOrderWithDishTagDto;
import am.foodme.backend.dto.DishDto;
import am.foodme.backend.dto.DishPaginationCountDto;
import am.foodme.backend.model.Dish;
import am.foodme.backend.service.ChefService;
import am.foodme.backend.service.DishService;
import am.foodme.backend.utils.ControllerUtil;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(ControllerUtil.API_DISH_CONTROLLER)
public class DishController {

    private final DishService dishService;
    private final ChefService chefService;

    public DishController(DishService dishService, ChefService chefService) {
        this.dishService = dishService;
        this.chefService = chefService;
    }

    @GetMapping("/{chefId}/active")
    public DishPaginationCountDto getActiveDishesForChef(@PathVariable Long chefId,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "50") int size) {
        Page<Dish> dishPage = dishService.getActiveDishesForChef(chefId, page, size);
        return toPaginationDto(dishPage);
    }

    @GetMapping("/{id}")
    public DishDto getDishById(@PathVariable Long id) {
        return DishDto.mapEntityToDto(dishService.getDishById(id));
    }

    @GetMapping("/search")
    public DishPaginationCountDto search(@RequestParam String query,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Page<Dish> dishPage = dishService.search(query, page, size);
        return toPaginationDto(dishPage);
    }

    @GetMapping("/tags")
    public List<ChefTagOrderWithDishTagDto> getTagsForChef(@RequestParam Long chefId) {
        return chefService.getTagOrdersForChef(chefId);
    }

    private DishPaginationCountDto toPaginationDto(Page<Dish> dishPage) {
        List<DishDto> list = dishPage.getContent().stream()
                .map(DishDto::mapEntityToDto)
                .collect(Collectors.toList());
        return new DishPaginationCountDto(list, dishPage.getTotalElements());
    }
}
