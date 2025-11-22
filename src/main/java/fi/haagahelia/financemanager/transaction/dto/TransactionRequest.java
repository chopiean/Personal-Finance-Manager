package fi.haagahelia.financemanager.transaction.dto;

import fi.haagahelia.financemanager.transaction.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

/**
 * Incoming payload for creating or updating a Transaction.
 *
 * This is what the client sends in JSON.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotNull
    private Long accountId;

    @NotNull
    @Size(min = 1, max = 255)
    private String description;

    @NotNull
    @Min(0)
    private Double amount;

    @NotNull
    private LocalDate date;

    @NotNull
    private TransactionType type;
}
