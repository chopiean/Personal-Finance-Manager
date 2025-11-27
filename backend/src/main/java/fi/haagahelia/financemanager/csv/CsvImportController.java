package fi.haagahelia.financemanager.csv;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST endpoint for uploading CSV files.
 */
@RestController
@RequestMapping("/api/csv")
@RequiredArgsConstructor
public class CsvImportController {
    
    private final CsvImportService csvImportService;

    /**
     * Upload & import CSV file.
     */
    @PostMapping("/import")
    public ResponseEntity<?> uploadCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("accountId") Long accountId
    ) {
        int count = csvImportService.importCsv(file, accountId);
        return ResponseEntity.ok(count + " transactions imported");
    }

}
