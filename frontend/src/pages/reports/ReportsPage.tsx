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
  type ScriptableContext,
} from "chart.js";
import { apiFetch } from "../../api/api";
import type { MonthlySummaryResponse } from "../../api/type";
import Skeleton from "../../components/Skeleton";
import { useCountUp } from "../../utils/useCountUp";
import { useIsDark } from "../../utils/useTheme";

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
    apiFetch<MonthlySummaryResponse>(`/reports/monthly?year=${year}&month=${month}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [year, month]);

  const expenseCategories = useMemo(
    () => (data?.categories ?? []).filter((c) => c.totalExpense > 0),
    [data]
  );

  const dark = useIsDark();
  const textColor = dark ? "#94a3b8" : "#64748b";
  const gridColor = dark ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)";
  const tooltip = {
    backgroundColor: dark ? "#1e293b" : "#0f172a",
    padding: 12,
    cornerRadius: 10,
    titleFont: { weight: "bold" as const },
    displayColors: true,
    boxPadding: 4,
    callbacks: {
      label: (ctx: { dataset: { label?: string }; raw: unknown }) => {
        const v = Number(ctx.raw) || 0;
        return ` ${ctx.dataset.label ? ctx.dataset.label + ": " : ""}€${v.toFixed(2)}`;
      },
    },
  };

  const totalSpent = expenseCategories.reduce((sum, c) => sum + c.totalExpense, 0);

  const doughnutData = {
    labels: expenseCategories.map((c) => c.category),
    datasets: [
      {
        data: expenseCategories.map((c) => c.totalExpense),
        backgroundColor: expenseCategories.map(
          (_, i) => CHART_COLORS[i % CHART_COLORS.length]
        ),
        borderWidth: 3,
        borderColor: dark ? "#141b2d" : "#ffffff",
        borderRadius: 6,
        hoverOffset: 12,
      },
    ],
  };

  const barData = {
    labels: (data?.categories ?? []).map((c) => c.category),
    datasets: [
      {
        label: "Income",
        data: (data?.categories ?? []).map((c) => c.totalIncome),
        backgroundColor: verticalGradient("#4ade80", "#16a34a"),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 34,
      },
      {
        label: "Expense",
        data: (data?.categories ?? []).map((c) => c.totalExpense),
        backgroundColor: verticalGradient("#f87171", "#dc2626"),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 34,
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
    setLoading(true);
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="pfm-page" style={{ padding: "40px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 className="pfm-title" style={{ fontSize: 34, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.5px" }}>
        Reports
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 16 }}>
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
        <button onClick={() => shiftMonth(-1)} style={arrowButtonStyle} className="month-arrow" aria-label="Previous month">
          ‹
        </button>
        <div key={`${year}-${month}`} className="month-label" style={{ fontSize: 18, fontWeight: 600, minWidth: 160, textAlign: "center" }}>
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <button onClick={() => shiftMonth(1)} style={arrowButtonStyle} className="month-arrow" aria-label="Next month">
          ›
        </button>
      </div>

      {loading ? (
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <span className="sr-only">Loading report…</span>
          {[0, 1].map((i) => (
            <div key={i} className="pfm-card" style={cardStyle}>
              <Skeleton width="45%" height={16} style={{ marginBottom: 20 }} />
              <Skeleton height={220} radius={16} />
            </div>
          ))}
        </div>
      ) : !data || data.categories.length === 0 ? (
        <div className="pfm-card" style={{ ...cardStyle, textAlign: "center", padding: "48px 24px" }}>
          <div aria-hidden="true" style={{ fontSize: 40, animation: "float 4s ease-in-out infinite" }}>📊</div>
          <p style={{ color: "var(--text-faint)", marginTop: 10 }}>No transactions for this month.</p>
        </div>
      ) : (
        <div
          key={`${year}-${month}`}
          className="responsive-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div className="pfm-card" style={cardStyle}>
            <h2 style={cardTitleStyle}>Expenses by Category</h2>
            {expenseCategories.length === 0 ? (
              <p style={{ color: "var(--text-faint)" }}>No expenses recorded.</p>
            ) : (
              <>
                <div style={{ position: "relative", maxWidth: 260, margin: "0 auto" }}>
                  <Doughnut
                    data={doughnutData}
                    options={{
                      cutout: "70%",
                      animation: { animateRotate: true, animateScale: true, duration: 1100 },
                      plugins: { legend: { display: false }, tooltip },
                    }}
                  />
                  <div className="doughnut-center" aria-hidden="true">
                    <span>Spent</span>
                    <strong>€{Math.round(totalSpent).toLocaleString("en-GB")}</strong>
                  </div>
                </div>
                <ul className="chart-legend">
                  {expenseCategories.map((c, i) => (
                    <li key={c.category} style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
                      <span
                        className="legend-dot"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="legend-name">{c.category}</span>
                      <span className="legend-pct">
                        {totalSpent > 0 ? Math.round((c.totalExpense / totalSpent) * 100) : 0}%
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="pfm-card" style={cardStyle}>
            <h2 style={cardTitleStyle}>Income vs Expense</h2>
            <Bar
              data={barData}
              options={{
                animation: { duration: 1000, easing: "easeOutQuart" },
                interaction: { mode: "index", intersect: false },
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: textColor, usePointStyle: true, pointStyle: "circle", padding: 18 },
                  },
                  tooltip,
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: textColor }, border: { display: false } },
                  y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor, callback: (v) => `€${v}` },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>

          <div className="pfm-card" style={{ ...cardStyle, gridColumn: "1 / -1" }}>
            <h2 style={cardTitleStyle}>Monthly Summary</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 48px" }}>
              <SummaryStat label="Income" value={data.totalIncome} color="#16a34a" />
              <SummaryStat label="Expense" value={data.totalExpense} color="#dc2626" />
              <SummaryStat label="Net" value={data.netBalance} color="var(--text)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  const animated = useCountUp(value);
  return (
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
        €{animated.toFixed(2)}
      </p>
    </div>
  );
}

/** Scriptable chart.js colour: a top-to-bottom gradient sized to the chart area. */
function verticalGradient(top: string, bottom: string) {
  return (ctx: ScriptableContext<"bar">) => {
    const { ctx: c, chartArea } = ctx.chart;
    if (!chartArea) return bottom;
    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    return g;
  };
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  padding: "24px 22px",
  borderRadius: 20,
  boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
  border: "1px solid var(--border)",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
  color: "var(--text)",
};

const arrowButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  fontSize: 18,
  cursor: "pointer",
  color: "var(--text)",
};
