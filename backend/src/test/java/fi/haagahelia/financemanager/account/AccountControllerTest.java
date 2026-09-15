package fi.haagahelia.financemanager.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.haagahelia.financemanager.account.dto.AccountRequest;
import fi.haagahelia.financemanager.account.dto.AccountResponse;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AccountController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AccountService accountService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void createAccount_returns401_whenUnauthenticated() throws Exception {
        AccountRequest req = AccountRequest.builder()
                .name("Main").currency("EUR").initialBalance(BigDecimal.TEN).build();

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void createAccount_returns400_whenValidationFails() throws Exception {
        AccountRequest req = AccountRequest.builder()
                .name("") // blank -> fails @NotBlank
                .currency("EU") // wrong size
                .initialBalance(BigDecimal.valueOf(-5)) // negative -> fails @DecimalMin
                .build();

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void createAccount_returns201_onSuccess() throws Exception {
        AccountRequest req = AccountRequest.builder()
                .name("Main").currency("EUR").initialBalance(BigDecimal.TEN).build();

        AccountResponse response = AccountResponse.builder()
                .id(1L).name("Main").currency("EUR").initialBalance(BigDecimal.TEN)
                .type(AccountType.BANK).archived(false).createdAt(LocalDate.now()).userId(1L)
                .build();

        when(accountService.createAccount(any(AccountRequest.class), org.mockito.ArgumentMatchers.eq("jdoe")))
                .thenReturn(response);

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Main"));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void getAccounts_returnsSortedList() throws Exception {
        AccountResponse a = AccountResponse.builder().id(1L).name("Zeta").currency("EUR")
                .initialBalance(BigDecimal.ONE).type(AccountType.CASH).archived(false)
                .createdAt(LocalDate.now()).userId(1L).build();
        AccountResponse b = AccountResponse.builder().id(2L).name("Alpha").currency("EUR")
                .initialBalance(BigDecimal.ONE).type(AccountType.CASH).archived(false)
                .createdAt(LocalDate.now()).userId(1L).build();

        when(accountService.getAccountsForUser("jdoe")).thenReturn(List.of(a, b));

        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alpha"))
                .andExpect(jsonPath("$[1].name").value("Zeta"));
    }

    @Test
    void getAccounts_returns401_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().is4xxClientError());
    }
}
