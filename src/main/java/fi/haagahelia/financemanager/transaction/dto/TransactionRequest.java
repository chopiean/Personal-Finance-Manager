package fi.haagahelia.financemanager.transaction.dto;

import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.Data;

import java.time.LocalDate;

/**
 * Incoming request for creating or updating a transaction.
 */
@Data
public class TransactionRequest {
    
    private String description;
    private double amount;
    private LocalDate date;
    private TransactionType type;

    // ID of the account the transaction belongs to
    private Long accountId;
}
