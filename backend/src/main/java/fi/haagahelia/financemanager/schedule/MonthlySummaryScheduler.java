package fi.haagahelia.financemanager.schedule;

import fi.haagahelia.financemanager.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class MonthlySummaryScheduler {

    private final ReportService reportService;

    @Scheduled(cron = "0 0 1 * * ?") // every month
    public void generateMonthlySummary() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        // System-generated report → use a fixed username
        reportService.getMonthlySummary(year, month, null, "system");
    }
}
