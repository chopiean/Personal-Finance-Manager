package fi.haagahelia.financemanager.report.dto;

import lombok.*;

/**
 * Shows how actual spending compares to the defined Budget.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetStatus {
    
    private String category;

    private double budgetLimit;

    private double actualExpense;

    private double difference;

    private boolean overBudget;
}
