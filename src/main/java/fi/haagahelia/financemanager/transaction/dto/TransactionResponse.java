package fi.haagahelia.financemanager.transaction.dto;

import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

/**
 * Outgoing response model used to return transaction data to the client.
 */
@Data
@Builder
public class TransactionResponse {
    
    private Long id;
    private String description;
    private double amount;
    private LocalDate date;
    private TransactionType type;

    private Long accounts;
    private String accountName;
}
