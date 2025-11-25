package fi.haagahelia.financemanager.account.dto;

import fi.haagahelia.financemanager.account.AccountType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import lombok.*;

/**
 * Incoming payload when creating/updating an Account.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountRequest {

    @NotBlank
    @Size(min = 1, max = 255)
    private String name;

    @NotBlank
    @Size(min = 3, max = 3)
    private String currency;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal initialBalance;

    private AccountType type;

    @Size(max = 1000)
    private String description;
}
