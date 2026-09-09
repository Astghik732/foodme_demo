package am.foodme.backend.service;

import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Dish;
import am.foodme.backend.repository.DishRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class DishService {

    private final DishRepository dishRepository;

    public DishService(DishRepository dishRepository) {
        this.dishRepository = dishRepository;
    }

    public Page<Dish> getActiveDishesForChef(Long chefId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return dishRepository.findByChefIdAndStatus(chefId, "ACTIVE", pageable);
    }

    public Dish getDishById(Long id) {
        return dishRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dish " + id + " not found"));
    }

    public Page<Dish> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return dishRepository.searchByNameNative(query, pageable);
    }
}
