package fi.haagahelia.financemanager.report;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.budget.Budget;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ReportService reportService;

    private User user;
    private Account account;

    @BeforeEach
    void setUp() {
        user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        setId(user, 1L);
        account = Account.builder()
                .id(1L).name("Main").currency("EUR")
                .initialBalance(BigDecimal.ZERO).type(AccountType.BANK)
                .archived(false).createdAt(LocalDate.now()).user(user).build();
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
    void getMonthlySummary_forWholeUser_aggregatesByCategory() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));

        Transaction t1 = Transaction.builder().id(1L).description("Salary").category("Income")
                .amount(3000).date(LocalDate.of(2025, 3, 1)).type(TransactionType.INCOME)
                .account(account).user(user).build();
        Transaction t2 = Transaction.builder().id(2L).description("Groceries").category("Food")
                .amount(150).date(LocalDate.of(2025, 3, 5)).type(TransactionType.EXPENSE)
                .account(account).user(user).build();
        Transaction t3 = Transaction.builder().id(3L).description("Snacks").category(null)
                .amount(20).date(LocalDate.of(2025, 3, 10)).type(TransactionType.EXPENSE)
                .account(account).user(user).build();

        when(transactionRepository.findByAccountUserIdAndDateBetween(1L,
                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 3, 31)))
                .thenReturn(List.of(t1, t2, t3));

        Budget budget = Budget.builder().id(1L).category("Food").limitAmount(100.0)
                .month(3).year(2025).account(account).user(user).build();
        when(budgetRepository.findByAccountUserIdAndYearAndMonth(1L, 2025, 3))
                .thenReturn(List.of(budget));

        MonthlySummaryResponse resp = reportService.getMonthlySummary(2025, 3, null, "jdoe");

        assertThat(resp.getTotalIncome()).isEqualTo(3000);
        assertThat(resp.getTotalExpense()).isEqualTo(170);
        assertThat(resp.getNetBalance()).isEqualTo(2830);
        assertThat(resp.getCategories()).hasSize(3); // Income, Food, Uncategorized
        assertThat(resp.getBudgetStatuses()).hasSize(1);
        assertThat(resp.getBudgetStatuses().get(0).getCategory()).isEqualTo("Food");
        assertThat(resp.getBudgetStatuses().get(0).isOverBudget()).isTrue();
        assertThat(resp.getBudgetStatuses().get(0).getActualExpense()).isEqualTo(150);
    }

    @Test
    void getMonthlySummary_byAccountId_usesAccountQueries() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));

        when(transactionRepository.findByAccountIdAndDateBetween(1L,
                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 3, 31)))
                .thenReturn(List.of());
        when(budgetRepository.findByAccountIdAndYearAndMonth(1L, 2025, 3))
                .thenReturn(List.of());

        MonthlySummaryResponse resp = reportService.getMonthlySummary(2025, 3, 1L, "jdoe");

        assertThat(resp.getAccountId()).isEqualTo(1L);
        assertThat(resp.getTotalIncome()).isEqualTo(0);
        assertThat(resp.getCategories()).isEmpty();
        assertThat(resp.getBudgetStatuses()).isEmpty();
    }

    @Test
    void getMonthlySummary_budgetUnderLimit_isNotOverBudget() {
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));

        Transaction t = Transaction.builder().id(1L).description("Snack").category("Food")
                .amount(30).date(LocalDate.of(2025, 3, 5)).type(TransactionType.EXPENSE)
                .account(account).user(user).build();

        when(transactionRepository.findByAccountUserIdAndDateBetween(1L,
                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 3, 31)))
                .thenReturn(List.of(t));

        Budget budget = Budget.builder().id(1L).category("Food").limitAmount(100.0)
                .month(3).year(2025).account(account).user(user).build();
        when(budgetRepository.findByAccountUserIdAndYearAndMonth(1L, 2025, 3))
                .thenReturn(List.of(budget));

        MonthlySummaryResponse resp = reportService.getMonthlySummary(2025, 3, null, "jdoe");

        assertThat(resp.getBudgetStatuses().get(0).isOverBudget()).isFalse();
        assertThat(resp.getBudgetStatuses().get(0).getDifference()).isEqualTo(70.0);
    }

    @Test
    void getMonthlySummary_throws_whenUserNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.getMonthlySummary(2025, 3, null, "ghost"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
