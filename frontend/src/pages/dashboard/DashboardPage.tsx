import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { apiFetch } from "../../api/api";
import { formatDate } from "../../utils/formatDate";
import { useCountUp } from "../../utils/useCountUp";
import Skeleton from "../../components/Skeleton";
import {
  IconPiggy,
  IconTrendDown,
  IconTrendUp,
  IconWallet,
} from "../../components/Icons";

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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");

  useEffect(() => {
    (async () => {
      try {
        const data = (await apiFetch("/dashboard")) as DashboardResponse;
        setSummary(data.summary);
        setRecent(data.recentTransactions);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const savingsRate = summary?.savingsRate ?? 0;

  return (
    <div
      className="pfm-page"
      style={{
        padding: "40px",
        maxWidth: 1200,
        margin: "0 auto",
        color: "var(--text)",
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1
          className="pfm-title"
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "-0.8px",
          }}
        >
          {greeting()}
          {username ? `, ${username}` : ""}
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
          Here's how your money is doing this month.
        </p>
      </header>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 20,
          marginBottom: 36,
        }}
      >
        <DashboardCard
          index={0}
          title="Total Balance"
          amount={summary?.totalBalance ?? 0}
          format={(v) => `€${v.toFixed(2)}`}
          icon={IconWallet}
          tint="#6366f1"
          loading={loading}
        />

        <DashboardCard
          index={1}
          title="Income (This Month)"
          amount={summary?.income ?? 0}
          format={(v) => `+€${v.toFixed(2)}`}
          color="#16a34a"
          icon={IconTrendUp}
          tint="#16a34a"
          loading={loading}
        />

        <DashboardCard
          index={2}
          title="Expenses (This Month)"
          amount={summary?.expenses ?? 0}
          format={(v) => `-€${v.toFixed(2)}`}
          color="#dc2626"
          icon={IconTrendDown}
          tint="#dc2626"
          loading={loading}
        />

        <DashboardCard
          index={3}
          title="Savings Rate"
          amount={savingsRate}
          format={(v) => `${Number(v.toFixed(1))}%`}
          color={savingsRate < 0 ? "#dc2626" : "#16a34a"}
          icon={IconPiggy}
          tint="#f59e0b"
          progress={Math.max(0, Math.min(100, savingsRate))}
          loading={loading}
        />
      </div>

      {/* Recent Transactions */}
      <section
        className="pfm-card"
        style={{
          background: "var(--surface)",
          borderRadius: 24,
          padding: "24px 28px",
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>
            Recent Transactions
          </h2>
          {recent.length > 0 && (
            <span style={{ fontSize: 13, color: "var(--text-faint)" }}>
              Last {recent.length}
            </span>
          )}
        </div>

        {loading && (
          <div>
            <span className="sr-only">Loading dashboard…</span>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
                <Skeleton width={42} height={42} radius={21} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skeleton width="45%" height={14} />
                  <Skeleton width="25%" height={11} />
                </div>
                <Skeleton width={70} height={16} />
              </div>
            ))}
          </div>
        )}

        {!loading && recent.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div
              aria-hidden="true"
              style={{
                fontSize: 36,
                marginBottom: 8,
                animation: "float 4s ease-in-out infinite",
              }}
            >
              🧾
            </div>
            <p style={{ color: "var(--text-faint)" }}>No recent transactions.</p>
          </div>
        )}

        {recent.map((t, i) => {
          const expense = t.type === "EXPENSE";
          return (
            <div
              key={t.id}
              className="tx-row"
              style={{ animationDelay: `${0.25 + i * 0.06}s` }}
            >
              <div
                className="tx-avatar"
                aria-hidden="true"
                style={{
                  background: expense ? "#fef2f2" : "#f0fdf4",
                  color: expense ? "#dc2626" : "#16a34a",
                }}
              >
                {expense ? <IconTrendDown size={18} /> : <IconTrendUp size={18} />}
              </div>

              <div style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                <strong style={{ fontWeight: 600 }}>{t.description}</strong>
                <p style={{ color: "var(--text-faint)", marginTop: 2, fontSize: 13 }}>
                  {formatDate(t.date)}
                </p>
              </div>

              <div
                style={{
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: expense ? "#dc2626" : "#16a34a",
                }}
              >
                {expense ? "-" : "+"}€{t.amount.toFixed(2)}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

/* ----- Stat Card Component ----- */
function DashboardCard({
  title,
  amount,
  format,
  color = "var(--text)",
  icon: Icon,
  tint,
  progress,
  index,
  loading,
}: {
  title: string;
  amount: number;
  format: (v: number) => string;
  color?: string;
  icon: ComponentType<{ size?: number }>;
  tint: string;
  progress?: number;
  index: number;
  loading: boolean;
}) {
  const animated = useCountUp(amount);

  return (
    <div
      className="pfm-card stat-card"
      style={
        {
          padding: 22,
          borderRadius: 22,
          background: "var(--surface)",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          border: "1px solid var(--border)",
          animation: `pop-in 0.6s var(--ease-out) ${0.1 + index * 0.08}s backwards`,
          "--glow": `${tint}14`,
        } as CSSProperties
      }
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>{title}</p>
        <span
          className="stat-icon"
          style={{ background: `${tint}1a`, color: tint }}
        >
          <Icon size={20} />
        </span>
      </div>

      <h2
        className="pfm-stat-value"
        style={{
          position: "relative",
          fontSize: 30,
          fontWeight: 800,
          marginTop: 10,
          letterSpacing: "-0.5px",
          fontVariantNumeric: "tabular-nums",
          color,
        }}
      >
        {loading ? <Skeleton width="65%" height={30} style={{ marginTop: 4 }} /> : format(animated)}
      </h2>

      {progress !== undefined && !loading && (
        <div className="progress-track" aria-hidden="true">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg,#fbbf24,#16a34a)",
            }}
          />
        </div>
      )}
    </div>
  );
}
