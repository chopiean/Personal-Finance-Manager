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
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 4,
          letterSpacing: "-0.5px",
        }}
      >
        Accounts
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 34, fontSize: 17 }}>
        Manage the wallets and bank accounts used in your budget.
      </p>

      {/* 2-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
        }}
      >
        {/* LEFT CARD */}
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
              marginBottom: 18,
              fontWeight: 600,
              color: "#111",
            }}
          >
            Add New Account
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Name</label>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Nordea Bank, Cash"
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            {/* Currency */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Currency</label>
              <select
                className="select"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                style={{
                  padding: "12px 10px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Initial Balance */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="field-label">Initial Balance</label>
              <input
                className="input"
                name="initialBalance"
                type="number"
                value={form.initialBalance}
                onChange={handleChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 10,
                background: "linear-gradient(135deg, #4f46e5, #635bff)",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(99,90,255,0.3)",
                transition: "0.2s",
              }}
            >
              {submitting ? "Saving…" : "Create Account"}
            </button>
          </form>
        </div>

        {/* RIGHT CARD */}
        <div
          style={{
            background: "white",
            padding: "32px 28px",
            borderRadius: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            border: "1px solid #eef0f2",
            minHeight: 260,
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 14, fontWeight: 600 }}>
            Your Accounts
          </h2>

          {accounts.length === 0 ? (
            <p style={{ color: "#9ca3af", marginTop: 6 }}>
              You have no accounts yet. Add one on the left.
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
                  <th>Name</th>
                  <th>Currency</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((a) => (
                  <tr
                    key={a.id}
                    style={{
                      background: "#fafafa",
                      borderRadius: 12,
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 0",
                        paddingLeft: 10,
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                      }}
                    >
                      {a.name}
                    </td>
                    <td>{a.currency}</td>
                    <td
                      style={{
                        paddingRight: 10,
                        fontWeight: 600,
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                      }}
                    >
                      €{a.initialBalance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
