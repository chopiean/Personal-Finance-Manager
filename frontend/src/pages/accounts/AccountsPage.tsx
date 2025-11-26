import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import type { AccountResponse } from "../../api/type";

type AccountForm = {
  name: string;
  currency: string;
  initialBalance: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [form, setForm] = useState<AccountForm>({
    name: "",
    currency: "EUR",
    initialBalance: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await apiFetch<AccountResponse[]>("/accounts");
      setAccounts(data);
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.initialBalance) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        currency: form.currency,
        initialBalance: Number(form.initialBalance),
      };

      const created = await apiFetch<AccountResponse>("/accounts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAccounts((prev) => [...prev, created]);
      setForm({ name: "", currency: "EUR", initialBalance: "" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Page Title */}
      <h1
        style={{
          fontSize: 34,
          fontWeight: 700,
          marginBottom: 4,
          letterSpacing: "-0.5px",
        }}
      >
        Transactions
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 15 }}>
        Quickly log your income, expenses and transfers.
      </p>

      {/* Two Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 32,
        }}
      >
        {/* LEFT CARD: New Transaction */}
        <div
          style={{
            background: "white",
            padding: "32px 28px",
            borderRadius: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            border: "1px solid #eef0f2",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              marginBottom: 16,
              fontWeight: 600,
              color: "#111",
            }}
          >
            New Transaction
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Description</label>
              <input
                className="input"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Groceries, Rent, Salary…"
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            {/* Amount */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Amount (€)</label>
              <input
                className="input"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            {/* Date */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Date</label>
              <input
                className="input"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            {/* Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Type</label>
              <select
                className="select"
                value={form.type}
                name="type"
                onChange={handleChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            {/* Account */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Account</label>
              <select
                className="select"
                name="accountId"
                value={form.accountId}
                onChange={handleChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              >
                <option value="">Choose account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              className="btn"
              type="submit"
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #4f46e5, #635bff)",
                padding: "14px",
                border: "none",
                color: "white",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(99,90,255,0.3)",
                marginTop: 6,
              }}
            >
              {submitting ? "Saving…" : "Add transaction"}
            </button>
          </form>
        </div>

        {/* RIGHT CARD: Recent Transactions */}
        <div
          style={{
            background: "white",
            padding: "32px 28px",
            borderRadius: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            border: "1px solid #eef0f2",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Recent Transactions
          </h2>

          <div>
            {transactions.length === 0 ? (
              <p style={{ color: "#9ca3af", marginTop: 8 }}>
                No transactions yet.
              </p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 10px",
                }}
              >
                <thead>
                  <tr style={{ color: "#6b7280", textAlign: "left" }}>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      style={{
                        background: "#fafafa",
                        borderRadius: 12,
                      }}
                    >
                      <td style={{ padding: "12px 8px" }}>{t.date}</td>
                      <td>{t.description}</td>
                      <td>{t.accountName ?? t.accountId}</td>

                      <td>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 600,
                            color: t.type === "INCOME" ? "#065f46" : "#7f1d1d",
                            background:
                              t.type === "INCOME" ? "#d1fae5" : "#fee2e2",
                          }}
                        >
                          {t.type}
                        </span>
                      </td>

                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {t.type === "EXPENSE" ? "-" : "+"}€{t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
