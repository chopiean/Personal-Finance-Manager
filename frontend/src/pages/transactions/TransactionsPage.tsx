import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { apiFetch } from "../../api/api";
import type { AccountResponse, TransactionResponse } from "../../api/type";

type TransactionForm = {
  description: string;
  amount: string;
  date: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  accountId: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [form, setForm] = useState<TransactionForm>({
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    type: "EXPENSE",
    accountId: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const tx = await apiFetch<TransactionResponse[]>("/transactions");
      const acc = await apiFetch<AccountResponse[]>("/accounts");
      setTransactions(tx);
      setAccounts(acc);
    };
    load();
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        type: form.type,
        accountId: Number(form.accountId),
      };

      const created = await apiFetch<TransactionResponse>("/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setTransactions((prev) => [created, ...prev]);
      setForm({ ...form, description: "", amount: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid">
      <section className="card apple-card">
        <h1 className="page-title">New transaction</h1>
        <p className="page-subtitle">Log income, expenses or transfers</p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="field-label">Description</label>
              <input
                className="input"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="field-label">Amount (€)</label>
              <input
                className="input"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="field-label">Date</label>
              <input
                className="input"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="field-label">Type</label>
              <select
                className="select"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            <div>
              <label className="field-label">Account</label>
              <select
                className="select"
                name="accountId"
                value={form.accountId}
                onChange={handleChange}
              >
                <option value="">Select account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Add transaction"}
          </button>
        </form>
      </section>

      <section className="card apple-card">
        <h2 className="page-title">Recent transactions</h2>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Details</th>
                <th>Account</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td>{t.accountName ?? t.accountId}</td>
                    <td>
                      <span
                        className={`chip ${
                          t.type === "INCOME" ? "chip-income" : "chip-expense"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {t.type === "EXPENSE" ? "-" : "+"} €{t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
