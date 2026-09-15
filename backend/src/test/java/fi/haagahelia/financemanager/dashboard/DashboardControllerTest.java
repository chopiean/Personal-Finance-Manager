package fi.haagahelia.financemanager.dashboard;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
    private UserRepository userRepository;

    @MockBean
    private AccountRepository accountRepository;

    @MockBean
    private TransactionRepository transactionRepository;

    @MockBean
    private JwtService jwtService;

    @Test
    void dashboard_returns401_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void dashboard_returnsSummary_onSuccess() throws Exception {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));

        Account account = Account.builder()
                .id(1L).name("Main").currency("EUR")
                .initialBalance(BigDecimal.valueOf(200)).type(AccountType.BANK)
                .archived(false).createdAt(LocalDate.now()).user(user).build();

        when(accountRepository.findByUser(user)).thenReturn(List.of(account));
        when(transactionRepository.findByAccountUserId(null)).thenReturn(List.of());

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.totalBalance").value(200.0));
    }
}
