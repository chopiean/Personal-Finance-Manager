// src/pages/budgets/CreateBudgetPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

import type { AccountResponse } from "../../api/type";

// 🔥 Predefined categories used across the app & CSV import
const CATEGORY_OPTIONS = [
  "Shopping",
  "Groceries",
  "Transport",
  "Bills",
  "Restaurants",
  "Entertainment",
  "Health",
  "Travel",
  "Subscriptions",
  "Gifts",
  "Education",
  "Salary",
  "Side Income",
  "Savings",
  "Uncategorized",
];

export default function CreateBudgetPage() {
  const nav = useNavigate();
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);

  const [form, setForm] = useState({
    category: "",
    limitAmount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    accountId: "",
  });

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      category: form.category,
      limitAmount: Number(form.limitAmount),
      month: Number(form.month),
      year: Number(form.year),
      accountId: Number(form.accountId),
    };

    await apiFetch("/budgets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    alert("Budget created!");
    nav("/budgets");
  }

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: 34,
          fontWeight: 700,
          marginBottom: 6,
          letterSpacing: "-0.5px",
        }}
      >
        Create Budget
      </h1>

      <p style={{ color: "#6b7280", marginBottom: 28, fontSize: 16 }}>
        Set a monthly spending limit for a category.
      </p>

      {/* Main Card */}
      <div
        style={{
          background: "white",
          padding: "32px 28px",
          borderRadius: 20,
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
          border: "1px solid #eef0f2",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Category Dropdown + Custom Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="field-label">Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 15,
              }}
            >
              <option value="">Select category…</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Optional custom text */}
            <input
              className="input"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Or enter custom category…"
              style={{
                marginTop: 6,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 15,
              }}
            />
          </div>

          {/* Limit */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="field-label">Limit (€)</label>
            <input
              className="input"
              type="number"
              name="limitAmount"
              value={form.limitAmount}
              onChange={handleChange}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 15,
              }}
            />
          </div>

          {/* Month */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="field-label">Month</label>
            <input
              className="input"
              type="number"
              name="month"
              min="1"
              max="12"
              value={form.month}
              onChange={handleChange}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 15,
              }}
            />
          </div>

          {/* Year */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="field-label">Year</label>
            <input
              className="input"
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 15,
              }}
            />
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
              <option value="">Select account…</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
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
              boxShadow: "0 6px 16px rgba(99,90,255,0.35)",
            }}
          >
            Create Budget
          </button>
        </form>
      </div>
    </div>
  );
}
