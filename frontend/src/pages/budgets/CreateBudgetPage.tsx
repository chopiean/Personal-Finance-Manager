import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";
import type { AccountResponse } from "../../api/type";

export default function CreateBudgetPage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [accountId, setAccountId] = useState<number | null>(null);

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);

  useEffect(() => {
    apiFetch<AccountResponse[]>("/accounts").then(setAccounts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      category,
      limitAmount: Number(limitAmount),
      month,
      year,
      accountId,
    };

    await apiFetch("/budgets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    navigate("/budgets");
  };

  return (
    <section className="card">
      <h1 className="page-title">Create Budget</h1>

      <form onSubmit={handleSubmit} className="form-grid">
        <div>
          <label className="field-label">Category</label>
          <input
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Shopping, Groceries, Travel..."
            required
          />
        </div>

        <div>
          <label className="field-label">Limit (€)</label>
          <input
            className="input"
            type="number"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="field-label">Month</label>
          <input
            className="input"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="field-label">Year</label>
          <input
            className="input"
            type="number"
            min={2020}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="field-label">Account</label>
          <select
            className="select"
            value={accountId ?? ""}
            onChange={(e) => setAccountId(Number(e.target.value))}
            required
          >
            <option value="" disabled>
              Select account…
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.currency}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" type="submit">
          Create Budget
        </button>
      </form>
    </section>
  );
}
