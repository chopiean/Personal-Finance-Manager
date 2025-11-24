package fi.haagahelia.financemanager.budget.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Incoming JSON payload for creating a Budget.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetRequest {
    
    @NotNull
    private String category;

    @NotNull
    private Double limitAmount;

    @NotNull
    private Long accountId;

    @NotNull
    private int month;

    @NotNull
    private int year;
}
