package fi.haagahelia.financemanager.csv;

import lombok.RequiredArgsConstructor;
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
    public String importCsv(@RequestParam("file") MultipartFile file) {
        int imported = csvImportService.importCsv(file);
        return "Imported " + imported + " transactions.";
    }
}
