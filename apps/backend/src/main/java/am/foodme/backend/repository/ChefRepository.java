package am.foodme.backend.repository;

import am.foodme.backend.model.Chef;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChefRepository extends JpaRepository<Chef, Long> {
    Page<Chef> findByStatusOrderByPriorityIndexAscIdAsc(String status, Pageable pageable);

    Optional<Chef> findByUsername(String username);

    Page<Chef> findByUsernameContainingIgnoreCase(String q, Pageable pageable);
}
