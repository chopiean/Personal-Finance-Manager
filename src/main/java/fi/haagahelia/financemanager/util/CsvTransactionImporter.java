package fi.haagahelia.financemanager.util;

import fi.haagahelia.financemanager.transaction.TransactionService;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility component that imports Transactions from a CSV file.
 */
@Component
@RequiredArgsConstructor
public class CsvTransactionImporter {

    private final TransactionService transactionService;

    /**
     * Parse the uploaded CSV and create transactions for each valid row.
     */
    public List<TransactionResponse> importTransactions(MultipartFile file) {
        List<TransactionResponse> created = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line = reader.readLine();
            if (line == null) {
                return created;  
            }

            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");

                if (parts.length < 5) {
                    continue;
                }

                Long accountId = Long.parseLong(parts[0].trim());
                String description = parts[1].trim();
                Double amount = Double.parseDouble(parts[2].trim());
                LocalDate date = LocalDate.parse(parts[3].trim());
                TransactionType type = TransactionType.valueOf(parts[4].trim().toUpperCase());

                TransactionRequest req = TransactionRequest.builder()
                        .accountId(accountId)
                        .description(description)
                        .amount(amount)
                        .date(date)
                        .type(type)
                        .build();

                TransactionResponse response = transactionService.createTransaction(req);
                created.add(response);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to import CSV: " + e.getMessage(), e);
        }

        return created;
    }
}
