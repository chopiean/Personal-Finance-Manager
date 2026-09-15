package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.budget.dto.BudgetRequest;
import fi.haagahelia.financemanager.budget.dto.BudgetResponse;
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
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BudgetService budgetService;

    private User owner;
    private User otherUser;
    private Account account;

    @BeforeEach
    void setUp() {
        owner = new User("owner", "owner@example.com", "x", "ROLE_USER");
        setId(owner, 1L);
        otherUser = new User("intruder", "intruder@example.com", "x", "ROLE_USER");
        setId(otherUser, 2L);

        account = Account.builder()
                .id(5L).name("Main").currency("EUR")
                .initialBalance(BigDecimal.TEN).type(AccountType.BANK)
                .archived(false).createdAt(LocalDate.now()).user(owner).build();
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
    void createBudget_success() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(inv -> {
            Budget b = inv.getArgument(0);
            b.setId(100L);
            return b;
        });

        BudgetRequest req = BudgetRequest.builder()
                .category("Groceries").limitAmount(200.0).accountId(5L).month(6).year(2025).build();

        BudgetResponse resp = budgetService.createBudget(req, "owner");

        assertThat(resp.getId()).isEqualTo(100L);
        assertThat(resp.getCategory()).isEqualTo("Groceries");
        assertThat(resp.getLimitAmount()).isEqualTo(200.0);
        assertThat(resp.getAccountId()).isEqualTo(5L);
    }

    @Test
    void createBudget_throws_whenAccountBelongsToAnotherUser() {
        when(userRepository.findByUsername("intruder")).thenReturn(Optional.of(otherUser));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));

        BudgetRequest req = BudgetRequest.builder()
                .category("Groceries").limitAmount(200.0).accountId(5L).month(6).year(2025).build();

        assertThatThrownBy(() -> budgetService.createBudget(req, "intruder"))
                .isInstanceOf(SecurityException.class);

        verify(budgetRepository, never()).save(any());
    }

    @Test
    void createBudget_throws_whenAccountNotFound() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        BudgetRequest req = BudgetRequest.builder()
                .category("Groceries").limitAmount(200.0).accountId(99L).month(6).year(2025).build();

        assertThatThrownBy(() -> budgetService.createBudget(req, "owner"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getBudgets_byAccountId() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        Budget b = Budget.builder().id(1L).category("Food").limitAmount(50.0)
                .month(6).year(2025).account(account).user(owner).build();
        when(budgetRepository.findByAccountIdAndYearAndMonth(5L, 2025, 6)).thenReturn(List.of(b));

        List<BudgetResponse> result = budgetService.getBudgets("owner", 5L, 2025, 6);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("Food");
        verify(budgetRepository, never()).findByAccountUserIdAndYearAndMonth(anyLong(), anyInt(), anyInt());
    }

    @Test
    void getBudgets_byUserWhenAccountIdNull() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(budgetRepository.findByAccountUserIdAndYearAndMonth(1L, 2025, 6)).thenReturn(List.of());

        List<BudgetResponse> result = budgetService.getBudgets("owner", null, 2025, 6);

        assertThat(result).isEmpty();
    }

    @Test
    void updateBudget_success() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        Budget existing = Budget.builder().id(1L).category("Old").limitAmount(10.0)
                .month(5).year(2025).account(account).user(owner).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(inv -> inv.getArgument(0));

        BudgetRequest req = BudgetRequest.builder()
                .category(" New ").limitAmount(500.0).accountId(5L).month(7).year(2025).build();

        BudgetResponse resp = budgetService.updateBudget(1L, req, "owner");

        assertThat(resp.getCategory()).isEqualTo("New");
        assertThat(resp.getLimitAmount()).isEqualTo(500.0);
        assertThat(resp.getMonth()).isEqualTo(7);
    }

    @Test
    void updateBudget_throws_whenBudgetBelongsToAnotherUser() {
        when(userRepository.findByUsername("intruder")).thenReturn(Optional.of(otherUser));
        Budget existing = Budget.builder().id(1L).category("Old").limitAmount(10.0)
                .month(5).year(2025).account(account).user(owner).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(existing));

        BudgetRequest req = BudgetRequest.builder()
                .category("New").limitAmount(500.0).accountId(5L).month(7).year(2025).build();

        assertThatThrownBy(() -> budgetService.updateBudget(1L, req, "intruder"))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void updateBudget_throws_whenBudgetNotFound() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(budgetRepository.findById(404L)).thenReturn(Optional.empty());

        BudgetRequest req = BudgetRequest.builder()
                .category("New").limitAmount(500.0).accountId(5L).month(7).year(2025).build();

        assertThatThrownBy(() -> budgetService.updateBudget(404L, req, "owner"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deleteBudget_success() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        Budget existing = Budget.builder().id(1L).category("Old").limitAmount(10.0)
                .month(5).year(2025).account(account).user(owner).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(existing));

        budgetService.deleteBudget(1L, "owner");

        verify(budgetRepository).delete(existing);
    }

    @Test
    void deleteBudget_throws_whenUnauthorized() {
        when(userRepository.findByUsername("intruder")).thenReturn(Optional.of(otherUser));
        Budget existing = Budget.builder().id(1L).category("Old").limitAmount(10.0)
                .month(5).year(2025).account(account).user(owner).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> budgetService.deleteBudget(1L, "intruder"))
                .isInstanceOf(SecurityException.class);

        verify(budgetRepository, never()).delete(any());
    }
}
