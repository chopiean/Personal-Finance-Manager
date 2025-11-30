package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.budget.Budget;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.report.dto.BudgetStatus;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;

    private String normalizeCategory(String raw) {
        if (raw == null || raw.isBlank()) return "Uncategorized";
        return raw.trim();
    }

    // ---------------------------------------------------------
    // CREATE Transaction (Frontend form)
    // ---------------------------------------------------------
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest req, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Account account = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Account does not belong to user");
        }

        String category = normalizeCategory(
                req.getCategory() == null || req.getCategory().isBlank()
                        ? req.getDescription()
                        : req.getCategory()
        );
        

        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .category(category)
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
                .account(account)
                .user(user)
                .build();

        return toResponse(transactionRepository.save(tx));
    }

    // ---------------------------------------------------------
    // CREATE Transaction (CSV Import - user auto detected)
    // ---------------------------------------------------------
    @Transactional
    public TransactionResponse createTransactionFromCsv(TransactionRequest req) {

        Account account = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        User user = account.getUser();
        String category = normalizeCategory(
        req.getCategory() == null || req.getCategory().isBlank()
                ? req.getDescription()
                : req.getCategory()
);


        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .category(category)
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
                .account(account)
                .user(user)
                .build();

        return toResponse(transactionRepository.save(tx));
    }

    // ---------------------------------------------------------
    // GET ALL user transactions
    // ---------------------------------------------------------
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactionsForUser(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();

        return transactionRepository.findByAccountUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // GET ALL by account
    // ---------------------------------------------------------
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByAccount(Long accountId, String username) {

        User user = userRepository.findByUsername(username).orElseThrow();

        Account account = accountRepository.findById(accountId).orElseThrow();
        if (!account.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        return transactionRepository.findByAccountId(accountId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // DELETE Transaction
    // ---------------------------------------------------------
    @Transactional
    public void deleteTransaction(Long id, String username) {

        User user = userRepository.findByUsername(username).orElseThrow();

        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!tx.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        transactionRepository.delete(tx);
    }

    // ---------------------------------------------------------
    // ENTITY -> DTO
    // ---------------------------------------------------------
    private TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .description(tx.getDescription())
                .category(Optional.ofNullable(tx.getCategory()).orElse("Uncategorized"))
                .amount(tx.getAmount())
                .date(tx.getDate())
                .type(tx.getType())
                .accountId(tx.getAccount().getId())
                .accountName(tx.getAccount().getName())
                .build();
    }

    // ---------------------------------------------------------
    // SIMPLE Monthly Summary (Dashboard)
    // ---------------------------------------------------------
    @Transactional(readOnly = true)
        public MonthlySummaryResponse getMonthlySummary(String username, int year, int month) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        // 1. Fetch budgets for user + month
        List<Budget> budgets = budgetRepository
                .findByAccountUserIdAndYearAndMonth(user.getId(), year, month);

        // 2. Build BudgetStatus list
        List<BudgetStatus> budgetStatuses = budgets.stream().map(budget -> {

                // Calculate spent for category
                double actualExpense = transactionRepository.sumExpensesByCategory(
                        user.getId(),
                        budget.getCategory(),
                        start,
                        end
                );

                double difference = budget.getLimitAmount() - actualExpense;

                return BudgetStatus.builder()
                        .category(budget.getCategory())
                        .budgetLimit(budget.getLimitAmount())
                        .actualExpense(actualExpense)
                        .difference(difference)
                        .overBudget(difference < 0)
                        .build();

        }).toList();

        // 3. Compute full income / expense totals for month
        var txs = transactionRepository.findByAccountUserIdAndDateBetween(
                user.getId(), start, end
        );

        double income = txs.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expense = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        // 4. Return Monthly Summary
        return MonthlySummaryResponse.builder()
                .year(year)
                .month(month)
                .accountId(null)
                .totalIncome(income)
                .totalExpense(expense)
                .netBalance(income - expense)
                .categories(Collections.emptyList())
                .budgetStatuses(budgetStatuses)
                .build();
        }

}
