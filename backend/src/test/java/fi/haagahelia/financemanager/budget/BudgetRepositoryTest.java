package fi.haagahelia.financemanager.budget;

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

@DataJpaTest
class BudgetRepositoryTest {

    @Autowired
    private BudgetRepository budgetRepository;
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

    private Budget newBudget(String category, int month, int year) {
        return Budget.builder()
                .category(category).limitAmount(100.0).month(month).year(year)
                .account(account).user(user).build();
    }

    @Test
    void findByAccountIdAndYearAndMonth_matchesExactPeriod() {
        budgetRepository.save(newBudget("Food", 6, 2025));
        budgetRepository.save(newBudget("Food", 7, 2025)); // different month

        List<Budget> result = budgetRepository.findByAccountIdAndYearAndMonth(account.getId(), 2025, 6);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("Food");
    }

    @Test
    void findByAccountUserIdAndYearAndMonth_matchesViaAccountOwner() {
        budgetRepository.save(newBudget("Food", 6, 2025));

        List<Budget> result = budgetRepository.findByAccountUserIdAndYearAndMonth(user.getId(), 2025, 6);

        assertThat(result).hasSize(1);
    }

    @Test
    void findByAccountUserId_returnsAllBudgetsRegardlessOfMonth() {
        budgetRepository.save(newBudget("Food", 6, 2025));
        budgetRepository.save(newBudget("Rent", 7, 2025));

        List<Budget> result = budgetRepository.findByAccountUserId(user.getId());

        assertThat(result).hasSize(2);
    }

    @Test
    void findByAccountUserIdAndYearAndMonth_returnsEmpty_whenNoMatch() {
        budgetRepository.save(newBudget("Food", 6, 2025));

        List<Budget> result = budgetRepository.findByAccountUserIdAndYearAndMonth(user.getId(), 2024, 1);

        assertThat(result).isEmpty();
    }
}
