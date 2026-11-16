package fi.haagahelia.financemanager.account;

import fi.haagahelia.financemanager.account.dto.AccountRequest;
import fi.haagahelia.financemanager.account.dto.AccountResponse;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private AccountService accountService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        setId(user, 1L);
    }

    private void setId(User u, Long id) {
        try {
            var f = User.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(u, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void createAccount_savesAccountWithDefaultBankType_whenTypeNull() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> {
            Account a = inv.getArgument(0);
            a.setId(10L);
            return a;
        });

        AccountRequest req = AccountRequest.builder()
                .name("Main Checking")
                .currency("EUR")
                .initialBalance(BigDecimal.valueOf(100))
                .type(null)
                .description("desc")
                .build();

        AccountResponse response = accountService.createAccount(req, "jdoe");

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getType()).isEqualTo(AccountType.BANK);
        assertThat(response.getName()).isEqualTo("Main Checking");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.isArchived()).isFalse();
        assertThat(response.getCreatedAt()).isEqualTo(LocalDate.now());

        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void createAccount_usesProvidedType_whenGiven() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));

        AccountRequest req = AccountRequest.builder()
                .name("Savings")
                .currency("USD")
                .initialBalance(BigDecimal.TEN)
                .type(AccountType.SAVINGS)
                .build();

        AccountResponse response = accountService.createAccount(req, "jdoe");

        assertThat(response.getType()).isEqualTo(AccountType.SAVINGS);
    }

    @Test
    void createAccount_throws_whenUserNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        AccountRequest req = AccountRequest.builder()
                .name("X").currency("EUR").initialBalance(BigDecimal.ZERO).build();

        assertThatThrownBy(() -> accountService.createAccount(req, "ghost"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ghost");

        verifyNoInteractions(accountRepository);
    }

    @Test
    void getAccountsForUser_returnsMappedAccounts() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));

        Account acc1 = Account.builder()
                .id(1L).name("A").currency("EUR")
                .initialBalance(BigDecimal.ONE).type(AccountType.CASH)
                .archived(false).createdAt(LocalDate.now()).user(user).build();
        Account acc2 = Account.builder()
                .id(2L).name("B").currency("EUR")
                .initialBalance(BigDecimal.TEN).type(AccountType.BANK)
                .archived(true).createdAt(LocalDate.now()).user(user).build();

        when(accountRepository.findByUser(user)).thenReturn(List.of(acc1, acc2));

        List<AccountResponse> result = accountService.getAccountsForUser("jdoe");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(AccountResponse::getName).containsExactly("A", "B");
    }

    @Test
    void getAccountsForUser_returnsEmptyList_whenNoAccounts() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));
        when(accountRepository.findByUser(user)).thenReturn(List.of());

        List<AccountResponse> result = accountService.getAccountsForUser("jdoe");

        assertThat(result).isEmpty();
    }

    @Test
    void getAccountsForUser_throws_whenUserNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccountsForUser("ghost"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deleteAccount_removesTransactionsBudgetsAndAccount() {
        Account acc = Account.builder().id(5L).name("Main").currency("EUR")
                .initialBalance(BigDecimal.ZERO).type(AccountType.BANK).user(user).build();
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(acc));

        accountService.deleteAccount(5L, "jdoe");

        var inOrder = inOrder(transactionRepository, budgetRepository, accountRepository);
        inOrder.verify(transactionRepository).deleteByAccountId(5L);
        inOrder.verify(budgetRepository).deleteByAccountId(5L);
        inOrder.verify(accountRepository).delete(acc);
    }

    @Test
    void deleteAccount_throws_whenAccountBelongsToAnotherUser() {
        User other = new User("other", "other@example.com", "hashed", "ROLE_USER");
        setId(other, 2L);
        Account acc = Account.builder().id(5L).name("Theirs").currency("EUR")
                .initialBalance(BigDecimal.ZERO).type(AccountType.BANK).user(other).build();
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(acc));

        assertThatThrownBy(() -> accountService.deleteAccount(5L, "jdoe"))
                .isInstanceOf(SecurityException.class);

        verify(transactionRepository, never()).deleteByAccountId(any());
        verify(budgetRepository, never()).deleteByAccountId(any());
        verify(accountRepository, never()).delete(any());
    }

    @Test
    void deleteAccount_throws_whenAccountNotFound() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.deleteAccount(99L, "jdoe"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
