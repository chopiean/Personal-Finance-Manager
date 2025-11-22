package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing financial transactions.
 *
 * Provides endpoints for:
 * - Creating a new transaction
 * - Listing all transactions
 * - Listing transactions for a specific account
 * - Deleting a transaction
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Create a new financial transaction.
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> create(@RequestBody TransactionRequest req) {
        return ResponseEntity.ok(transactionService.createTransaction(req));
    }

    /**
     * Get all transactions in the system.
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAll() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    /**
     * Get all transactions belonging to a specific account.
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getByAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getTransactionsByAccount(accountId));
    }

    /**
     * Delete a transaction by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
