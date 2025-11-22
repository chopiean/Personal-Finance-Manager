package fi.haagahelia.financemanager.account;

import fi.haagahelia.financemanager.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Represents one financial account belonging to a user.
 *
 * Examples:
 * - Cash wallet
 * - Bank account
 * - Credit card
 */
@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User-friendly account name, ex "OP Bank - Main"
    @Column(nullable = false)
    private String name;

    // Type of the account (BANK, CASH, CREDIT_CARD...)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    // ISO currency code, ex "EUR"
    @Column(nullable = false, length = 3)
    private String currency;

    // Optional initial balance when the account is created
    @Column(nullable = false)
    private BigDecimal initialBalance = BigDecimal.ZERO;

    // Owner of the account
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User user;

    // ---- Getters & setters ----

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public AccountType getType() {
        return type;
    }

    public String getCurrency() {
        return currency;
    }

    public BigDecimal getInitialBalance() {
        return initialBalance;
    }

    public User getUser() {
        return user;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(AccountType type) {
        this.type = type;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setInitialBalance(BigDecimal initialBalance) {
        this.initialBalance = initialBalance;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
