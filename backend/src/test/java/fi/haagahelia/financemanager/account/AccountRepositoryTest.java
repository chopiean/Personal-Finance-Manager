package fi.haagahelia.financemanager.account;

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
class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;
    private User otherUser;

    @BeforeEach
    void setUp() {
        user = userRepository.save(new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER"));
        otherUser = userRepository.save(new User("other", "other@example.com", "hashed", "ROLE_USER"));
    }

    private Account newAccount(User owner, String name) {
        return Account.builder()
                .name(name).currency("EUR").initialBalance(BigDecimal.TEN)
                .type(AccountType.BANK).archived(false).createdAt(LocalDate.now()).user(owner).build();
    }

    @Test
    void findByUser_returnsOnlyThatUsersAccounts() {
        accountRepository.save(newAccount(user, "Main"));
        accountRepository.save(newAccount(otherUser, "Other's account"));

        List<Account> result = accountRepository.findByUser(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Main");
    }

    @Test
    void findByUserId_returnsOnlyThatUsersAccounts() {
        accountRepository.save(newAccount(user, "Main"));
        accountRepository.save(newAccount(otherUser, "Other's account"));

        List<Account> result = accountRepository.findByUserId(user.getId());

        assertThat(result).hasSize(1);
    }

    @Test
    void findByIdAndUserId_returnsEmpty_whenAccountBelongsToDifferentUser() {
        Account acc = accountRepository.save(newAccount(otherUser, "Other's account"));

        assertThat(accountRepository.findByIdAndUserId(acc.getId(), user.getId())).isEmpty();
        assertThat(accountRepository.findByIdAndUserId(acc.getId(), otherUser.getId())).isPresent();
    }

    @Test
    void save_persistsAllFields() {
        Account saved = accountRepository.save(newAccount(user, "Main"));

        Account fetched = accountRepository.findById(saved.getId()).orElseThrow();
        assertThat(fetched.getName()).isEqualTo("Main");
        assertThat(fetched.getCurrency()).isEqualTo("EUR");
        assertThat(fetched.getInitialBalance()).isEqualByComparingTo(BigDecimal.TEN);
        assertThat(fetched.getType()).isEqualTo(AccountType.BANK);
        assertThat(fetched.getUser().getId()).isEqualTo(user.getId());
    }
}
