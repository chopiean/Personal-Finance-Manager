package fi.haagahelia.financemanager.dashboard;

import java.util.List;

public class DashboardResponse {

    public Summary summary;
    public List<RecentTransactionItem> recentTransactions;

    public DashboardResponse(Summary summary, List<RecentTransactionItem> recentTransactions) {
        this.summary = summary;
        this.recentTransactions = recentTransactions;
    }

    public static class Summary {
        public double totalBalance;
        public double income;
        public double expenses;
        public double savingsRate;

        public Summary(double totalBalance, double income, double expenses, double savingsRate) {
            this.totalBalance = totalBalance;
            this.income = income;
            this.expenses = expenses;
            this.savingsRate = savingsRate;
        }
    }

    public static class RecentTransactionItem {
        public Long id;
        public String category;
        public double amount;
        public String date;

        public RecentTransactionItem(Long id, String category, double amount, String date){
            this.id = id;
            this.category = category;
            this.amount = amount;
            this.date = date;
        }
    }
 }
