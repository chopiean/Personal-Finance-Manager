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

        // -----------------------------------------------------
        // 1) LOAD TRANSACTIONS FOR USER (OR SPECIFIC ACCOUNT)
        // -----------------------------------------------------
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

        // -----------------------------------------------------
        // 2) TOTAL INCOME + TOTAL EXPENSE
        // -----------------------------------------------------
        double income = txs.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expense = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double net = income - expense;

        // -----------------------------------------------------
        // 3) CATEGORY SUMMARY (use t.getCategory)
        // -----------------------------------------------------
        Map<String, CategorySummary> categories = new HashMap<>();

        for (Transaction t : txs) {
            String category = Optional.ofNullable(t.getCategory())
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

        // -----------------------------------------------------
        // 4) LOAD BUDGETS FOR USER OR ACCOUNT
        // -----------------------------------------------------
        List<Budget> budgets;

        if (accountId != null) {
            budgets = budgetRepository.findByAccountIdAndYearAndMonth(accountId, year, month);
        } else {
            budgets = budgetRepository.findByAccountUserIdAndYearAndMonth(
                    user.getId(), year, month
            );
        }

        // -----------------------------------------------------
        // 5) EXPENSE BY CATEGORY FOR BUDGET COMPARISON
        // -----------------------------------------------------
        Map<String, Double> expenseByCategory = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> Optional.ofNullable(t.getCategory())
                                .filter(s -> !s.isBlank())
                                .orElse("Uncategorized"),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        // -----------------------------------------------------
        // 6) BUILD BUDGET STATUSES
        // -----------------------------------------------------
        List<BudgetStatus> budgetStatuses = budgets.stream()
                .map(b -> {
                    String cat = Optional.ofNullable(b.getCategory())
                            .filter(s -> !s.isBlank())
                            .orElse("Uncategorized");

                    double actual = expenseByCategory.getOrDefault(cat, 0.0);
                    double limit = Optional.ofNullable(b.getLimitAmount()).orElse(0.0);
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

        // -----------------------------------------------------
        // 7) FINAL RESPONSE
        // -----------------------------------------------------
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
