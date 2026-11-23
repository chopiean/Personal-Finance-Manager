package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.transaction.TransactionService;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CsvImportService {

    static final CSVFormat FORMAT = CSVFormat.DEFAULT.builder()
            .setTrim(true)
            .setIgnoreEmptyLines(true)
            .build();

    private final TransactionService transactionService;

    public int importCsv(MultipartFile file, Long accountId, String username) {
        int imported = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = FORMAT.parse(reader)) {

            boolean first = true;

            for (CSVRecord row : parser) {
                if (first) {          
                    first = false;
                    continue;
                }
                if (row.size() < 5) continue;

                TransactionRequest req = TransactionRequest.builder()
                        .date(LocalDate.parse(row.get(0)))
                        .description(row.get(1))
                        .category(row.get(2))
                        .amount(Double.parseDouble(row.get(3)))
                        .type(TransactionType.valueOf(row.get(4)))
                        .accountId(accountId)
                        .build();

                transactionService.createTransactionFromCsv(req, username);
                imported++;
            }

        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import CSV: " + e.getMessage());
        }

        return imported;
    }
}