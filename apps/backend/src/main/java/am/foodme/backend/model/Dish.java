package am.foodme.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dish", schema = "foodme")
@Getter
@Setter
public class Dish {

    @Id
    @SequenceGenerator(name = "dish_id_seq", sequenceName = "foodme.dish_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dish_id_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "name_am")
    private String nameAm;

    @Column(name = "name_ru")
    private String nameRu;

    @Column(name = "description_en", length = 1000)
    private String descriptionEn;

    @Column(name = "price")
    private Double price;

    @Column(name = "url")
    private String url;

    @Column(name = "portion_en")
    private String portionEn;

    @Column(name = "portion_am")
    private String portionAm;

    @Column(name = "portion_ru")
    private String portionRu;

    /** ACTIVE | INACTIVE */
    @Column(name = "status")
    private String status;

    @Column(name = "minimum_order_count")
    private int minimumOrderCount;

    @Column(name = "priority_index")
    private Integer priorityIndex;

    @ManyToOne
    @JoinColumn(name = "chef_id", referencedColumnName = "id")
    private Chef chef;

    @ManyToOne
    @JoinColumn(name = "dish_tag_id")
    private DishTag dishTag;
}
