package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.budget.Budget;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.report.dto.MonthlySummaryResponse;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private UserRepository userRepository;
    @Mock private BudgetRepository budgetRepository;

    @InjectMocks
    private TransactionService transactionService;

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
    void createTransaction_success_usesGivenCategory() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        TransactionRequest req = TransactionRequest.builder()
                .description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(5L).category("Food").build();

        TransactionResponse resp = transactionService.createTransaction(req, "owner");

        assertThat(resp.getCategory()).isEqualTo("Food");
        assertThat(resp.getAccountId()).isEqualTo(5L);
        assertThat(resp.getAccountName()).isEqualTo("Main");
    }

    @Test
    void createTransaction_fallsBackToDescription_whenCategoryBlank() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        TransactionRequest req = TransactionRequest.builder()
                .description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(5L).category("  ").build();

        TransactionResponse resp = transactionService.createTransaction(req, "owner");

        assertThat(resp.getCategory()).isEqualTo("Coffee");
    }

    @Test
    void createTransaction_throws_whenAccountNotOwnedByUser() {
        when(userRepository.findByUsername("intruder")).thenReturn(Optional.of(otherUser));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));

        TransactionRequest req = TransactionRequest.builder()
                .description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(5L).build();

        assertThatThrownBy(() -> transactionService.createTransaction(req, "intruder"))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void createTransaction_throws_whenUserNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        TransactionRequest req = TransactionRequest.builder()
                .description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(5L).build();

        assertThatThrownBy(() -> transactionService.createTransaction(req, "ghost"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createTransaction_throws_whenAccountNotFound() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        TransactionRequest req = TransactionRequest.builder()
                .description("Coffee").amount(4.5).date(LocalDate.now())
                .type(TransactionType.EXPENSE).accountId(99L).build();

        assertThatThrownBy(() -> transactionService.createTransaction(req, "owner"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createTransactionFromCsv_derivesUserFromAccount() {
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        TransactionRequest req = TransactionRequest.builder()
                .description("Import").amount(20.0).date(LocalDate.now())
                .type(TransactionType.INCOME).accountId(5L).build();

        TransactionResponse resp = transactionService.createTransactionFromCsv(req);

        assertThat(resp.getCategory()).isEqualTo("Import");
        verifyNoInteractions(userRepository);
    }

    @Test
    void getAllTransactionsForUser_mapsAll() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        Transaction t = Transaction.builder().id(1L).description("A").category("Food")
                .amount(10).date(LocalDate.now()).type(TransactionType.EXPENSE)
                .account(account).user(owner).build();
        when(transactionRepository.findByAccountUserId(1L)).thenReturn(List.of(t));

        List<TransactionResponse> result = transactionService.getAllTransactionsForUser("owner");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("Food");
    }

    @Test
    void getAllTransactionsForUser_defaultsCategoryToUncategorized_whenNull() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        Transaction t = Transaction.builder().id(1L).description("A").category(null)
                .amount(10).date(LocalDate.now()).type(TransactionType.EXPENSE)
                .account(account).user(owner).build();
        when(transactionRepository.findByAccountUserId(1L)).thenReturn(List.of(t));

        List<TransactionResponse> result = transactionService.getAllTransactionsForUser("owner");

        assertThat(result.get(0).getCategory()).isEqualTo("Uncategorized");
    }

    @Test
    void getTransactionsByAccount_throws_whenNotOwner() {
        when(userRepository.findByUsername("intruder")).thenReturn(Optional.of(otherUser));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> transactionService.getTransactionsByAccount(5L, "intruder"))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void getTransactionsByAccount_success() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(accountRepository.findById(5L)).thenReturn(Optional.of(account));
        when(transactionRepository.findByAccountId(5L)).thenReturn(List.of());

        List<TransactionResponse> result = transactionService.getTransactionsByAccount(5L, "owner");

        assertThat(result).isEmpty();
    }

    @Test
    void deleteTransaction_success() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        Transaction t = Transaction.builder().id(1L).description("A").category("Food")
                .amount(10).date(LocalDate.now()).type(TransactionType.EXPENSE)
                .account(account).user(owner).build();
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(t));

        transactionService.deleteTransaction(1L, "owner");

        verify(transactionRepository).delete(t);
    }

    @Test
    void deleteTransaction_throws_whenNotOwner() {
        when(userRepository.findByUsername("intruder")).thenReturn(Optional.of(otherUser));
        Transaction t = Transaction.builder().id(1L).description("A").category("Food")
                .amount(10).date(LocalDate.now()).type(TransactionType.EXPENSE)
                .account(account).user(owner).build();
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(t));

        assertThatThrownBy(() -> transactionService.deleteTransaction(1L, "intruder"))
                .isInstanceOf(SecurityException.class);

        verify(transactionRepository, never()).delete(any());
    }

    @Test
    void deleteTransaction_throws_whenNotFound() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(transactionRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.deleteTransaction(404L, "owner"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getMonthlySummary_computesTotalsAndBudgetStatus() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));

        Budget budget = Budget.builder().id(1L).category("Food").limitAmount(100.0)
                .month(6).year(2025).account(account).user(owner).build();
        when(budgetRepository.findByAccountUserIdAndYearAndMonth(1L, 2025, 6)).thenReturn(List.of(budget));
        when(transactionRepository.sumExpensesByCategory(eq(1L), eq("Food"), any(), any())).thenReturn(120.0);

        Transaction income = Transaction.builder().id(1L).description("Salary").category("Salary")
                .amount(2000).date(LocalDate.of(2025, 6, 5)).type(TransactionType.INCOME)
                .account(account).user(owner).build();
        Transaction expense = Transaction.builder().id(2L).description("Groceries").category("Food")
                .amount(120).date(LocalDate.of(2025, 6, 10)).type(TransactionType.EXPENSE)
                .account(account).user(owner).build();
        when(transactionRepository.findByAccountUserIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(income, expense));

        MonthlySummaryResponse resp = transactionService.getMonthlySummary("owner", 2025, 6);

        assertThat(resp.getTotalIncome()).isEqualTo(2000);
        assertThat(resp.getTotalExpense()).isEqualTo(120);
        assertThat(resp.getNetBalance()).isEqualTo(1880);
        assertThat(resp.getBudgetStatuses()).hasSize(1);
        assertThat(resp.getBudgetStatuses().get(0).isOverBudget()).isTrue();
        assertThat(resp.getBudgetStatuses().get(0).getDifference()).isEqualTo(-20.0);
    }

    @Test
    void getMonthlySummary_emptyBudgetsAndTransactions() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(owner));
        when(budgetRepository.findByAccountUserIdAndYearAndMonth(1L, 2025, 1)).thenReturn(List.of());
        when(transactionRepository.findByAccountUserIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of());

        MonthlySummaryResponse resp = transactionService.getMonthlySummary("owner", 2025, 1);

        assertThat(resp.getTotalIncome()).isEqualTo(0);
        assertThat(resp.getTotalExpense()).isEqualTo(0);
        assertThat(resp.getBudgetStatuses()).isEmpty();
    }
}
