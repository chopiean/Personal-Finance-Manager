package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/csv")
@RequiredArgsConstructor
public class CsvExportController {

    private final TransactionRepository transactionRepository;

    @GetMapping("/transactions")
    public ResponseEntity<byte[]> exportAll() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = auth.getName();  

        List<Transaction> list = transactionRepository.findByUserUsername(username);

        StringBuilder sb = new StringBuilder();
        sb.append("date,description,amount,type,account\n");

        for (Transaction t : list) {
            sb.append(t.getDate()).append(",")
              .append(t.getDescription()).append(",")
              .append(t.getAmount()).append(",")
              .append(t.getType()).append(",")
              .append(t.getAccount().getName())
              .append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=transactions.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
