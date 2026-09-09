package am.foodme.backend.dto;

import am.foodme.backend.model.OrderDish;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDishDto {
    private String nameEn;
    private String nameHy;
    private String nameRu;
    private Double price;
    private String url;
    private Integer quantity;

    public static OrderDishDto mapEntityToDto(OrderDish entity) {
        if (entity == null) {
            return null;
        }
        OrderDishDto dto = new OrderDishDto();
        dto.setNameEn(entity.getNameEn());
        dto.setNameHy(entity.getNameAm());
        dto.setNameRu(entity.getNameRu());
        dto.setPrice(entity.getPrice());
        dto.setUrl(entity.getUrl());
        dto.setQuantity(entity.getQuantity());
        return dto;
    }
}
