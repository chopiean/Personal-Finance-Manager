package fi.haagahelia.financemanager.account;

import java.math.BigDecimal;

/**
 * DTO used in REST API for listing and creating accounts.
 */
public class AccountDto {

    private Long id;
    private String name;
    private AccountType type;
    private String currency;
    private BigDecimal initialBalance;

    public AccountDto() {
    }

    public AccountDto(Long id, String name, AccountType type,
                      String currency, BigDecimal initialBalance) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.currency = currency;
        this.initialBalance = initialBalance;
    }

    // Getters & setters

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
}
