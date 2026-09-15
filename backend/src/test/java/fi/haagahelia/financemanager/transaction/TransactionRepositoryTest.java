package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.account.AccountType;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

@DataJpaTest
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private UserRepository userRepository;

    private User user;
    private Account account;

    @BeforeEach
    void setUp() {
        user = userRepository.save(new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER"));
        account = accountRepository.save(Account.builder()
                .name("Main").currency("EUR").initialBalance(BigDecimal.TEN)
                .type(AccountType.BANK).archived(false).createdAt(LocalDate.now()).user(user).build());
    }

    private Transaction newTx(String category, double amount, LocalDate date, TransactionType type) {
        return Transaction.builder()
                .description("desc").category(category).amount(amount).date(date)
                .type(type).account(account).user(user).build();
    }

    @Test
    void findByAccountUserId_returnsAllTransactionsForUser() {
        transactionRepository.save(newTx("Food", 10, LocalDate.of(2025, 6, 1), TransactionType.EXPENSE));
        transactionRepository.save(newTx("Salary", 1000, LocalDate.of(2025, 6, 2), TransactionType.INCOME));

        List<Transaction> result = transactionRepository.findByAccountUserId(user.getId());

        assertThat(result).hasSize(2);
    }

    @Test
    void findByAccountId_returnsTransactionsForAccount() {
        transactionRepository.save(newTx("Food", 10, LocalDate.of(2025, 6, 1), TransactionType.EXPENSE));

        List<Transaction> result = transactionRepository.findByAccountId(account.getId());

        assertThat(result).hasSize(1);
    }

    @Test
    void findByAccountUserIdAndDateBetween_filtersToDateRange() {
        transactionRepository.save(newTx("Food", 10, LocalDate.of(2025, 6, 1), TransactionType.EXPENSE));
        transactionRepository.save(newTx("Food", 20, LocalDate.of(2025, 7, 1), TransactionType.EXPENSE));

        List<Transaction> result = transactionRepository.findByAccountUserIdAndDateBetween(
                user.getId(), LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 30));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAmount()).isEqualTo(10);
    }

    @Test
    void findByAccountIdAndDateBetween_filtersToDateRange() {
        transactionRepository.save(newTx("Food", 10, LocalDate.of(2025, 6, 1), TransactionType.EXPENSE));

        List<Transaction> result = transactionRepository.findByAccountIdAndDateBetween(
                account.getId(), LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31));

        assertThat(result).hasSize(1);
    }

    @Test
    void findTop5ByAccountUserIdOrderByDateDesc_limitsAndOrdersDescending() {
        for (int i = 1; i <= 7; i++) {
            transactionRepository.save(newTx("Food", i, LocalDate.of(2025, 6, i), TransactionType.EXPENSE));
        }

        List<Transaction> result = transactionRepository.findTop5ByAccountUserIdOrderByDateDesc(user.getId());

        assertThat(result).hasSize(5);
        assertThat(result.get(0).getDate()).isEqualTo(LocalDate.of(2025, 6, 7));
        assertThat(result.get(4).getDate()).isEqualTo(LocalDate.of(2025, 6, 3));
    }

    @Test
    void findByUserUsername_returnsTransactionsForUsername() {
        transactionRepository.save(newTx("Food", 10, LocalDate.of(2025, 6, 1), TransactionType.EXPENSE));

        List<Transaction> result = transactionRepository.findByUserUsername("jdoe");

        assertThat(result).hasSize(1);
    }

    @Test
    void sumExpensesByCategory_sumsOnlyMatchingCategoryAndTypeAndDateRange_caseInsensitive() {
        transactionRepository.save(newTx("food", 10, LocalDate.of(2025, 6, 1), TransactionType.EXPENSE));
        transactionRepository.save(newTx("Food", 15, LocalDate.of(2025, 6, 15), TransactionType.EXPENSE));
        transactionRepository.save(newTx("Food", 1000, LocalDate.of(2025, 6, 10), TransactionType.INCOME)); // wrong type
        transactionRepository.save(newTx("Rent", 500, LocalDate.of(2025, 6, 10), TransactionType.EXPENSE)); // wrong category

        double sum = transactionRepository.sumExpensesByCategory(
                user.getId(), "FOOD", LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 30));

        assertThat(sum).isCloseTo(25.0, within(0.001));
    }

    @Test
    void sumExpensesByCategory_returnsZero_whenNoMatches() {
        double sum = transactionRepository.sumExpensesByCategory(
                user.getId(), "Nonexistent", LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 30));

        assertThat(sum).isEqualTo(0.0);
    }
}
