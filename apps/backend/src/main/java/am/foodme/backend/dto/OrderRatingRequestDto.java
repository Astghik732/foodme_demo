package am.foodme.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderRatingRequestDto {

    public static final String STARS_MESSAGE = "Rating must be a whole number of stars from 1 to 5";

    // Double (not Integer) on purpose: Jackson would silently truncate 3.5 to 3 for an
    // Integer field. The service rejects any non-whole value.
    @NotNull(message = STARS_MESSAGE)
    @DecimalMin(value = "1", message = STARS_MESSAGE)
    @DecimalMax(value = "5", message = STARS_MESSAGE)
    private Double stars;

    @Size(max = 1000, message = "Comment must be at most 1000 characters")
    private String comment;
}
