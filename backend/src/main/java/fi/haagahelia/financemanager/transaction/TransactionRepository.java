package fi.haagahelia.financemanager.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountUserId(Long userId);

    List<Transaction> findByAccountId(Long accountId);

    List<Transaction> findByAccountUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    List<Transaction> findByAccountIdAndDateBetween(Long accountId, LocalDate start, LocalDate end);

    // DashboardService
    List<Transaction> findTop5ByAccountUserIdOrderByDateDesc(Long userId);

    // CsvExportController
    List<Transaction> findByUserUsername(String username);

    // budget calculation
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = 'EXPENSE'
          AND LOWER(t.category) = LOWER(:category)
          AND t.date BETWEEN :start AND :end
    """)
    double sumExpensesByCategory(Long userId, String category, LocalDate start, LocalDate end);
}
