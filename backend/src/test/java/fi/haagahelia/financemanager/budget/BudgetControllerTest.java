package fi.haagahelia.financemanager.budget;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;
import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BudgetController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BudgetService budgetService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void createBudget_returns401_whenUnauthenticated() throws Exception {
        BudgetRequest req = BudgetRequest.builder()
                .category("Food").limitAmount(100.0).accountId(1L).month(6).year(2025).build();

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void createBudget_returns200_onSuccess() throws Exception {
        BudgetRequest req = BudgetRequest.builder()
                .category("Food").limitAmount(100.0).accountId(1L).month(6).year(2025).build();

        BudgetResponse resp = BudgetResponse.builder()
                .id(1L).category("Food").limitAmount(100.0).accountId(1L).month(6).year(2025).build();

        when(budgetService.createBudget(any(BudgetRequest.class), eq("jdoe"))).thenReturn(resp);

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("Food"));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void getBudgets_returnsList() throws Exception {
        BudgetResponse resp = BudgetResponse.builder()
                .id(1L).category("Food").limitAmount(100.0).accountId(1L).month(6).year(2025).build();

        when(budgetService.getBudgets("jdoe", null, 2025, 6)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/budgets").param("year", "2025").param("month", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Food"));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void updateBudget_returns200() throws Exception {
        BudgetRequest req = BudgetRequest.builder()
                .category("Rent").limitAmount(500.0).accountId(1L).month(6).year(2025).build();

        BudgetResponse resp = BudgetResponse.builder()
                .id(1L).category("Rent").limitAmount(500.0).accountId(1L).month(6).year(2025).build();

        when(budgetService.updateBudget(eq(1L), any(BudgetRequest.class), eq("jdoe"))).thenReturn(resp);

        mockMvc.perform(put("/api/budgets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("Rent"));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void deleteBudget_returns200() throws Exception {
        mockMvc.perform(delete("/api/budgets/1"))
                .andExpect(status().isOk());
    }
}
