package fi.haagahelia.financemanager.report;

import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for financial reports.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    
    private final ReportService reportService;

    /**
     * Get a monthly financial summary
     */
    @GetMapping("/monthly")
    public MonthlySummaryResponse getMonthlyReport(
        @RequestParam int year,
        @RequestParam int month,
        @RequestParam(required = false) Long accountId
    ) {
        return reportService.getMonthlySummary(year, month, accountId);
    }
}
