package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for working with Transactions.
 *
 * - Validates that the Account exists
 * - Converts between Entity <-> DTO
 * - Provides methods for controllers (REST API layer)
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    /**
     * Create a new transaction for a given account.
     * @param req payload from client
     * @return created Transaction as DTO
     */
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest req) {
        // 1) Find the account
        Account account = accountRepository
                .findById(req.getAccountId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Account not found: " + req.getAccountId())
                );

        // 2) Build entity
        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
                .account(account)
                .build();

        // 3) Save to DB
        Transaction saved = transactionRepository.save(tx);

        // 4) Convert to response DTO
        return toResponse(saved);
    }

    /**
     * Get all transactions in the system.
     * Later you can filter by user or account.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get all transactions belonging to a specific account.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByAccount(Long accountId) {
        return transactionRepository.findByAccountId(accountId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Delete a transaction by ID.
     */
    @Transactional
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    /**
     * Convert entity -> DTO.
     * Centralized so that all controllers get the same shape.
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
}
