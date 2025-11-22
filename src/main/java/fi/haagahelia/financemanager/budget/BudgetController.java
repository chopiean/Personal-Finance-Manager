package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for Budget operations.
 */
@RestController
@RequestMapping("api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    
    private final BudgetService budgetService;

    /**
     * Create a new monthly budget.
     */
    @PostMapping
    public BudgetResponse create(@RequestBody BudgetRequest req) {
        return budgetService.create(req);
    }

    /**
     * Get all budgets for a given account during a specific month/year
     */
    public List<BudgetResponse> getByAccount(
        @PathVariable Long accountId,
        @PathVariable int month,
        @PathVariable int year
    ) {
        return budgetService.getByAccount(accountId, month, year);
    }
}
