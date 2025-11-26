package fi.haagahelia.financemanager.budget;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Find by ACCOUNT ID
    List<Budget> findByAccountIdAndYearAndMonth(Long accountId, int year, int month);

    // Find all budgets for a user (via account → user)
    List<Budget> findByAccountUserIdAndYearAndMonth(Long userId, int year, int month);

    // All budgets for a user WITHOUT month filter (optional)
    List<Budget> findByAccountUserId(Long userId);
}
