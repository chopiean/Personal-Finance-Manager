package fi.haagahelia.financemanager.assistant;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.budget.Budget;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.user.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Builds a plain-text snapshot of the user's finances that is sent to the AI
 * as context. Only the current user's data is included.
 */

@Component 
public class FinanceContextBuilder {

    private static final int RECENT_LIMIT = 30;
    private static final int MONTHS_OF_HISTORY = 3;

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public FinanceContextBuilder(AccountRepository accountRepository,
                                 TransactionRepository transactionRepository,
                                 BudgetRepository budgetRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }

    public String build(User user) {
        return build(user, LocalDate.now());
    }

    /** Package-private so tests can pass a fixed date. */
    String build(User user, LocalDate today) {
        YearMonth thisMonth = YearMonth.from(today);

        List<Account> accounts = accountRepository.findByUserId(user.getId());
        List<Transaction> transactions = transactionRepository.findByAccountUserId(user.getId());
        List<Budget> budgets = budgetRepository.findByAccountUserIdAndYearAndMonth(
                user.getId(), thisMonth.getYear(), thisMonth.getMonthValue());

        StringBuilder sb = new StringBuilder();
        sb.append("Today: ").append(today).append("\n\n");

        appendAccounts(sb, accounts, transactions);
        appendMonthSummary(sb, transactions, thisMonth);
        appendCategoryHistory(sb, transactions, thisMonth);
        appendBudgets(sb, budgets, transactions, thisMonth);
        appendRecent(sb, transactions);

        return sb.toString();
    }

    // ---------- sections ----------

    private void appendAccounts(StringBuilder sb, List<Account> accounts, List<Transaction> txs) {
        Map<Long, Double> netByAccount = txs.stream()
                .collect(Collectors.groupingBy(t -> t.getAccount().getId(),
                        Collectors.summingDouble(this::signed)));

        sb.append("ACCOUNTS\n");
        double total = 0;
        int shown = 0;
        for (Account a : accounts) {
            if (a.isArchived()) continue;
            double balance = a.getInitialBalance().doubleValue()
                    + netByAccount.getOrDefault(a.getId(), 0.0);
            total += balance;
            shown++;
            sb.append(fmt("- %s (%s, %s): balance %.2f%n",
                    a.getName(), a.getType(), a.getCurrency(), balance));
        }
        if (shown == 0) sb.append("- (no accounts)\n");
        sb.append(fmt("Total balance: %.2f%n%n", total));
    }

    private void appendMonthSummary(StringBuilder sb, List<Transaction> txs, YearMonth month) {
        double income = sum(txs, month, TransactionType.INCOME);
        double expenses = sum(txs, month, TransactionType.EXPENSE);
        double savingsRate = income > 0 ? (income - expenses) / income * 100 : 0;

        sb.append("THIS MONTH (").append(month).append(")\n");
        sb.append(fmt("Income %.2f, expenses %.2f, net %.2f, savings rate %.0f%%%n%n",
                income, expenses, income - expenses, savingsRate));
    }

    private void appendCategoryHistory(StringBuilder sb, List<Transaction> txs, YearMonth thisMonth) {
        sb.append("EXPENSES BY CATEGORY (last ").append(MONTHS_OF_HISTORY).append(" months)\n");
        for (int i = MONTHS_OF_HISTORY - 1; i >= 0; i--) {
            YearMonth ym = thisMonth.minusMonths(i);
            Map<String, Double> byCategory = txs.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE && inMonth(t, ym))
                    .collect(Collectors.groupingBy(t -> category(t),
                            Collectors.summingDouble(Transaction::getAmount)));

            String line = byCategory.isEmpty() ? "no expenses"
                    : byCategory.entrySet().stream()
                        .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                        .map(e -> fmt("%s %.2f", e.getKey(), e.getValue()))
                        .collect(Collectors.joining(", "));
            sb.append("- ").append(ym).append(": ").append(line).append("\n");
        }
        sb.append("\n");
    }

    private void appendBudgets(StringBuilder sb, List<Budget> budgets,
                               List<Transaction> txs, YearMonth month) {
        sb.append("BUDGETS THIS MONTH\n");
        if (budgets.isEmpty()) {
            sb.append("- (no budgets set)\n\n");
            return;
        }
        for (Budget b : budgets) {
            double limit = b.getLimitAmount() == null ? 0 : b.getLimitAmount();
            double spent = txs.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE && inMonth(t, month))
                    .filter(t -> category(t).equalsIgnoreCase(b.getCategory()))
                    .mapToDouble(Transaction::getAmount)
                    .sum();
            sb.append(fmt("- %s: limit %.2f, spent %.2f, remaining %.2f%s%n",
                    b.getCategory(), limit, spent, limit - spent,
                    spent > limit ? " (OVER BUDGET)" : ""));
        }
        sb.append("\n");
    }

    private void appendRecent(StringBuilder sb, List<Transaction> txs) {
        sb.append("RECENT TRANSACTIONS (newest first, max ").append(RECENT_LIMIT).append(")\n");
        List<Transaction> recent = txs.stream()
                .filter(t -> t.getDate() != null)
                .sorted(Comparator.comparing(Transaction::getDate).reversed())
                .limit(RECENT_LIMIT)
                .toList();
        if (recent.isEmpty()) sb.append("- (no transactions)\n");
        for (Transaction t : recent) {
            sb.append(fmt("- %s | %s | %s | %s | %.2f | %s%n",
                    t.getDate(), t.getType(), category(t),
                    t.getDescription() == null ? "-" : t.getDescription(),
                    t.getAmount(), t.getAccount().getName()));
        }
    }

    // ---------- helpers ----------

    private double signed(Transaction t) {
        return t.getType() == TransactionType.INCOME ? t.getAmount() : -t.getAmount();
    }

    private boolean inMonth(Transaction t, YearMonth ym) {
        return t.getDate() != null && YearMonth.from(t.getDate()).equals(ym);
    }

    private double sum(List<Transaction> txs, YearMonth month, TransactionType type) {
        return txs.stream()
                .filter(t -> t.getType() == type && inMonth(t, month))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    private String category(Transaction t) {
        return (t.getCategory() == null || t.getCategory().isBlank())
                ? "Uncategorized" : t.getCategory();
    }

    private String fmt(String pattern, Object... args) {
        return String.format(Locale.ROOT, pattern, args);
    }
}