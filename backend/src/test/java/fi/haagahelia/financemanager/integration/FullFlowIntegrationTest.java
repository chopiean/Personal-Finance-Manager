package fi.haagahelia.financemanager.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full end-to-end flow against the real Spring context and an isolated
 * in-memory H2 database (see src/test/resources/application.properties):
 * register -> login -> create account -> create transaction -> read dashboard/report.
 */
@SpringBootTest
@AutoConfigureMockMvc
class FullFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerLoginCreateAccountCreateTransactionAndReadReports() throws Exception {
        String username = "integrationUser";
        String email = "integration@example.com";
        String password = "SuperSecret123";

        // 1. REGISTER
        String registerPayload = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("username", username);
            put("email", email);
            put("password", password);
        }});

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));

        // 2. LOGIN
        String loginPayload = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("identifier", username);
            put("password", password);
        }});

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginJson.get("token").asText();
        assertThat(token).isNotBlank();

        String authHeader = "Bearer " + token;

        // 3. CREATE ACCOUNT
        String accountPayload = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("name", "Checking");
            put("currency", "EUR");
            put("initialBalance", 100.0);
            put("type", "BANK");
        }});

        MvcResult accountResult = mockMvc.perform(post("/api/accounts")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(accountPayload))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode accountJson = objectMapper.readTree(accountResult.getResponse().getContentAsString());
        long accountId = accountJson.get("id").asLong();

        // 4. CREATE TRANSACTIONS (income + expense in current month)
        LocalDate today = LocalDate.now();

        String incomePayload = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("description", "Salary");
            put("amount", 2000.0);
            put("date", today.toString());
            put("type", "INCOME");
            put("accountId", accountId);
            put("category", "Salary");
        }});

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(incomePayload))
                .andExpect(status().isOk());

        String expensePayload = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("description", "Groceries");
            put("amount", 300.0);
            put("date", today.toString());
            put("type", "EXPENSE");
            put("accountId", accountId);
            put("category", "Food");
        }});

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expensePayload))
                .andExpect(status().isOk());

        // 5. DASHBOARD reflects the totals
        // totalBalance = initial account balance + net of all transactions (income - expense)
        mockMvc.perform(get("/api/dashboard").header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.totalBalance").value(1800.0))
                .andExpect(jsonPath("$.summary.income").value(2000.0))
                .andExpect(jsonPath("$.summary.expenses").value(300.0));

        // 6. MONTHLY REPORT reflects the same computed values
        mockMvc.perform(get("/api/reports/monthly")
                        .header("Authorization", authHeader)
                        .param("year", String.valueOf(today.getYear()))
                        .param("month", String.valueOf(today.getMonthValue())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(2000.0))
                .andExpect(jsonPath("$.totalExpense").value(300.0))
                .andExpect(jsonPath("$.netBalance").value(1700.0));

        // 7. Unauthenticated access is rejected
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().is4xxClientError());
    }
}
