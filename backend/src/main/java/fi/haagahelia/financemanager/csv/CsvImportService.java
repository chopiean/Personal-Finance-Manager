package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.transaction.TransactionService;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;

/**
 * Handles reading CSV files and importing them as Transactions.
 */
@Service
@RequiredArgsConstructor
public class CsvImportService {

    private final TransactionService transactionService;

    /**
     * Reads CSV file and imports all rows as transactions.
     */
    public int importCsv(MultipartFile file) {
        int count = 0;

        try (var reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {

            reader.readLine(); // Skip header
            String line;

            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");

                LocalDate date = LocalDate.parse(parts[0]);
                String description = parts[1];
                Double amount = Double.parseDouble(parts[2]);
                TransactionType type = TransactionType.valueOf(parts[3]);
                Long accountId = Long.parseLong(parts[4]);

                TransactionRequest req = TransactionRequest.builder()
                        .description(description)
                        .amount(amount)
                        .date(date)
                        .type(type)
                        .accountId(accountId)
                        .build();

                // 🔥 NEW: For CSV, use the CSV-specific method
                transactionService.createTransactionFromCsv(req);
                count++;
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to import CSV: " + e.getMessage());
        }

        return count;
    }
}
