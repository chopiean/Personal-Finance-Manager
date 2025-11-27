package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
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

    private String normalizeCategory(String raw) {
        if (raw == null || raw.isBlank()) {
            return "Uncategorized";
        }
        return raw.trim();
    }

    /**
     * Create transaction for logged-in user.
     */
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest req, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Account account = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Account does not belong to user");
        }

        String category = normalizeCategory(req.getCategory());

        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
                .category(category)          
                .account(account)
                .user(user)
                .build();

        return toResponse(transactionRepository.save(tx));
    }

    /**
     * CSV Import Path (no username available)
     * → Attach the transaction's user based on the account owner.
     */
    @Transactional
    public TransactionResponse createTransactionFromCsv(TransactionRequest req) {

        Account account = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        User user = account.getUser();

        String category = normalizeCategory(req.getCategory());

        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
                .category(category)          
                .account(account)
                .user(user)
                .build();

        return toResponse(transactionRepository.save(tx));
    }

    /**
     * Get ALL transactions belonging to a user.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactionsForUser(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        return transactionRepository
                .findByAccountUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get all transactions for a specific ACCOUNT, but only if it belongs to the user.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByAccount(Long accountId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        Account account = accountRepository.findById(accountId)
                .orElseThrow();

        if (!account.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        return transactionRepository
                .findByAccountId(accountId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Delete a transaction ONLY if it belongs to the logged-in user.
     */
    @Transactional
    public void deleteTransaction(Long id, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!tx.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        transactionRepository.delete(tx);
    }

    /**
     * Convert Entity → DTO.
     */
    private TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .description(tx.getDescription())
                .amount(tx.getAmount())
                .date(tx.getDate())
                .type(tx.getType())
                .category(
                        Optional.ofNullable(tx.getCategory())
                                .filter(s -> !s.isBlank())
                                .orElse("Uncategorized")
                )
                .accountId(tx.getAccount().getId())
                .accountName(tx.getAccount().getName())
                .build();
    }

    /**
     * Monthly summary restricted per user (simple totals).
     * For advanced budgets + categories you already have ReportService.
     */
    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary(String username, int year, int month) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        var transactions =
                transactionRepository.findByAccountUserIdAndDateBetween(
                        user.getId(), start, end
                );

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        return MonthlySummaryResponse.builder()
                .year(year)
                .month(month)
                .accountId(null) 
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome - totalExpense)
                .categories(Collections.emptyList())
                .budgetStatuses(Collections.emptyList())
                .build();
    }
}
