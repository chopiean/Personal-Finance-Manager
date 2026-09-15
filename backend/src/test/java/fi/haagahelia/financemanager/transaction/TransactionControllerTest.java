package fi.haagahelia.financemanager.transaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void create_returns401_whenUnauthenticated() throws Exception {
        TransactionRequest req = TransactionRequest.builder()
                .description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(1L).build();

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void create_returns400_whenValidationFails() throws Exception {
        String invalidJson = "{}"; // missing required fields

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void create_returns200_onSuccess() throws Exception {
        TransactionRequest req = TransactionRequest.builder()
                .description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(1L).build();

        TransactionResponse resp = TransactionResponse.builder()
                .id(1L).description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(1L).accountName("Main").category("Food")
                .build();

        when(transactionService.createTransaction(any(TransactionRequest.class), eq("jdoe"))).thenReturn(resp);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Coffee"));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void getAll_returnsList() throws Exception {
        when(transactionService.getAllTransactionsForUser("jdoe")).thenReturn(List.of());

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void getByAccount_returnsList() throws Exception {
        when(transactionService.getTransactionsByAccount(1L, "jdoe")).thenReturn(List.of());

        mockMvc.perform(get("/api/transactions/account/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/transactions/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void getMonthlySummary_returnsSummary() throws Exception {
        MonthlySummaryResponse resp = MonthlySummaryResponse.builder()
                .year(2025).month(6).totalIncome(100).totalExpense(50).netBalance(50)
                .categories(List.of()).budgetStatuses(List.of()).build();

        when(transactionService.getMonthlySummary("jdoe", 2025, 6)).thenReturn(resp);

        mockMvc.perform(get("/api/transactions/summary/monthly")
                        .param("year", "2025").param("month", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(100));
    }
}
