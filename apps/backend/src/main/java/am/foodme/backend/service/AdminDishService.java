package am.foodme.backend.service;

import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Dish;
import am.foodme.backend.repository.DishRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AdminDishService {

    private final DishRepository dishRepository;

    public AdminDishService(DishRepository dishRepository) {
        this.dishRepository = dishRepository;
    }

    public Page<Dish> list(int page, int size, Long chefId) {
        if (chefId == null) {
            return dishRepository.findAll(PageRequest.of(page, size));
        }
        return dishRepository.findByChefId(chefId, PageRequest.of(page, size));
    }

    public Dish getById(Long id) {
        return dishRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dish " + id + " not found"));
    }

    public Dish update(Long id, am.foodme.backend.dto.DishDto dto) {
        Dish existing = getById(id);
        existing.setNameEn(dto.getNameEn());
        existing.setNameAm(dto.getNameHy());
        existing.setNameRu(dto.getNameRu());
        existing.setDescriptionEn(dto.getDescriptionEn());
        existing.setPrice(dto.getPrice());
        existing.setUrl(dto.getUrl());
        existing.setPortionEn(dto.getPortionEn());
        existing.setPortionAm(dto.getPortionHy());
        existing.setPortionRu(dto.getPortionRu());
        existing.setStatus(dto.getStatus());
        existing.setMinimumOrderCount(dto.getMinimumOrderCount());
        existing.setPriorityIndex(dto.getPriorityIndex());
        return dishRepository.save(existing);
    }
}
