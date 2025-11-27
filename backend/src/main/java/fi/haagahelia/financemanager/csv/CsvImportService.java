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
     * CSV format (no accountId column):
     * date,description,amount,type
     */
    public int importCsv(MultipartFile file, Long accountId) {
        int count = 0;
    
        try (var reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
    
            reader.readLine(); // Skip header
            String line;
    
            while ((line = reader.readLine()) != null) {
    
                String[] parts = line.split(",");
    
                if (parts.length < 4) {
                    throw new RuntimeException("Invalid CSV format: " + line);
                }
    
                LocalDate date = LocalDate.parse(parts[0].trim());
                String description = parts[1].trim();
                Double amount = Double.parseDouble(parts[2].trim());
                TransactionType type = TransactionType.valueOf(parts[3].trim().toUpperCase());
    
                TransactionRequest req = TransactionRequest.builder()
                        .description(description)
                        .amount(amount)
                        .date(date)
                        .type(type)
                        .accountId(accountId)   
                        .build();
    
                transactionService.createTransactionFromCsv(req);
                count++;
            }
    
        } catch (Exception e) {
            throw new RuntimeException("Failed to import CSV: " + e.getMessage());
        }
    
        return count;
    }
    
}
