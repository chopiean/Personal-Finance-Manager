package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.TransactionService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;


@Service
@RequiredArgsConstructor
public class CsvImportService {

    private final TransactionService transactionService;

    public int importCsv(MultipartFile file, Long accountId) {
        int imported = 0;

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
        )) {
            String line;
            boolean first = true;

            while ((line = br.readLine()) != null) {

                if (first) { 
                    first = false; 
                    continue; 
                }

                String[] columns = line.split(",");

                if (columns.length < 5) continue;

                String dateStr = columns[0].trim();
                String description = columns[1].trim();
                String category = columns[2].trim();
                double amount = Double.parseDouble(columns[3].trim());
                TransactionType type = TransactionType.valueOf(columns[4].trim());

                TransactionRequest req = TransactionRequest.builder()
                        .description(description)
                        .category(category)
                        .amount(amount)
                        .date(LocalDate.parse(dateStr))
                        .type(type)
                        .accountId(accountId)
                        .build();

                transactionService.createTransactionFromCsv(req);
                imported++;
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to import CSV: " + e.getMessage());
        }

        return imported;
    }
}
