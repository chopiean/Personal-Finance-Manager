import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";

// Types
type DashboardSummary = {
  totalBalance: number;
  income: number;
  expenses: number;
  savingsRate: number;
};

type TransactionItem = {
  id: number;
  category: string;
  amount: number;
  date: string;
};

type DashboardResponse = {
  summary: DashboardSummary;
  recentTransactions: TransactionItem[];
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<TransactionItem[]>([]);

  useEffect(() => {
    (async () => {
      const data = (await apiFetch("/dashboard")) as DashboardResponse;
      setSummary(data.summary);
      setRecent(data.recentTransactions);
    })();
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: 1200,
        margin: "0 auto",
        color: "#111827",
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          marginBottom: 20,
        }}
      >
        Welcome back 👋
      </h1>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 24,
          marginBottom: 40,
        }}
      >
        {/* Total Balance */}
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid #f1f1f1",
          }}
        >
          <p style={{ color: "#6b7280" }}>Total Balance</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginTop: 6 }}>
            €{summary?.totalBalance.toFixed(2) ?? "0.00"}
          </h2>
        </div>

        {/* Income */}
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid #f1f1f1",
          }}
        >
          <p style={{ color: "#6b7280" }}>Income (This Month)</p>
          <h3
            style={{
              fontSize: 26,
              fontWeight: 600,
              marginTop: 6,
              color: "#16a34a",
            }}
          >
            +€{summary?.income.toFixed(2) ?? "0.00"}
          </h3>
        </div>

        {/* Expenses */}
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid #f1f1f1",
          }}
        >
          <p style={{ color: "#6b7280" }}>Expenses (This Month)</p>
          <h3
            style={{
              fontSize: 26,
              fontWeight: 600,
              marginTop: 6,
              color: "#dc2626",
            }}
          >
            -€{summary?.expenses.toFixed(2) ?? "0.00"}
          </h3>
        </div>

        {/* Savings */}
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid #f1f1f1",
          }}
        >
          <p style={{ color: "#6b7280" }}>Savings Rate</p>
          <h3 style={{ fontSize: 26, fontWeight: 600, marginTop: 6 }}>
            {summary?.savingsRate ?? 0}%
          </h3>
        </div>
      </div>

      {/* Recent Transactions */}
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 16,
          letterSpacing: "-0.2px",
        }}
      >
        Recent Transactions
      </h2>

      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          border: "1px solid #f1f1f1",
        }}
      >
        {recent.length === 0 && (
          <p style={{ color: "#9ca3af" }}>No recent transactions.</p>
        )}

        {recent.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "14px 0",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>{t.category}</strong>
              <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
                {t.date}
              </p>
            </div>

            <div
              style={{
                fontWeight: 600,
                color: t.amount >= 0 ? "#16a34a" : "#dc2626",
              }}
            >
              {t.amount >= 0 ? "+" : "-"}€{Math.abs(t.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
