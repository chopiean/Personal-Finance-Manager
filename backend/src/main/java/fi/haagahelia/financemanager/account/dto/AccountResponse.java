package fi.haagahelia.financemanager.account.dto;

import fi.haagahelia.financemanager.account.AccountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Outgoing payload when returning account data to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private Long id;

    private String name;

    private String currency;

    private BigDecimal initialBalance;

    private AccountType type;

    private String description;

    private boolean archived;

    private LocalDate createdAt;

    private Long userId;
}
