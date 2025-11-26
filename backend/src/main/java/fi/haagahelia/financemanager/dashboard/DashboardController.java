package fi.haagahelia.financemanager.dashboard;

import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public Map<String, Object> dashboard(@RequestAttribute("username") String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        // Load all accounts for the user
        var accounts = accountRepository.findByUser(user);

        // Load all transactions for the user through account → user
        var transactions = transactionRepository.findByAccountUserId(user.getId());

        // ---- TOTAL BALANCE ----
        double initialBalances = accounts.stream()
                .mapToDouble(a -> a.getInitialBalance().doubleValue())
                .sum();

        double transactionTotals = transactions.stream()
                .mapToDouble(t -> t.getType() == TransactionType.INCOME
                        ? t.getAmount()
                        : -t.getAmount())
                .sum();

        double totalBalance = initialBalances + transactionTotals;

        // ---- MONTH FILTER ----
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now().plusMonths(1).withDayOfMonth(1);

        double income = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .filter(t -> !t.getDate().isBefore(start) && t.getDate().isBefore(end))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .filter(t -> !t.getDate().isBefore(start) && t.getDate().isBefore(end))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double savingsRate = income > 0
                ? ((income - expenses) / income) * 100
                : 0;

        // ---- RECENT 10 ----
        var recent = transactions.stream()
                .sorted(Comparator.comparing(Transaction::getDate).reversed())
                .limit(10)
                .toList();

        return Map.of(
                "summary", Map.of(
                        "totalBalance", totalBalance,
                        "income", income,
                        "expenses", expenses,
                        "savingsRate", savingsRate
                ),
                "recentTransactions", recent
        );
    }
}
