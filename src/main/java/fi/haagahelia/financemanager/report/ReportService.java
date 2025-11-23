package fi.haagahelia.financemanager.report;

import fi.haagahelia.financemanager.budget.Budget;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.report.dto.BudgetStatus;
import fi.haagahelia.financemanager.report.dto.CategorySummary;
import fi.haagahelia.financemanager.report.dto.MonthlyReportResponse;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Business logic for generating financial reports.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    /**
     * Generate an advanced monthly report.
     */
    @Transactional(readOnly = true)
    public MonthlyReportResponse getMonthlyReport(int year, int month, Long accountId) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // 1) Load transactions for the period
        List<Transaction> txs = (accountId == null)
                ? transactionRepository.findByDateBetween(start, end)
                : transactionRepository.findByAccountIdAndDateBetween(accountId, start, end);

        // 2) Aggregate totals
        double totalIncome = txs.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpense = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double net = totalIncome - totalExpense;

        // 3) Category breakdown (we treat description as category label)
        Map<String, CategorySummary> byCategory = new HashMap<>();

        for (Transaction t : txs) {
            String category = Optional.ofNullable(t.getDescription())
                    .filter(s -> !s.isBlank())
                    .orElse("Uncategorized");

            CategorySummary summary = byCategory.computeIfAbsent(
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

        List<CategorySummary> categoryList = byCategory.values()
                .stream()
                .sorted(Comparator.comparing(CategorySummary::getCategory))
                .toList();

        // 4) Budget comparison
        List<Budget> budgets = (accountId == null)
                ? budgetRepository.findByYearAndMonth(year, month)
                : budgetRepository.findByAccountIdAndYearAndMonth(accountId, year, month);

        // Map description/category -> total expenses
        Map<String, Double> expenseByCategory = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> Optional.ofNullable(t.getDescription())
                                .filter(s -> !s.isBlank())
                                .orElse("Uncategorized"),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        List<BudgetStatus> budgetStatuses = budgets.stream()
                .map(b -> {
                    String cat = Optional.ofNullable(b.getCategory())
                            .filter(s -> !s.isBlank())
                            .orElse("Uncategorized");

                    double actual = expenseByCategory.getOrDefault(cat, 0.0);
                    double diff = b.getLimitAmount() - actual;

                    return BudgetStatus.builder()
                            .category(cat)
                            .budgetLimit(
                                    b.getLimitAmount() == null ? 0.0 : b.getLimitAmount()
                            )
                            .actualExpense(actual)
                            .difference(diff)
                            .overBudget(actual > (b.getLimitAmount() == null ? 0.0 : b.getLimitAmount()))
                            .build();
                })
                .sorted(Comparator.comparing(BudgetStatus::getCategory))
                .toList();

        // 5) Build final DTO
        return MonthlyReportResponse.builder()
                .year(year)
                .month(month)
                .accountId(accountId)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(net)
                .categories(categoryList)
                .budgetStatuses(budgetStatuses)
                .build();
    }
}
