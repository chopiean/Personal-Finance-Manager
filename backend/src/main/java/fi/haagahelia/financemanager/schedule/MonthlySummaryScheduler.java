package fi.haagahelia.financemanager.schedule;

import fi.haagahelia.financemanager.report.ReportService;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.report.dto.BudgetStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MonthlySummaryScheduler {

    private final ReportService reportService;

    /**
     * Run at 02:00 on the 1st of every month
     */
    @Scheduled(cron = "0 0 2 1 * *")
    public void runMonthlySummary() {
        int year = java.time.LocalDate.now().getYear();
        int month = java.time.LocalDate.now().getMonthValue();

        MonthlySummaryResponse summary =
                reportService.getMonthlySummary(year, month, null);

        log.info("===== MONTHLY SUMMARY GENERATED =====");
        log.info("Period: {}/{}", month, year);
        log.info("Total income: {}", summary.getTotalIncome());
        log.info("Total expense: {}", summary.getTotalExpense());
        log.info("Net: {}", summary.getNetBalance());

        if (summary.getBudgetStatuses() != null) {
            for (BudgetStatus bs : summary.getBudgetStatuses()) {
                log.info("Category: {}", bs.getCategory());
                log.info("  Budget limit: {}", bs.getBudgetLimit());
                log.info("  Actual spent: {}", bs.getActualExpense());
                log.info("  Difference: {}", bs.getDifference());
                log.info("  Over budget? {}", bs.isOverBudget());
            }
        }
    }
}
