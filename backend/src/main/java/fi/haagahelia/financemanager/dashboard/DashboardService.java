package fi.haagahelia.financemanager.dashboard;

import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.transaction.Transaction;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public DashboardService(AccountRepository accountRepository,
                            TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public DashboardResponse buildDashboard() {

        double totalBalance = accountRepository.findAll()
                .stream()
                .mapToDouble(a -> a.getInitialBalance())
                .sum();

        double income = transactionRepository.findAll()
                .stream()
                .filter(t -> t.getAmount() > 0)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expenses = transactionRepository.findAll()
                .stream()
                .filter(t -> t.getAmount() < 0)
                .mapToDouble(t -> Math.abs(t.getAmount()))
                .sum();

        double savingsRate =
                (income == 0) ? 0 : (income - expenses) / income * 100;

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        List<DashboardResponse.RecentTransactionItem> recent =
                transactionRepository.findTop5ByOrderByDateDesc()
                        .stream()
                        .map(t -> new DashboardResponse.RecentTransactionItem(
                                t.getId(),
                                t.getCategory(),
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
