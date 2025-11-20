package fi.haagahelia.financemanager.user;

import jakarta.persistence.*;

/**
 * User entity stored in PostgreSQL.
 * This is used for authentication and authorization.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // unique username, can be email
    @Column(nullable = false, unique = true)
    private String username;

    // BCrypt-hashed password
    @Column(nullable = false)
    private String password;

    // simple role field (e.g. ROLE_USER, ROLE_ADMIN)
    @Column(nullable = false)
    private String role = "ROLE_USER";

    // Constructors
    public User() {
    }

    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Getters & setters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
