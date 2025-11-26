package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
            @AuthenticationPrincipal UserDetails principal
    ) {
        return budgetService.createBudget(req, principal.getUsername());
    }

    @GetMapping
    public List<BudgetResponse> getBudgets(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long accountId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return budgetService.getBudgets(principal.getUsername(), accountId, year, month);
    }

    @PutMapping("/{id}")
    public BudgetResponse updateBudget(
            @PathVariable Long id,
            @RequestBody BudgetRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return budgetService.updateBudget(id, req, principal.getUsername());
    }

    @DeleteMapping("/{id}")
    public void deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        budgetService.deleteBudget(id, principal.getUsername());
    }
}
