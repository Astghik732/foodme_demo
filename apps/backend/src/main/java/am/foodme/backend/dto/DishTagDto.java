package am.foodme.backend.dto;

import am.foodme.backend.model.DishTag;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DishTagDto {
    private Long id;
    private String nameEn;
    private String nameHy;
    private String nameRu;

    public static DishTagDto mapEntityToDto(DishTag entity) {
        if (entity == null) {
            return null;
        }
        DishTagDto dto = new DishTagDto();
        dto.setId(entity.getId());
        dto.setNameEn(entity.getNameEn());
        dto.setNameHy(entity.getNameAm());
        dto.setNameRu(entity.getNameRu());
        return dto;
    }

    public static DishTag mapDtoToEntity(DishTagDto dto) {
        if (dto == null) {
            return null;
        }
        DishTag entity = new DishTag();
        entity.setId(dto.getId());
        entity.setNameEn(dto.getNameEn());
        entity.setNameAm(dto.getNameHy());
        entity.setNameRu(dto.getNameRu());
        return entity;
    }
}
