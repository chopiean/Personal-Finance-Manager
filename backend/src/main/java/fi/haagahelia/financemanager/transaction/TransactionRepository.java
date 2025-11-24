package fi.haagahelia.financemanager.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * JPA repository for Transaction entities.
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /** All transactions for a specific account. */
    List<Transaction> findByAccountId(Long accountId);

    /** All transactions between two dates (inclusive). */
    List<Transaction> findByDateBetween(LocalDate start, LocalDate end);

    /** All transactions for an account between two dates. */
    List<Transaction> findByAccountIdAndDateBetween(
            Long accountId,
            LocalDate start,
            LocalDate end
    );
}
