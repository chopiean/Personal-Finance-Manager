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
    const y = today.getFullYear();
    const m = today.getMonth() + 1;

    const load = async () => {
      try {
        const data = await apiFetch<MonthlySummaryResponse>(
          `/reports/monthly?year=${y}&month=${m}`
        );
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="card">Loading dashboard...</div>;
  }

  if (!summary) {
    return <div className="card">No data yet. Try adding a transaction.</div>;
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
          color: "#e5e7eb",
        },
      },
    },
  };

  return (
    <div className="grid grid-2">
      <section className="card">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          {summary.month}/{summary.year}
        </p>

        <div className="grid grid-2">
          <div className="stat-card">
            <div className="muted">Total income</div>
            <div className="value-green">
              € {summary.totalIncome.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <div className="muted">Total expenses</div>
            <div className="value-red">€ {summary.totalExpense.toFixed(2)}</div>
          </div>

          <div className="stat-card">
            <div className="muted">Net balance</div>
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: summary.netBalance >= 0 ? "#4ade80" : "#f97373",
              }}
            >
              € {summary.netBalance.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <div className="muted">Tracked categories</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>
              {summary.categories.length}
            </div>
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
