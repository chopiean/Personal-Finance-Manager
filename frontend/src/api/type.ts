export type AccountResponse = {
  id: number;
  name: string;
  currency: string;
  initialBalance: number;
  type: string;
  description?: string | null;
};

export type TransactionResponse = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  accountId: number;
  accountName?: string;
};

export type CategorySummary = {
  category: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
};

export type BudgetStatus = {
  category: string;
  budgetLimit: number;
  actualExpense: number;
  difference: number;
  overBudget: boolean;
};

export type MonthlySummaryResponse = {
  year: number;
  month: number;
  accountId: number | null;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categories: CategorySummary[];
  budgetStatuses: BudgetStatus[];
};
