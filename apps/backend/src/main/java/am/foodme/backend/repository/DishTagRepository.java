package am.foodme.backend.repository;

import am.foodme.backend.model.DishTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DishTagRepository extends JpaRepository<DishTag, Long> {
}
