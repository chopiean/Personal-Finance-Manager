// src/pages/budgets/BudgetsPage.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

import type { MonthlySummaryResponse, BudgetStatus } from "../../api/type";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: 34,
          fontWeight: 700,
          marginBottom: 5,
          letterSpacing: "-0.5px",
        }}
      >
        Budgets
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 28, fontSize: 16 }}>
        See how your spending compares to your monthly limits.
      </p>

      {/* Main card */}
      <div
        style={{
          background: "white",
          padding: "28px 26px 24px",
          borderRadius: 20,
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
          border: "1px solid #eef0f2",
        }}
      >
        {loading ? (
          <p style={{ color: "#9ca3af" }}>Loading budgets…</p>
        ) : budgets.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>
            No budgets configured for this month. Create budgets in the backend
            to see them here.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            {budgets.map((b) => {
              const spent = b.actualExpense;
              const limit = b.budgetLimit;
              const percent =
                limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;

              const over = b.overBudget;

              return (
                <div
                  key={b.category}
                  style={{
                    padding: "18px 18px 16px",
                    borderRadius: 18,
                    background: "#fafafa",
                    border: "1px solid #e5e7eb",
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
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#111827",
                      }}
                    >
                      {b.category}
                    </div>
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
                      color: "#6b7280",
                    }}
                  >
                    <span>Limit: €{limit.toFixed(2)}</span>
                    <span>Spent: €{spent.toFixed(2)}</span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      marginTop: 6,
                      height: 8,
                      borderRadius: 999,
                      background: "#e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        borderRadius: 999,
                        transition: "width 0.3s ease",
                        background: over
                          ? "linear-gradient(90deg,#f97373,#ef4444)"
                          : "linear-gradient(90deg,#4ade80,#22c55e)",
                      }}
                    />
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
              background: "linear-gradient(135deg, #4f46e5, #635bff)",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(99,90,255,0.25)",
            }}
          >
            Add Budget
          </button>
        </div>
      </div>
    </div>
  );
}
