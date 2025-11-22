package fi.haagahelia.financemanager.budget.dto;

import lombok.*;

/**
 * Outgoing JSON payload returned to clients.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private Long id;

    private String category;

    private Double limitAmount;

    private Double usedAmount;

    private Double remaining;

    private Double usagePercent;

    private Long accountId;

    private String accountName;

    private int month;

    private int year;
}
