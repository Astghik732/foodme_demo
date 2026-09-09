package am.foodme.backend.repository;

import am.foodme.backend.model.ChefTagOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChefTagOrderRepository extends JpaRepository<ChefTagOrder, Long> {
    List<ChefTagOrder> findByChefIdOrderByPriorityIndexAsc(Long chefId);
}
