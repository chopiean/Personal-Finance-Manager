package fi.haagahelia.financemanager.report.dto;

import lombok.*;
/**
 * Aggregated income/expense values for a single "category".
 */

 @Getter
 @Setter
 @NoArgsConstructor
 @AllArgsConstructor
 @Builder
public class CategorySummary {
    
    private String category;

    private double totalIncome;

    private double totalExpense;

    private double net;
}
