import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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
  const [form, setForm] = useState<TransactionForm>(() => ({
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    type: "EXPENSE",
    accountId: "",
  }));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [tx, acc] = await Promise.all([
        apiFetch<TransactionResponse[]>("/transactions"),
        apiFetch<AccountResponse[]>("/accounts"),
      ]);
      setTransactions(tx);
      setAccounts(acc);
    };
    void load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.accountId || !form.amount || !form.description) return;
    setSubmitting(true);

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
      setForm((prev) => ({
        ...prev,
        description: "",
        amount: "",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <h1 className="page-title">New transaction</h1>
        <p className="page-subtitle">
          Quickly log income, expenses or transfers.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <div className="field-label">Description</div>
              <input
                className="input"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Groceries, Rent, Salary…"
              />
            </div>

            <div>
              <div className="field-label">Amount (€)</div>
              <input
                className="input"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="field-label">Date</div>
              <input
                className="input"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="field-label">Type</div>
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
              <div className="field-label">Account</div>
              <select
                className="select"
                name="accountId"
                value={form.accountId}
                onChange={handleChange}
              >
                <option value="">Choose account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Add transaction"}
          </button>
        </form>
      </section>

      <section className="card">
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
                    No transactions yet.
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
                        className={
                          "chip " +
                          (t.type === "INCOME" ? "chip-income" : "chip-expense")
                        }
                      >
                        {t.type}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {t.type === "EXPENSE" ? "-" : "+"}€{t.amount.toFixed(2)}
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
