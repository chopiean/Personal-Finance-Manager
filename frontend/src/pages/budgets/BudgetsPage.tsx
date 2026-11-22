// src/pages/budgets/BudgetsPage.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

import type {
  MonthlySummaryResponse,
  BudgetStatus,
  TransactionResponse,
} from "../../api/type";
import DeleteButton from "../../components/DeleteButton";
import Skeleton from "../../components/Skeleton";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [txs, setTxs] = useState<TransactionResponse[] | null>(null);
  const [txError, setTxError] = useState(false);
  const navigate = useNavigate();

  // Transactions are fetched once, the first time a budget is opened
  const toggle = (id: number) => {
    setOpenId((cur) => (cur === id ? null : id));
    if (txs === null) {
      setTxError(false);
      apiFetch<TransactionResponse[]>("/transactions")
        .then((data) => setTxs(data ?? []))
        .catch(() => setTxError(true));
    }
  };

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const load = async () => {
      try {
        const data = await apiFetch<MonthlySummaryResponse>(
          `/reports/monthly?year=${year}&month=${month}`
        );
        setBudgets(data.budgetStatuses ?? []);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const deleteBudget = async (b: BudgetStatus) => {
    await apiFetch(`/budgets/${b.budgetId}`, { method: "DELETE" });
    setBudgets((prev) => prev.filter((x) => x.budgetId !== b.budgetId));
  };

  return (
    <div
      className="pfm-page"
      style={{
        padding: "40px 24px",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <h1
        className="pfm-title"
        style={{
          fontSize: 34,
          fontWeight: 700,
          marginBottom: 5,
          letterSpacing: "-0.5px",
        }}
      >
        Budgets
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 16 }}>
        See how your spending compares to your monthly limits.
      </p>

      {/* Main card */}
      <div
        className="pfm-card"
        style={{
          background: "var(--surface)",
          padding: "28px 26px 24px",
          borderRadius: 20,
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
          border: "1px solid var(--border)",
        }}
      >
        {loading ? (
          <div
            className="responsive-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <span className="sr-only">Loading budgets…</span>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Skeleton width="40%" height={16} />
                  <Skeleton width={70} height={20} radius={999} />
                </div>
                <Skeleton width="70%" height={12} />
                <Skeleton height={10} radius={999} />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <p style={{ color: "var(--text-faint)" }}>
            No budgets configured for this month. Create budgets in the backend
            to see them here.
          </p>
        ) : (
          <div
            className="responsive-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            {budgets.map((b, i) => {
              const spent = b.actualExpense;
              const limit = b.budgetLimit;
              const percent =
                limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;

              const over = b.overBudget;
              const ratio = limit > 0 ? (spent / limit) * 100 : 0;
              const level = over || ratio >= 100 ? "danger" : ratio >= 75 ? "warn" : "ok";
              const fill = {
                ok: "linear-gradient(90deg,#4ade80,#16a34a)",
                warn: "linear-gradient(90deg,#fcd34d,#f59e0b)",
                danger: "linear-gradient(90deg,#f87171,#dc2626)",
              }[level];

              const isOpen = openId === b.budgetId;

              return (
                <div
                  key={b.budgetId}
                  className="budget-tile"
                  onClick={() => toggle(b.budgetId)}
                  style={{
                    cursor: "pointer",
                    gridColumn: isOpen ? "1 / -1" : undefined,
                    animationDelay: `${i * 0.07}s`,
                    padding: "18px 18px 16px",
                    borderRadius: 18,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Category + badge */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Hide" : "Show"} ${b.category} transactions`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(b.budgetId);
                      }}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                        color: "var(--text)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {b.category}
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(90deg)" : "none",
                        }}
                      >
                        ▶
                      </span>
                    </button>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: over ? "#fee2e2" : "#dcfce7",
                        color: over ? "#b91c1c" : "#166534",
                      }}
                    >
                      {over ? "Over budget" : "On track"}
                    </span>
                  </div>

                  {/* Numbers */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>Limit: €{limit.toFixed(2)}</span>
                    <span>Spent: €{spent.toFixed(2)}</span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="budget-bar"
                    role="progressbar"
                    aria-label={`${b.category} budget used`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(percent)}
                    style={{ marginTop: 6 }}
                  >
                    <AnimatedFill
                      percent={percent}
                      background={fill}
                      danger={level === "danger"}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: level === "ok" ? "#16a34a" : level === "warn" ? "#d97706" : "#dc2626",
                    }}
                  >
                    {Math.round(ratio)}% used
                  </div>

                  {/* Remaining */}
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: over ? "#b91c1c" : "#166534",
                      fontWeight: 500,
                    }}
                  >
                    {b.difference >= 0 ? "Left" : "Over"}: €{" "}
                    {Math.abs(b.difference).toFixed(2)}
                  </div>

                  {isOpen && (
                    <BudgetTransactions
                      category={b.category}
                      txs={txs}
                      error={txError}
                    />
                  )}

                  <div
                    style={{ marginTop: 4, textAlign: "right" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DeleteButton
                      label={`Delete ${b.category} budget`}
                      confirmMessage={`Delete the "${b.category}" budget? Your transactions will not be affected.`}
                      onDelete={() => deleteBudget(b)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Budget button */}
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button
            onClick={() => navigate("/budgets/new")}
            style={{
              background: "var(--accent-gradient)",
              color: "var(--on-accent)",
              border: "none",
              padding: "10px 18px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 6px 16px var(--accent-shadow)",
            }}
          >
            Add Budget
          </button>
        </div>
      </div>
    </div>
  );
}

const categoryKey = (c?: string | null) =>
  c && c.trim() ? c.trim().toLowerCase() : "uncategorized";

/** This month's expenses in the budget's category (same matching as the backend report). */
function BudgetTransactions({
  category,
  txs,
  error,
}: {
  category: string;
  txs: TransactionResponse[] | null;
  error: boolean;
}) {
  if (error) {
    return <p style={{ fontSize: 13, color: "#b91c1c" }}>Could not load transactions.</p>;
  }
  if (txs === null) {
    return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading transactions…</p>;
  }

  const today = new Date();
  const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const key = categoryKey(category);
  const rows = txs
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        t.date.startsWith(monthPrefix) &&
        categoryKey(t.category) === key
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  if (rows.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
        No {category} expenses this month.
      </p>
    );
  }

  return (
    <ul
      aria-label={`${category} transactions`}
      onClick={(e) => e.stopPropagation()}
      style={{
        listStyle: "none",
        margin: "8px 0 0",
        padding: 0,
        borderTop: "1px solid var(--border)",
        cursor: "default",
      }}
    >
      {rows.map((t) => (
        <li
          key={t.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            padding: "8px 0",
            borderBottom: "1px solid var(--border)",
            fontSize: 13,
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>
              {t.description || "(no description)"}
            </span>
            <span style={{ display: "block", color: "var(--text-faint)", fontSize: 12 }}>
              {t.date}
              {t.accountName ? ` · ${t.accountName}` : ""}
            </span>
          </span>
          <span style={{ color: "var(--text)", fontWeight: 600, whiteSpace: "nowrap" }}>
            €{t.amount.toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Starts at 0 and grows to its width after mount, so the bar animates in. */
function AnimatedFill({
  percent,
  background,
  danger,
}: {
  percent: number;
  background: string;
  danger: boolean;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(percent));
    return () => cancelAnimationFrame(id);
  }, [percent]);

  return (
    <div
      className={danger ? "budget-bar-fill danger" : "budget-bar-fill"}
      style={{ width: `${width}%`, background }}
    />
  );
}
