package am.foodme.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admin", schema = "foodme")
@Getter
@Setter
public class Admin {

    @Id
    @SequenceGenerator(name = "admin_id_seq", sequenceName = "foodme.admin_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "admin_id_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "password_hash")
    private String passwordHash;

    /** ADMIN | VIEWER */
    @Column(name = "role")
    private String role;
}
