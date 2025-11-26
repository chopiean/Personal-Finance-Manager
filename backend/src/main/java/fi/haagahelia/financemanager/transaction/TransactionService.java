package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;

import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;

import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

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

        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
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

        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
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
                .accountId(tx.getAccount().getId())
                .accountName(tx.getAccount().getName())
                .build();
    }

    /**
     * Monthly summary restricted per user.
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
                .filter(t -> t.getType().name().equals("INCOME"))
                .mapToDouble(t -> t.getAmount())
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getType().name().equals("EXPENSE"))
                .mapToDouble(t -> t.getAmount())
                .sum();

        return MonthlySummaryResponse.builder()
                .year(year)
                .month(month)
                .accountId(null) // summary of ALL accounts for this user
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome - totalExpense)
                .categories(Collections.emptyList())        
                .budgetStatuses(Collections.emptyList())    
                .build();
    }
}
