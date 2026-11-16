package fi.haagahelia.financemanager.assistant;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.budget.Budget;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinanceContextBuilderTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 3, 15);
    private static final long USER_ID = 7L;

    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private BudgetRepository budgetRepository;

    @InjectMocks private FinanceContextBuilder builder;

    private User user;
    private Account checking;

    @BeforeEach
    void setUp() {
        user = mock(User.class);
        when(user.getId()).thenReturn(USER_ID);
        checking = account(1L, "Checking", "1000.00", false);
    }

    private Account account(long id, String name, String initial, boolean archived) {
        return Account.builder().id(id).name(name).currency("EUR")
                .type(AccountType.values()[0])
                .initialBalance(new BigDecimal(initial)).archived(archived).build();
    }

    private Transaction tx(TransactionType type, double amount, String category,
                           LocalDate date, String description) {
        return Transaction.builder().type(type).amount(amount).category(category)
                .date(date).description(description).account(checking).build();
    }

    private void stub(List<Account> accounts, List<Transaction> txs, List<Budget> budgets) {
        when(accountRepository.findByUserId(USER_ID)).thenReturn(accounts);
        when(transactionRepository.findByAccountUserId(USER_ID)).thenReturn(txs);
        when(budgetRepository.findByAccountUserIdAndYearAndMonth(USER_ID, 2026, 3)).thenReturn(budgets);
    }

    @Test
    void build_withNoData_showsEmptyPlaceholders() {
        stub(List.of(), List.of(), List.of());

        String ctx = builder.build(user, TODAY);

        assertThat(ctx)
                .contains("Today: 2026-03-15")
                .contains("- (no accounts)")
                .contains("Total balance: 0.00")
                .contains("Income 0.00, expenses 0.00, net 0.00, savings rate 0%")
                .contains("- 2026-01: no expenses")
                .contains("- 2026-03: no expenses")
                .contains("- (no budgets set)")
                .contains("- (no transactions)");
    }

    @Test
    void build_computesBalancesAndSkipsArchivedAccounts() {
        Account archived = account(2L, "Old", "500.00", true);
        stub(List.of(checking, archived), List.of(
                tx(TransactionType.INCOME, 200, "Salary", TODAY, "pay"),
                tx(TransactionType.EXPENSE, 50, "Food", TODAY, "lunch")), List.of());

        String ctx = builder.build(user, TODAY);

        assertThat(ctx)
                .contains("- Checking (" + AccountType.values()[0] + ", EUR): balance 1150.00")
                .contains("Total balance: 1150.00")
                .doesNotContain("Old (");
    }

    @Test
    void build_summarisesCurrentMonthOnly() {
        stub(List.of(checking), List.of(
                tx(TransactionType.INCOME, 1000, "Salary", TODAY, null),
                tx(TransactionType.EXPENSE, 250, "Rent", TODAY.withDayOfMonth(1), null),
                tx(TransactionType.EXPENSE, 999, "Rent", TODAY.minusMonths(1), null)), List.of());

        String ctx = builder.build(user, TODAY);

        assertThat(ctx).contains("Income 1000.00, expenses 250.00, net 750.00, savings rate 75%");
    }

    @Test
    void build_groupsExpensesByCategoryForLastThreeMonths() {
        stub(List.of(checking), List.of(
                tx(TransactionType.EXPENSE, 30, "Food", TODAY, null),
                tx(TransactionType.EXPENSE, 20, "Food", TODAY, null),
                tx(TransactionType.EXPENSE, 80, "Rent", TODAY, null),
                tx(TransactionType.EXPENSE, 10, null, TODAY.minusMonths(2), null),
                tx(TransactionType.EXPENSE, 5, "Food", TODAY.minusMonths(3), null), // too old
                tx(TransactionType.INCOME, 500, "Salary", TODAY, null)), List.of());

        String ctx = builder.build(user, TODAY);

        assertThat(ctx)
                .contains("- 2026-03: Rent 80.00, Food 50.00")  // sorted by amount desc
                .contains("- 2026-02: no expenses")
                .contains("- 2026-01: Uncategorized 10.00")
                .doesNotContain("2025-12:")
                .doesNotContain("Salary 500.00,");
    }

    @Test
    void build_reportsBudgetsAndFlagsOverspending() {
        Budget food = Budget.builder().category("food").limitAmount(40.0).month(3).year(2026).build();
        Budget rent = Budget.builder().category("Rent").limitAmount(500.0).month(3).year(2026).build();
        Budget noLimit = Budget.builder().category("Fun").limitAmount(null).month(3).year(2026).build();
        stub(List.of(checking), List.of(
                tx(TransactionType.EXPENSE, 50, "Food", TODAY, null),
                tx(TransactionType.EXPENSE, 400, "Rent", TODAY, null)), List.of(food, rent, noLimit));

        String ctx = builder.build(user, TODAY);

        assertThat(ctx)
                .contains("- food: limit 40.00, spent 50.00, remaining -10.00 (OVER BUDGET)")
                .contains("- Rent: limit 500.00, spent 400.00, remaining 100.00\n")
                .contains("- Fun: limit 0.00, spent 0.00, remaining 0.00\n");
    }

    @Test
    void build_listsRecentTransactionsNewestFirstCappedAt30() {
        List<Transaction> txs = new ArrayList<>();
        for (int i = 0; i < 35; i++) {
            txs.add(tx(TransactionType.EXPENSE, 1, "Food", TODAY.minusDays(i), "item" + i));
        }
        txs.add(tx(TransactionType.EXPENSE, 1, "Food", null, "undated"));
        stub(List.of(checking), txs, List.of());

        String ctx = builder.build(user, TODAY);
        String recent = ctx.substring(ctx.indexOf("RECENT TRANSACTIONS"));

        assertThat(recent.lines().filter(l -> l.startsWith("- ")).count()).isEqualTo(30);
        assertThat(recent.indexOf("item0 ")).isLessThan(recent.indexOf("item1 "));
        assertThat(recent)
                .contains("- 2026-03-15 | EXPENSE | Food | item0 | 1.00 | Checking")
                .doesNotContain("item30 ")
                .doesNotContain("undated");
    }

    @Test
    void build_showsDashForMissingDescription() {
        stub(List.of(checking), List.of(
                tx(TransactionType.EXPENSE, 12.5, "", TODAY, null)), List.of());

        assertThat(builder.build(user, TODAY))
                .contains("- 2026-03-15 | EXPENSE | Uncategorized | - | 12.50 | Checking");
    }
}
