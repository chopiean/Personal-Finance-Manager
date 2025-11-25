package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import java.util.Collections;


import java.util.List;

/**
 * Business logic for working with Transactions.
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest req) {
        Account account = accountRepository
                .findById(req.getAccountId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Account not found: " + req.getAccountId())
                );

        Transaction tx = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount())
                .date(req.getDate())
                .type(req.getType())
                .account(account)
                .build();

        Transaction saved = transactionRepository.save(tx);

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

    /**
     * Temporary monthly summary until full reporting system is implemented.
     */
    public MonthlySummaryResponse getMonthlySummary(int year, int month) {
        return MonthlySummaryResponse.builder()
                .year(year)
                .month(month)
                .accountId(null)
                .totalIncome(0.0)
                .totalExpense(0.0)
                .netBalance(0.0)
                .categories(Collections.emptyList())
                .budgetStatuses(Collections.emptyList())
                .build();
    }
}
