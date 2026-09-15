package fi.haagahelia.financemanager.report;

import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void getMonthlyReport_returns401_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/reports/monthly").param("year", "2025").param("month", "6"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void getMonthlyReport_returnsSummary() throws Exception {
        MonthlySummaryResponse resp = MonthlySummaryResponse.builder()
                .year(2025).month(6).totalIncome(500).totalExpense(300).netBalance(200)
                .categories(List.of()).budgetStatuses(List.of()).build();

        when(reportService.getMonthlySummary(2025, 6, null, "jdoe")).thenReturn(resp);

        mockMvc.perform(get("/api/reports/monthly").param("year", "2025").param("month", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(500))
                .andExpect(jsonPath("$.netBalance").value(200));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void getMonthlyReport_withAccountId_passesThrough() throws Exception {
        MonthlySummaryResponse resp = MonthlySummaryResponse.builder()
                .year(2025).month(6).accountId(3L).totalIncome(0).totalExpense(0).netBalance(0)
                .categories(List.of()).budgetStatuses(List.of()).build();

        when(reportService.getMonthlySummary(2025, 6, 3L, "jdoe")).thenReturn(resp);

        mockMvc.perform(get("/api/reports/monthly")
                        .param("year", "2025").param("month", "6").param("accountId", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value(3));
    }
}
