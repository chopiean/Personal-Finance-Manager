package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public TransactionResponse create(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody TransactionRequest req
    ) {
        return transactionService.createTransaction(req, principal.getUsername());
    }

    @GetMapping
    public List<TransactionResponse> getAll(
            @AuthenticationPrincipal UserDetails principal
    ) {
        return transactionService.getAllTransactionsForUser(principal.getUsername());
    }

    @GetMapping("/account/{accountId}")
    public List<TransactionResponse> getByAccount(
            @PathVariable Long accountId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return transactionService.getTransactionsByAccount(accountId, principal.getUsername());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        transactionService.deleteTransaction(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary/monthly")
    public MonthlySummaryResponse getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return transactionService.getMonthlySummary(principal.getUsername(), year, month);
    }
}
