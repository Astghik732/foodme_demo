package am.foodme.backend.repository;

import am.foodme.backend.model.OrderRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRatingRepository extends JpaRepository<OrderRating, Long> {
    boolean existsByOrderId(Long orderId);

    @Query("select avg(r.stars) from OrderRating r where r.chef.id = :chefId")
    Double averageStarsForChef(@Param("chefId") Long chefId);
}
