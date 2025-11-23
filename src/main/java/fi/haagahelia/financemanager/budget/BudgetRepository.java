package fi.haagahelia.financemanager.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for Budget entities
 */
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByAccountIdAndYearAndMonth(Long accountId, int year, int month);

    List<Budget> fineByYearAndMonth( int month, int year);
}
