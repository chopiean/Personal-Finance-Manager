package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public BudgetResponse createBudget(
            @RequestBody BudgetRequest req,
            @RequestAttribute("username") String username
    ) {
        return budgetService.createBudget(req, username);
    }

    @GetMapping
    public List<BudgetResponse> getBudgets(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long accountId,
            @RequestAttribute("username") String username
    ) {
        return budgetService.getBudgets(username, accountId, year, month);
    }

    @PutMapping("/{id}")
    public BudgetResponse updateBudget(
            @PathVariable Long id,
            @RequestBody BudgetRequest req,
            @RequestAttribute("username") String username
    ) {
        return budgetService.updateBudget(id, req, username);
    }

    @DeleteMapping("/{id}")
    public void deleteBudget(
            @PathVariable Long id,
            @RequestAttribute("username") String username
    ) {
        budgetService.deleteBudget(id, username);
    }
}
