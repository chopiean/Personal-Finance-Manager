package fi.haagahelia.financemanager.dashboard;

import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.transaction.TransactionType;
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

@WebMvcTest(DashboardController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService;

    @Test
    void dashboard_returns401_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void dashboard_returnsSummaryAndRecentTransactions() throws Exception {
        var summary = new DashboardResponse.Summary(1100, 1000, 400, 60);
        var recent = List.of(new DashboardResponse.RecentTransactionItem(
                2L, "Rent", 400, "2026-11-02", TransactionType.EXPENSE));
        when(dashboardService.buildDashboard()).thenReturn(new DashboardResponse(summary, recent));

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.totalBalance").value(1100.0))
                .andExpect(jsonPath("$.recentTransactions[0].description").value("Rent"));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void dashboard_doesNotExposeUserOrAccountData() throws Exception {
        var recent = List.of(new DashboardResponse.RecentTransactionItem(
                2L, "Rent", 400, "2026-11-02", TransactionType.EXPENSE));
        when(dashboardService.buildDashboard()).thenReturn(
                new DashboardResponse(new DashboardResponse.Summary(0, 0, 0, 0), recent));

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recentTransactions[0].user").doesNotExist())
                .andExpect(jsonPath("$.recentTransactions[0].account").doesNotExist());
    }
}