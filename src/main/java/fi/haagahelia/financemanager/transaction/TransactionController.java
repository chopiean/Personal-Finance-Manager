package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for managing Transactions
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Create a single transaction from JSON payload.
     */
    @PostMapping
    public TransactionResponse create(@Valid @RequestBody TransactionRequest req) {
        return transactionService.createTransaction(req);
    }

    /**
     * Get all transactions in the system.
     */
    @GetMapping
    public List<TransactionResponse> getAll() {
        return transactionService.getAllTransactions();
    }

    /**
     * Get all transactions for a specific account.
     */
    @GetMapping("/account/{accountId}")
    public List<TransactionResponse> getByAccount(@PathVariable Long accountId) {
        return transactionService.getTransactionsByAccount(accountId);
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
