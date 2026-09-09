package am.foodme.backend.repository;

import am.foodme.backend.model.OrderDish;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderDishRepository extends JpaRepository<OrderDish, Long> {
}
