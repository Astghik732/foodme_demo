package am.foodme.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** Per-chef ordering of menu sections. */
@Entity
@Table(name = "chef_tag_order", schema = "foodme")
@Getter
@Setter
public class ChefTagOrder {

    @Id
    @SequenceGenerator(name = "chef_tag_order_id_seq", sequenceName = "foodme.chef_tag_order_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chef_tag_order_id_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chef_id")
    private Chef chef;

    @ManyToOne
    @JoinColumn(name = "dish_tag_id")
    private DishTag dishTag;

    @Column(name = "priority_index")
    private Integer priorityIndex;
}
