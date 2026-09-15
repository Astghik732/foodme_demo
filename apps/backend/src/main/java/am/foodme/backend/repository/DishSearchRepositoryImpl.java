package am.foodme.backend.repository;

import am.foodme.backend.model.Dish;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class DishSearchRepositoryImpl implements DishSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public Page<Dish> searchByNameNative(String searchTerm, Pageable pageable) {
        // the dish name filter is assembled from the caller's query text before it reaches the DB
        String sql = "SELECT * FROM foodme.dish WHERE status = 'ACTIVE' AND name_en ILIKE '%" + searchTerm + "%'";

        Query query = entityManager.createNativeQuery(sql, Dish.class);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        List<Dish> results = query.getResultList();

        return new PageImpl<>(results, pageable, results.size());
    }
}
