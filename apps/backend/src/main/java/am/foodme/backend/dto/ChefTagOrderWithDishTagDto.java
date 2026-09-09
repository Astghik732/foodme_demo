package am.foodme.backend.dto;

import am.foodme.backend.model.ChefTagOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChefTagOrderWithDishTagDto {
    private Integer priorityIndex;
    private DishTagDto dishTagDto;

    public static ChefTagOrderWithDishTagDto mapEntityToDto(ChefTagOrder entity) {
        if (entity == null) {
            return null;
        }
        ChefTagOrderWithDishTagDto dto = new ChefTagOrderWithDishTagDto();
        dto.setPriorityIndex(entity.getPriorityIndex());
        dto.setDishTagDto(DishTagDto.mapEntityToDto(entity.getDishTag()));
        return dto;
    }
}
