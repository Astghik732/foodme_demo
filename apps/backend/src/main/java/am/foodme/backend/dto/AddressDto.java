package am.foodme.backend.dto;

import am.foodme.backend.model.Address;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
    private String city;
    private String street;
    private String building;
    private String apartment;
    private String note;

    public static AddressDto mapEntityToDto(Address entity) {
        if (entity == null) {
            return null;
        }
        AddressDto dto = new AddressDto();
        dto.setCity(entity.getCity());
        dto.setStreet(entity.getStreet());
        dto.setBuilding(entity.getBuilding());
        dto.setApartment(entity.getApartment());
        dto.setNote(entity.getNote());
        return dto;
    }

    public static Address mapDtoToEntity(AddressDto dto) {
        if (dto == null) {
            return null;
        }
        Address entity = new Address();
        entity.setCity(dto.getCity());
        entity.setStreet(dto.getStreet());
        entity.setBuilding(dto.getBuilding());
        entity.setApartment(dto.getApartment());
        entity.setNote(dto.getNote());
        return entity;
    }
}
