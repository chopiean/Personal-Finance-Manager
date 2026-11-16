package fi.haagahelia.financemanager.schedule;

import fi.haagahelia.financemanager.report.ReportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;

import java.time.LocalDateTime;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MonthlySummarySchedulerTest {

    @Mock private ReportService reportService;
    @InjectMocks private MonthlySummaryScheduler scheduler;

    @Test
    void generateMonthlySummary_requestsCurrentMonthAsSystem() {
        LocalDate now = LocalDate.now();

        scheduler.generateMonthlySummary();

        verify(reportService).getMonthlySummary(
                eq(now.getYear()), eq(now.getMonthValue()), isNull(), eq("system"));
    }

    @Test
    void generateMonthlySummary_runsOnceAMonth_onThe1stAt1am() throws Exception {
        Scheduled scheduled = MonthlySummaryScheduler.class
                .getMethod("generateMonthlySummary").getAnnotation(Scheduled.class);
        CronExpression cron = CronExpression.parse(scheduled.cron());

        LocalDateTime first = cron.next(LocalDateTime.of(2026, 1, 15, 12, 0));
        LocalDateTime second = cron.next(first);

        assertThat(first).isEqualTo(LocalDateTime.of(2026, 2, 1, 1, 0));
        assertThat(second).isEqualTo(LocalDateTime.of(2026, 3, 1, 1, 0));
    }
}
