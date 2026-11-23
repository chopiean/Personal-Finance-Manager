package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/csv")
@RequiredArgsConstructor
public class CsvExportController {

    static final CSVFormat FORMAT = CSVFormat.DEFAULT.builder()
            .setHeader("date", "description", "category", "amount", "type", "account")
            .build();

    private final TransactionRepository transactionRepository;

    @GetMapping("/transactions")
    public ResponseEntity<byte[]> exportAll() throws IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Transaction> list = transactionRepository.findByUserUsername(auth.getName());

        StringWriter out = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(out, FORMAT)) {
            for (Transaction t : list) {
                printer.printRecord(
                        t.getDate(),
                        t.getDescription(),
                        t.getCategory(),
                        t.getAmount(),
                        t.getType(),
                        t.getAccount().getName());
            }
        }

        byte[] bytes = out.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=transactions.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}