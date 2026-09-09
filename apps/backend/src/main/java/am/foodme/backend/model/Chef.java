package am.foodme.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "chef", schema = "foodme")
@Getter
@Setter
public class Chef {

    @Id
    @SequenceGenerator(name = "chef_id_seq", sequenceName = "foodme.chef_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chef_id_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "banner_url")
    private String bannerUrl;

    /** ACTIVE | INACTIVE */
    @Column(name = "status")
    private String status;

    @Column(name = "full_name_en")
    private String fullNameEn;

    @Column(name = "full_name_am")
    private String fullNameAm;

    @Column(name = "full_name_ru")
    private String fullNameRu;

    @Column(name = "description_en", length = 2000)
    private String descriptionEn;

    @Column(name = "description_am", length = 2000)
    private String descriptionAm;

    @Column(name = "description_ru", length = 2000)
    private String descriptionRu;

    @Column(name = "kitchen_en")
    private String kitchenEn;

    @Column(name = "kitchen_am")
    private String kitchenAm;

    @Column(name = "kitchen_ru")
    private String kitchenRu;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "platform_fee")
    private Double platformFee;

    @Column(name = "delivery_price")
    private Double deliveryPrice;

    @Column(name = "free_delivery_from")
    private Double freeDeliveryFrom;

    @Column(name = "priority_index")
    private Integer priorityIndex;

    @OneToMany(mappedBy = "chef", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Dish> dishList;

    @OneToMany(mappedBy = "chef", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChefTagOrder> chefTagOrderList;
}
