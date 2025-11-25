import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";

export type Budget = {
  id: number;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    apiFetch<Budget[]>("/budgets")
      .then((data) => setBudgets(data))
      .catch(() => setBudgets([]));
  }, []);

  return (
    <section className="card apple-card">
      <h1 className="page-title">Budgets</h1>
      <p className="page-subtitle">
        Monthly spending limits tracked per category
      </p>

      {budgets.length === 0 ? (
        <p className="muted">No budgets created yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Limit (€)</th>
                <th>Month</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id}>
                  <td>{b.category}</td>
                  <td>€{b.limitAmount.toFixed(2)}</td>
                  <td>{b.month}</td>
                  <td>{b.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
