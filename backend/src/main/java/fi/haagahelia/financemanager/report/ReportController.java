package fi.haagahelia.financemanager.report;

import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly")
    public MonthlySummaryResponse getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long accountId,
            @RequestAttribute("username") String username
    ) {
        return reportService.getMonthlySummary(year, month, accountId, username);
    }
}
