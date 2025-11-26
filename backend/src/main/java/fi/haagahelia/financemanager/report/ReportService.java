package fi.haagahelia.financemanager.report;

import fi.haagahelia.financemanager.budget.Budget;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.report.dto.BudgetStatus;
import fi.haagahelia.financemanager.report.dto.CategorySummary;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary(
            int year,
            int month,
            Long accountId,
            String username
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // --- 1. LOAD USER TRANSACTIONS ---
        List<Transaction> txs;
        if (accountId == null) {
            txs = transactionRepository.findByAccountUserIdAndDateBetween(
                    user.getId(), start, end
            );
        } else {
            txs = transactionRepository.findByAccountIdAndDateBetween(
                    accountId, start, end
            );
        }

        // --- 2. SUMMARIZE TOTALS ---
        double income = txs.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expense = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double net = income - expense;

        // --- 3. CATEGORY SUMMARY ---
        Map<String, CategorySummary> categories = new HashMap<>();

        for (Transaction t : txs) {
            String category = Optional.ofNullable(t.getDescription())
                    .filter(s -> !s.isBlank())
                    .orElse("Uncategorized");

            CategorySummary summary = categories.computeIfAbsent(
                    category,
                    c -> CategorySummary.builder()
                            .category(c)
                            .totalIncome(0)
                            .totalExpense(0)
                            .net(0)
                            .build()
            );

            if (t.getType() == TransactionType.INCOME) {
                summary.setTotalIncome(summary.getTotalIncome() + t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                summary.setTotalExpense(summary.getTotalExpense() + t.getAmount());
            }

            summary.setNet(summary.getTotalIncome() - summary.getTotalExpense());
        }

        List<CategorySummary> categoryList = categories.values()
                .stream()
                .sorted(Comparator.comparing(CategorySummary::getCategory))
                .toList();

        // --- 4. LOAD USER BUDGETS ONLY ---
        // 4) Budget comparison
        List<Budget> budgets;

                if (accountId != null) {
                // Load budgets for a specific account
                budgets = budgetRepository.findByAccountIdAndYearAndMonth(accountId, year, month);
                } else {
                // Load all budgets for the logged-in user
                budgets = budgetRepository.findByAccountUserIdAndYearAndMonth(
                        user.getId(), year, month
                );
        }

        // group expenses by category
        Map<String, Double> expenseByCategory = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> Optional.ofNullable(t.getDescription())
                                .filter(s -> !s.isBlank())
                                .orElse("Uncategorized"),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        // build budget statuses
        List<BudgetStatus> budgetStatuses = budgets.stream()
                .map(b -> {
                    String cat = Optional.ofNullable(b.getCategory())
                            .filter(s -> !s.isBlank())
                            .orElse("Uncategorized");

                    double actual = expenseByCategory.getOrDefault(cat, 0.0);
                    double limit = b.getLimitAmount() == null ? 0.0 : b.getLimitAmount();
                    double diff = limit - actual;

                    return BudgetStatus.builder()
                            .category(cat)
                            .budgetLimit(limit)
                            .actualExpense(actual)
                            .difference(diff)
                            .overBudget(actual > limit)
                            .build();
                })
                .sorted(Comparator.comparing(BudgetStatus::getCategory))
                .toList();

        // --- 5. FINAL RESPONSE ---
        return MonthlySummaryResponse.builder()
                .year(year)
                .month(month)
                .accountId(accountId)
                .totalIncome(income)
                .totalExpense(expense)
                .netBalance(net)
                .categories(categoryList)
                .budgetStatuses(budgetStatuses)
                .build();
    }
}
