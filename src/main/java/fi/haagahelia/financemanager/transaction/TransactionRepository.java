package fi.haagahelia.financemanager.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


/**
 * JPA repository for accessing Transaction data.
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountId(Long accountId);
}
