package am.foodme.backend.model;

import jakarta.persistence.*;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/** Snapshot of a dish at the moment it was ordered. */
@Entity
@Table(name = "order_dish", schema = "foodme")
@Getter
@Setter
public class OrderDish {

    @OneToMany(mappedBy = "orderDish", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderDishAddition> additions;

    @Id
    @SequenceGenerator(name = "order_dish_id_seq", sequenceName = "foodme.order_dish_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_dish_id_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "name_am")
    private String nameAm;

    @Column(name = "name_ru")
    private String nameRu;

    @Column(name = "price")
    private Double price;

    @Column(name = "url")
    private String url;

    @Column(name = "quantity")
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "dish_id")
    private Dish dish;
}
