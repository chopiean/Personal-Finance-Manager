package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for Budgets.
 */
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    /**
     * Create a new budget.
     */
    public BudgetResponse create(BudgetRequest req) {

        Account acc = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        Budget b = Budget.builder()
                .category(req.getCategory())
                .limitAmount(req.getLimitAmount())
                .account(acc)
                .month(req.getMonth())
                .year(req.getYear())
                .build();

        Budget saved = budgetRepository.save(b);

        return toResponse(saved);
    }

    /**
     * Read budgets for a specific account + month + year.
     */
    public List<BudgetResponse> getByAccount(Long id, int month, int year) {
        return budgetRepository.findByAccountIdAndMonthAndYear(id, month, year)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Convert entity → DTO and calculate dynamic metrics.
     */
    private BudgetResponse toResponse(Budget b) {

        // Calculate expenses for the month + year
        Double used = transactionRepository
                .findByAccountId(b.getAccount().getId())
                .stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .filter(t -> t.getDate().getMonthValue() == b.getMonth())
                .filter(t -> t.getDate().getYear() == b.getYear())
                .mapToDouble(t -> t.getAmount())
                .sum();

        Double remaining = b.getLimitAmount() - used;
        Double usage = (used / b.getLimitAmount()) * 100;

        return BudgetResponse.builder()
                .id(b.getId())
                .category(b.getCategory())
                .limitAmount(b.getLimitAmount())
                .usedAmount(used)
                .remaining(remaining)
                .usagePercent(usage)
                .accountId(b.getAccount().getId())
                .accountName(b.getAccount().getName())
                .month(b.getMonth())
                .year(b.getYear())
                .build();
    }
}
