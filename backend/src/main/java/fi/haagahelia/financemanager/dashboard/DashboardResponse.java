package fi.haagahelia.financemanager.dashboard;

import fi.haagahelia.financemanager.transaction.TransactionType;
import java.util.List;

public class DashboardResponse {

    private Summary summary;
    private List<RecentTransactionItem> recentTransactions;

    public DashboardResponse(Summary summary, List<RecentTransactionItem> recentTransactions) {
        this.summary = summary;
        this.recentTransactions = recentTransactions;
    }

    public Summary getSummary() {
        return summary;
    }

    public List<RecentTransactionItem> getRecentTransactions() {
        return recentTransactions;
    }

    // ----- SUMMARY -----
    public static class Summary {
        private double totalBalance;
        private double income;
        private double expenses;
        private double savingsRate;

        public Summary(double totalBalance, double income, double expenses, double savingsRate) {
            this.totalBalance = totalBalance;
            this.income = income;
            this.expenses = expenses;
            this.savingsRate = savingsRate;
        }

        public double getTotalBalance() { return totalBalance; }
        public double getIncome() { return income; }
        public double getExpenses() { return expenses; }
        public double getSavingsRate() { return savingsRate; }
    }

    // ----- RECENT TRANSACTION -----
    public static class RecentTransactionItem {
        private Long id;
        private String description;
        private double amount;
        private String date;
        private TransactionType type;   

        public RecentTransactionItem(
                Long id,
                String description,
                double amount,
                String date,
                TransactionType type
        ) {
            this.id = id;
            this.description = description;
            this.amount = amount;
            this.date = date;
            this.type = type;
        }

        public Long getId() { return id; }
        public String getDescription() { return description; }
        public double getAmount() { return amount; }
        public String getDate() { return date; }
        public TransactionType getType() { return type; }
    }
}
