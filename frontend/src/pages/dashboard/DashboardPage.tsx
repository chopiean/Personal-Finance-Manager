// src/pages/dashboard/DashboardPage.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import type { MonthlySummaryResponse } from "../../api/type";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [summary, setSummary] = useState<MonthlySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const load = async () => {
      try {
        const data = await apiFetch<MonthlySummaryResponse>(
          `/reports/monthly?year=${year}&month=${month}`
        );
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <section className="card">Loading dashboard…</section>;
  }

  if (!summary) {
    return (
      <section className="card">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          No data yet – start by creating an account and adding a transaction.
        </p>
      </section>
    );
  }

  const expenseCategories = summary.categories.filter(
    (c) => c.totalExpense > 0
  );

  const chartData = {
    labels: expenseCategories.map((c) => c.category),
    datasets: [
      {
        data: expenseCategories.map((c) => c.totalExpense),
        backgroundColor: [
          "#22c55e",
          "#0ea5e9",
          "#f97316",
          "#a855f7",
          "#facc15",
          "#ec4899",
        ],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#374151",
        },
      },
    },
  };

  const monthLabel = new Date(summary.year, summary.month - 1).toLocaleString(
    undefined,
    { month: "long", year: "numeric" }
  );

  return (
    <div className="grid grid-2">
      <section className="card">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">{monthLabel}</p>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total income</div>
            <div className="stat-value stat-value-positive">
              € {summary.totalIncome.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total expenses</div>
            <div className="stat-value stat-value-negative">
              € {summary.totalExpense.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Net balance</div>
            <div
              className={
                "stat-value " +
                (summary.netBalance >= 0
                  ? "stat-value-positive"
                  : "stat-value-negative")
              }
            >
              € {summary.netBalance.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Tracked categories</div>
            <div className="stat-value">{summary.categories.length || 0}</div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="page-title">Expenses by category</h2>
        {expenseCategories.length === 0 ? (
          <p className="muted">No expenses recorded for this period.</p>
        ) : (
          <Doughnut data={chartData} options={chartOptions} />
        )}
      </section>
    </div>
  );
}
