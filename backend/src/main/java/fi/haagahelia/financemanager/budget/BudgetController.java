package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for managing budgets.
 */
@RestController
@RequestMapping("/api/budgets")   
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * Create a new monthly budget.
     */
    @PostMapping
    public ResponseEntity<BudgetResponse> create(@RequestBody BudgetRequest req) {
        BudgetResponse created = budgetService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get all budgets for a specific account + month/year
     */
    @GetMapping("/{accountId}/{year}/{month}")
    public List<BudgetResponse> getByAccount(
            @PathVariable Long accountId,
            @PathVariable int year,
            @PathVariable int month
    ) {
        return budgetService.getByAccount(accountId, month, year);
    }
}
