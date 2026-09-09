package am.foodme.backend.dto;

import am.foodme.backend.model.Chef;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DescriptionDtoTranslation {
    private String lang;
    private String value;

    public static List<DescriptionDtoTranslation> mapChefToTranslations(Chef chef) {
        return List.of(
                new DescriptionDtoTranslation("en", chef.getDescriptionEn()),
                new DescriptionDtoTranslation("hy", chef.getDescriptionAm()),
                new DescriptionDtoTranslation("ru", chef.getDescriptionRu())
        );
    }
}
