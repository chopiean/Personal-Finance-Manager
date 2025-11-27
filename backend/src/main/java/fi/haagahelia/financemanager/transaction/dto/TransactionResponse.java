package fi.haagahelia.financemanager.transaction.dto;

import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;

    private String description;

    private Double amount;

    private LocalDate date;

    private TransactionType type;

    private Long accountId;

    private String accountName;

    private String category;
}
