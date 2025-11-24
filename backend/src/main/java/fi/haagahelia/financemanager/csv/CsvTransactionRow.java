package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.Data;

/**
 * Represents a single row from a CSV file.
 */
@Data
public class CsvTransactionRow {
    
    private String description;
    private Double amount;
    private String date;
    private TransactionType type;
    private Long accountId;
}
