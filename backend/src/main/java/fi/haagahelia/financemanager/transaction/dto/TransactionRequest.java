package fi.haagahelia.financemanager.transaction.dto;

import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotNull
    private String description;

    @NotNull
    private Double amount;

    @NotNull
    private LocalDate date;

    @NotNull
    private TransactionType type;

    @NotNull
    private Long accountId;

    private String category;
}
