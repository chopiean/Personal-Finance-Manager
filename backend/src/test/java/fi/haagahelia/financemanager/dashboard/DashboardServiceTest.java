package fi.haagahelia.financemanager.dashboard;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.security.CurrentUserService;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private CurrentUserService currentUserService;

    private DashboardService dashboardService;

    private User user;
    private Account account;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(accountRepository, transactionRepository, currentUserService);
        user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        setId(user, 1L);
        account = Account.builder()
                .id(1L).name("Main").currency("EUR")
                .initialBalance(BigDecimal.valueOf(500)).type(AccountType.BANK)
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

    private Transaction tx(long id, String description, double amount,
                           LocalDate date, TransactionType type) {
        return Transaction.builder().id(id).description(description).category(description)
                .amount(amount).date(date).type(type)
                .account(account).user(user).build();
    }

    @Test
    void buildDashboard_computesTotalsForCurrentMonth() {
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(accountRepository.findByUserId(1L)).thenReturn(List.of(account));

        LocalDate withinMonth = YearMonth.now().atDay(1).plusDays(1);
        Transaction income = tx(1L, "Salary", 1000, withinMonth, TransactionType.INCOME);
        Transaction expense = tx(2L, "Rent", 400, withinMonth, TransactionType.EXPENSE);

        when(transactionRepository.findByAccountUserId(1L))
                .thenReturn(List.of(income, expense));
        when(transactionRepository.findByAccountUserIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(income, expense));
        when(transactionRepository.findTop5ByAccountUserIdOrderByDateDesc(1L))
                .thenReturn(List.of(expense, income));

        DashboardResponse response = dashboardService.buildDashboard();

        assertThat(response.getSummary().getTotalBalance()).isEqualTo(1100); // 500 + 1000 - 400
        assertThat(response.getSummary().getIncome()).isEqualTo(1000);
        assertThat(response.getSummary().getExpenses()).isEqualTo(400);
        assertThat(response.getSummary().getSavingsRate()).isEqualTo(60.0);
        assertThat(response.getRecentTransactions()).hasSize(2);
    }

    @Test
    void buildDashboard_totalBalanceIncludesEarlierMonths_butMonthlyTotalsDoNot() {
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(accountRepository.findByUserId(1L)).thenReturn(List.of(account));

        LocalDate thisMonth = YearMonth.now().atDay(1).plusDays(1);
        LocalDate lastMonth = YearMonth.now().minusMonths(1).atDay(10);
        Transaction oldExpense = tx(1L, "Laptop", 300, lastMonth, TransactionType.EXPENSE);
        Transaction newIncome = tx(2L, "Salary", 1000, thisMonth, TransactionType.INCOME);

        when(transactionRepository.findByAccountUserId(1L))
                .thenReturn(List.of(oldExpense, newIncome));
        when(transactionRepository.findByAccountUserIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(newIncome));
        when(transactionRepository.findTop5ByAccountUserIdOrderByDateDesc(1L))
                .thenReturn(List.of(newIncome, oldExpense));

        DashboardResponse response = dashboardService.buildDashboard();

        assertThat(response.getSummary().getTotalBalance()).isEqualTo(1200); // 500 - 300 + 1000
        assertThat(response.getSummary().getIncome()).isEqualTo(1000);
        assertThat(response.getSummary().getExpenses()).isEqualTo(0);
    }

    @Test
    void buildDashboard_mapsRecentTransactionsToDto() {
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(accountRepository.findByUserId(1L)).thenReturn(List.of(account));

        LocalDate date = YearMonth.now().atDay(2);
        Transaction expense = tx(7L, "Groceries", 42.5, date, TransactionType.EXPENSE);

        when(transactionRepository.findByAccountUserId(1L)).thenReturn(List.of(expense));
        when(transactionRepository.findByAccountUserIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(expense));
        when(transactionRepository.findTop5ByAccountUserIdOrderByDateDesc(1L))
                .thenReturn(List.of(expense));

        DashboardResponse.RecentTransactionItem item =
                dashboardService.buildDashboard().getRecentTransactions().get(0);

        assertThat(item.getId()).isEqualTo(7L);
        assertThat(item.getDescription()).isEqualTo("Groceries");
        assertThat(item.getAmount()).isEqualTo(42.5);
        assertThat(item.getDate()).isEqualTo(date.toString()); // yyyy-MM-dd
        assertThat(item.getType()).isEqualTo(TransactionType.EXPENSE);
    }

    @Test
    void buildDashboard_savingsRateIsZero_whenNoIncome() {
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(accountRepository.findByUserId(1L)).thenReturn(List.of());
        when(transactionRepository.findByAccountUserId(1L)).thenReturn(List.of());
        when(transactionRepository.findByAccountUserIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of());
        when(transactionRepository.findTop5ByAccountUserIdOrderByDateDesc(1L))
                .thenReturn(List.of());

        DashboardResponse response = dashboardService.buildDashboard();

        assertThat(response.getSummary().getTotalBalance()).isEqualTo(0);
        assertThat(response.getSummary().getSavingsRate()).isEqualTo(0);
        assertThat(response.getRecentTransactions()).isEmpty();
    }
}