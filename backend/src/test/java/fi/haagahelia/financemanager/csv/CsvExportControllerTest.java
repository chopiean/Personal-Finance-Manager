package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CsvExportController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class CsvExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionRepository transactionRepository;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void exportAll_returns401_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/csv/transactions"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void exportAll_returnsCsvContent() throws Exception {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        Account account = Account.builder()
                .id(1L).name("Main").currency("EUR").initialBalance(BigDecimal.TEN)
                .type(AccountType.BANK).archived(false).createdAt(LocalDate.now()).user(user).build();
        Transaction tx = Transaction.builder()
                .id(1L).description("Coffee").category("Food").amount(4.5)
                .date(LocalDate.of(2025, 6, 1)).type(TransactionType.EXPENSE)
                .account(account).user(user).build();

        when(transactionRepository.findByUserUsername("jdoe")).thenReturn(List.of(tx));

        mockMvc.perform(get("/api/csv/transactions"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Coffee")));
    }
}
