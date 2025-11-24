package fi.haagahelia.financemanager.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for Budget entities.
 */
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByYearAndMonth(int year, int month);

    List<Budget> findByAccountIdAndYearAndMonth(Long accountId, int year, int month);

    List<Budget> findByAccountIdAndMonthAndYear(Long accountId, int month, int year);
}
