package fi.haagahelia.financemanager.transaction.dto;

import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.*;

import java.time.LocalDate;

/**
 * Outgoing payload sent back to the client
 * when reading Transactions.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;

    private String description;

    private double amount;

    private LocalDate date;

    private TransactionType type;

    private Long accountId;

    private String accountName;
}
