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
    <section className="card">
      <h1 className="page-title">Budgets</h1>
      <p className="page-subtitle">
        See how your spending compares to your monthly limits.
      </p>

      {loading ? (
        <p className="muted">Loading budgets…</p>
      ) : budgets.length === 0 ? (
        <p className="muted">
          No budgets configured for this month. Create budgets in the backend to
          see them here.
        </p>
      ) : (
        <div className="list-grid">
          {budgets.map((b) => (
            <div key={b.category} className="budget-card">
              <div className="account-name">{b.category}</div>
              <div className="account-meta">
                Limit: € {b.budgetLimit.toFixed(2)}
              </div>
              <div className="account-meta">
                Spent: € {b.actualExpense.toFixed(2)}
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="account-balance">
                  {b.difference >= 0 ? "Left" : "Over"}: €{" "}
                  {Math.abs(b.difference).toFixed(2)}
                </div>
                <span
                  className={
                    "badge " + (b.overBudget ? "badge-danger" : "badge-ok")
                  }
                >
                  {b.overBudget ? "Over budget" : "On track"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        className="btn btn-primary"
        onClick={() => navigate("/budgets/new")}
      >
        Add Budget
      </button>
    </section>
  );
}
