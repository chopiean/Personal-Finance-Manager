package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;
import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    /**
     * CREATE BUDGET
     */
    @Transactional
    public BudgetResponse createBudget(BudgetRequest req, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Account acc = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!acc.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Account does not belong to user");
        }

        Budget budget = Budget.builder()
                .category(req.getCategory())
                .limitAmount(req.getLimitAmount())
                .month(req.getMonth())
                .year(req.getYear())
                .account(acc)
                .user(user)        
                .build();

        return toResponse(budgetRepository.save(budget));
    }


    /**
     * LIST BUDGETS (Optionally by account)
     */
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(String username, Long accountId, int year, int month) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        List<Budget> budgets;

        if (accountId != null) {
            budgets = budgetRepository.findByAccountIdAndYearAndMonth(accountId, year, month);
        } else {
            budgets = budgetRepository.findByAccountUserIdAndYearAndMonth(user.getId(), year, month);
        }

        return budgets.stream().map(this::toResponse).toList();
    }

    /**
     * UPDATE BUDGET
     */
    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest req, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        if (!budget.getAccount().getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        Account acc = accountRepository.findById(req.getAccountId())
                .orElseThrow();

        if (!acc.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized account");
        }

        budget.setCategory(req.getCategory().trim());
        budget.setLimitAmount(req.getLimitAmount());
        budget.setMonth(req.getMonth());
        budget.setYear(req.getYear());
        budget.setAccount(acc);

        return toResponse(budgetRepository.save(budget));
    }

    /**
     * DELETE BUDGET
     */
    @Transactional
    public void deleteBudget(Long id, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        if (!budget.getAccount().getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        budgetRepository.delete(budget);
    }

    /**
     * Convert entity → DTO
     */
    private BudgetResponse toResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .limitAmount(budget.getLimitAmount())
                .month(budget.getMonth())
                .year(budget.getYear())
                .accountId(budget.getAccount().getId())
                .build();
    }
}
