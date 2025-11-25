package fi.haagahelia.financemanager.account;

import fi.haagahelia.financemanager.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for reading/writing Account entities.
 */
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUser(User user);

    List<Account> findByUserId(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long, userId);
}
