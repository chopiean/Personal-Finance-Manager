package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import fi.haagahelia.financemanager.util.CsvTransactionImporter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST API for managing Transactions.
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CsvTransactionImporter csvTransactionImporter;

    /**
     * Create a single transaction from JSON payload.
     */
    @PostMapping
    public TransactionResponse create(@Valid @RequestBody TransactionRequest req) {
        return transactionService.createTransaction(req);
    }

    /**
     * Import many transactions at once from a CSV file.
     */
    @PostMapping("/import")
    public List<TransactionResponse> importCsv(@RequestParam("file") MultipartFile file) {
        return csvTransactionImporter.importTransactions(file);
    }

    /**
     * Get all transactions.
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
     * Delete a transaction by id.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
