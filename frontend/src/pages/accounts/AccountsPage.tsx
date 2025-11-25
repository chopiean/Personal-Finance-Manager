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
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Accounts</h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Manage the wallets and bank accounts used in your budget.
      </p>

      {/* NEW ACCOUNT FORM */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 14,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: 40,
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Add New Account</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <div className="field-label">Name</div>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Nordea Bank, Cash Wallet"
            />
          </div>

          <div>
            <div className="field-label">Currency</div>
            <select
              className="select"
              name="currency"
              value={form.currency}
              onChange={handleChange}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="VND">VND (₫)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <div className="field-label">Initial Balance</div>
            <input
              className="input"
              name="initialBalance"
              type="number"
              step="0.01"
              value={form.initialBalance}
              onChange={handleChange}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
            style={{ marginTop: 20 }}
          >
            {submitting ? "Saving…" : "Create Account"}
          </button>
        </form>
      </div>

      {/* ACCOUNTS LIST */}
      {accounts.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>
          You have no accounts yet. Add one above.
        </p>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Currency</th>
                <th>Initial Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.currency}</td>
                  <td>€{a.initialBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
