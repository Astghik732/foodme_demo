package am.foodme.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** A menu section (Soups, Salad, Beef & Pork Dishes, ...). Translations are columns here rather than
 *  a separate table, matching how Chef and Dish carry their own translations. */
@Entity
@Table(name = "dish_tag", schema = "foodme")
@Getter
@Setter
public class DishTag {

    @Id
    @SequenceGenerator(name = "dish_tag_id_seq", sequenceName = "foodme.dish_tag_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dish_tag_id_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "name_am")
    private String nameAm;

    @Column(name = "name_ru")
    private String nameRu;
}
