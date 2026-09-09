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
public class KitchenDtoTranslation {
    private String lang;
    private String value;

    public static List<KitchenDtoTranslation> mapChefToTranslations(Chef chef) {
        return List.of(
                new KitchenDtoTranslation("en", chef.getKitchenEn()),
                new KitchenDtoTranslation("hy", chef.getKitchenAm()),
                new KitchenDtoTranslation("ru", chef.getKitchenRu())
        );
    }
}
