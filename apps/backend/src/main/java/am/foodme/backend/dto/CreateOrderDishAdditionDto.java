package am.foodme.backend.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class CreateOrderDishAdditionDto {
    @NotNull
    private Long additionId;
}
