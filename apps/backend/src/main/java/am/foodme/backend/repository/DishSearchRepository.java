package am.foodme.backend.repository;

import am.foodme.backend.model.Dish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DishSearchRepository {
    Page<Dish> searchByNameNative(String query, Pageable pageable);
}
