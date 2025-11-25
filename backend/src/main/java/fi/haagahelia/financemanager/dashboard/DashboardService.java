package fi.haagahelia.financemanager.dashboard;

import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.security.CurrentUserService;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.transaction.TransactionType;
import fi.haagahelia.financemanager.user.User;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(AccountRepository accountRepository,
                            TransactionRepository transactionRepository,
                            CurrentUserService currentUserService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    public DashboardResponse buildDashboard() {

        User user = currentUserService.getCurrentUser();

        double totalBalance = accountRepository.findByUserId(user.getId())
                .stream()
                .mapToDouble(a -> a.getInitialBalance().doubleValue())
                .sum();

        List<Transaction> allUserTx = transactionRepository.findByAccountUserId(user.getId());

        double income = allUserTx.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expenses = allUserTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double savingsRate =
                (income == 0) ? 0 : ((income - expenses) / income) * 100;

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        List<DashboardResponse.RecentTransactionItem> recent =
                transactionRepository.findTop5ByAccountUserIdOrderByDateDesc(user.getId())
                        .stream()
                        .map(t -> new DashboardResponse.RecentTransactionItem(
                                t.getId(),
                                t.getDescription(),
                                t.getAmount(),
                                t.getDate().format(fmt)
                        ))
                        .toList();

        DashboardResponse.Summary summary =
                new DashboardResponse.Summary(
                        totalBalance,
                        income,
                        expenses,
                        Math.round(savingsRate)
                );

        return new DashboardResponse(summary, recent);
    }
}
