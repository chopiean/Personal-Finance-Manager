package fi.haagahelia.financemanager.report;

import fi.haagahelia.financemanager.report.dto.MonthlyReportResponse;
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

    @GetMapping("/monthly")
    public MonthlyReportResponse getMonthlyReport(
        @RequestParam int year,
        @RequestParam int month,
        @RequestParam(required = false) Long accountId
    ) {
        return reportService.getMonthlyReport(year, month, accountId);
    }
}
