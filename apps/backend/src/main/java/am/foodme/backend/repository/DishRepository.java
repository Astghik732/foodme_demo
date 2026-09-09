package am.foodme.backend.repository;

import am.foodme.backend.model.Dish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DishRepository extends JpaRepository<Dish, Long>, DishSearchRepository {
    Page<Dish> findByChefIdAndStatus(Long chefId, String status, Pageable pageable);

    Page<Dish> findByChefId(Long chefId, Pageable pageable);
}
