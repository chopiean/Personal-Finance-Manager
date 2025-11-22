package fi.haagahelia.financemanager.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for reading/writing Budget entities from database
 */
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByAccountId(Long accountId);

    List<Budget> findByAccountIdAndMonthAndYear(Long id, int month, int year);
}
