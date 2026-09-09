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
public class NameDtoTranslation {
    private String lang;
    private String value;

    public static List<NameDtoTranslation> mapChefToTranslations(Chef chef) {
        return List.of(
                new NameDtoTranslation("en", chef.getFullNameEn()),
                new NameDtoTranslation("hy", chef.getFullNameAm()),
                new NameDtoTranslation("ru", chef.getFullNameRu())
        );
    }
}
