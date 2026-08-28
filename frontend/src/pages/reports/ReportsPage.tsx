import { useEffect, useMemo, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { apiFetch } from "../../api/api";
import type { MonthlySummaryResponse } from "../../api/type";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CHART_COLORS = [
  "#6366f1", "#22c55e", "#f97316", "#ec4899", "#14b8a6",
  "#eab308", "#8b5cf6", "#ef4444", "#0ea5e9", "#84cc16",
];

export default function ReportsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState<MonthlySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<MonthlySummaryResponse>(`/reports/monthly?year=${year}&month=${month}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [year, month]);

  const expenseCategories = useMemo(
    () => (data?.categories ?? []).filter((c) => c.totalExpense > 0),
    [data]
  );

  const doughnutData = {
    labels: expenseCategories.map((c) => c.category),
    datasets: [
      {
        data: expenseCategories.map((c) => c.totalExpense),
        backgroundColor: expenseCategories.map(
          (_, i) => CHART_COLORS[i % CHART_COLORS.length]
        ),
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: (data?.categories ?? []).map((c) => c.category),
    datasets: [
      {
        label: "Income",
        data: (data?.categories ?? []).map((c) => c.totalIncome),
        backgroundColor: "#16a34a",
        borderRadius: 6,
      },
      {
        label: "Expense",
        data: (data?.categories ?? []).map((c) => c.totalExpense),
        backgroundColor: "#dc2626",
        borderRadius: 6,
      },
    ],
  };

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.5px" }}>
        Reports
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 28, fontSize: 16 }}>
        Visual breakdown of your income and expenses by category.
      </p>

      {/* Month selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <button onClick={() => shiftMonth(-1)} style={arrowButtonStyle}>
          ‹
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, minWidth: 160, textAlign: "center" }}>
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <button onClick={() => shiftMonth(1)} style={arrowButtonStyle}>
          ›
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading report…</p>
      ) : !data || data.categories.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No transactions for this month.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Expenses by Category</h2>
            {expenseCategories.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No expenses recorded.</p>
            ) : (
              <Doughnut
                data={doughnutData}
                options={{ plugins: { legend: { position: "bottom" } } }}
              />
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Income vs Expense</h2>
            <Bar
              data={barData}
              options={{
                plugins: { legend: { position: "bottom" } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>

          <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
            <h2 style={cardTitleStyle}>Monthly Summary</h2>
            <div style={{ display: "flex", gap: 32 }}>
              <SummaryStat label="Income" value={data.totalIncome} color="#16a34a" />
              <SummaryStat label="Expense" value={data.totalExpense} color="#dc2626" />
              <SummaryStat label="Net" value={data.netBalance} color="#111827" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p style={{ color: "#6b7280", fontSize: 14 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color }}>€{value.toFixed(2)}</p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "24px 22px",
  borderRadius: 20,
  boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
  border: "1px solid #eef0f2",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
  color: "#111827",
};

const arrowButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "white",
  fontSize: 18,
  cursor: "pointer",
  color: "#374151",
};
