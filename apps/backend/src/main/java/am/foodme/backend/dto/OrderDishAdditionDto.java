package am.foodme.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDishAdditionDto {
    private Long id;
    private String nameEn;
    private String nameAm;
    private String nameRu;
    private Double price;
}
