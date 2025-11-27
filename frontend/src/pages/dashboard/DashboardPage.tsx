import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";

// ----- Types -----
type DashboardSummary = {
  totalBalance: number;
  income: number;
  expenses: number;
  savingsRate: number;
};

type TransactionItem = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
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
        <DashboardCard
          title="Total Balance"
          value={`€${summary?.totalBalance.toFixed(2) ?? "0.00"}`}
        />

        <DashboardCard
          title="Income (This Month)"
          value={`+€${summary?.income.toFixed(2) ?? "0.00"}`}
          color="#16a34a"
        />

        <DashboardCard
          title="Expenses (This Month)"
          value={`-€${summary?.expenses.toFixed(2) ?? "0.00"}`}
          color="#dc2626"
        />

        <DashboardCard
          title="Savings Rate"
          value={`${summary?.savingsRate ?? 0}%`}
        />
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
              <strong>{t.description}</strong>
              <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
                {t.date}
              </p>
            </div>

            <div
              style={{
                fontWeight: 600,
                color: t.type === "EXPENSE" ? "#dc2626" : "#16a34a",
              }}
            >
              {t.type === "EXPENSE" ? "-" : "+"}€{t.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----- Small Card Component ----- */
function DashboardCard({
  title,
  value,
  color = "#111827",
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 20,
        background: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        border: "1px solid #f1f1f1",
      }}
    >
      <p style={{ color: "#6b7280" }}>{title}</p>
      <h2 style={{ fontSize: 32, fontWeight: 700, marginTop: 6, color }}>
        {value}
      </h2>
    </div>
  );
}
