package fi.haagahelia.financemanager.report.dto;

import lombok.*;

import java.util.List;

/**
 * Advanced monthly report sent to the frontend.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReportResponse {

    private int year;
    private int month;

    private Long accountId;

    private double totalIncome;

    private double totalExpense;

    private double netBalance;

    private List<CategorySummary> categories;

    private List<BudgetStatus> budgetStatuses;
}
