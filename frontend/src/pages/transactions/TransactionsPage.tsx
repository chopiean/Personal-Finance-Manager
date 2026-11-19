import { Fragment, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import type {
  AccountResponse,
  BudgetResponse,
  TransactionResponse,
} from "../../api/type";
import CategorySelect from "../../components/CategorySelect";
import DeleteButton from "../../components/DeleteButton";
import { categoriesFor } from "../../constants/categories";
import { formatDate } from "../../utils/formatDate";

type TransactionForm = {
  description: string;
  amount: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  accountId: string;
  category: string;
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
    category: "",
  }));
  const [budgetCategories, setBudgetCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  // Search + type filter, then group by calendar day (newest first)
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = transactions.filter(
      (t) =>
        (filter === "ALL" || t.type === filter) &&
        (!q ||
          t.description.toLowerCase().includes(q) ||
          (t.category ?? "").toLowerCase().includes(q) ||
          String(t.accountName ?? "").toLowerCase().includes(q))
    );
    const byDay = new Map<string, TransactionResponse[]>();
    [...visible]
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((t) => {
        const day = t.date.slice(0, 10);
        byDay.set(day, [...(byDay.get(day) ?? []), t]);
      });
    return [...byDay.entries()];
  }, [transactions, query, filter]);

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

    const loadBudgetCategories = async () => {
      try {
        const now = new Date();
        const budgets = await apiFetch<BudgetResponse[]>(
          `/budgets?year=${now.getFullYear()}&month=${now.getMonth() + 1}`
        );
        setBudgetCategories((budgets ?? []).map((b) => b.category));
      } catch {
        // standard categories are still available
      }
    };
    void loadBudgetCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) =>
      // Income and expense have different categories, so reset on type change.
      name === "type" && value !== prev.type
        ? { ...prev, type: value as TransactionForm["type"], category: "" }
        : { ...prev, [name]: value }
    );
  };

  const deleteTransaction = async (t: TransactionResponse) => {
    await apiFetch(`/transactions/${t.id}`, { method: "DELETE" });
    setTransactions((prev) => prev.filter((x) => x.id !== t.id));
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
        ...(form.category.trim() ? { category: form.category.trim() } : {}),
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
    <div
      className="pfm-page"
      style={{
        padding: "40px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Page Title */}
      <h1
        className="pfm-title"
        style={{
          fontSize: 34,
          fontWeight: 700,
          marginBottom: 5,
          letterSpacing: "-0.5px",
        }}
      >
        Transactions
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 34, fontSize: 16 }}>
        Quickly log your income and expenses.
      </p>

      {/* Two Column Layout */}
      <div
        className="responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 2fr",
          gap: 28,
        }}
      >
        {/* LEFT CARD: New Transaction */}
        <div
          className="pfm-card"
          style={{
            background: "var(--surface)",
            padding: "32px 28px",
            borderRadius: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              marginBottom: 16,
              fontWeight: 600,
              color: "var(--text)",
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
                  border: "1px solid var(--border-strong)",
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
                  border: "1px solid var(--border-strong)",
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
                  border: "1px solid var(--border-strong)",
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
                  border: "1px solid var(--border-strong)",
                  fontSize: 15,
                }}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
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
                  border: "1px solid var(--border-strong)",
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

            {/* Category */}
            <CategorySelect
              id="tx-category"
              value={form.category}
              onChange={(category) =>
                setForm((prev) => ({ ...prev, category }))
              }
              options={categoriesFor(form.type)}
              budgetCategories={form.type === "EXPENSE" ? budgetCategories : []}
              emptyLabel="No category"
            />

            {/* Submit Button */}
            <button
              className="btn btn-shine"
              type="submit"
              disabled={submitting}
              style={{
                background: "var(--accent-gradient)",
                padding: "14px",
                border: "none",
                color: "var(--on-accent)",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 6px 16px var(--accent-shadow)",
                marginTop: 6,
              }}
            >
              {submitting ? "Saving…" : "Add transaction"}
            </button>
          </form>
        </div>

        {/* RIGHT CARD: Recent Transactions */}
        <div
          className="pfm-card"
          style={{
            background: "var(--surface)",
            padding: "32px 14px",
            borderRadius: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            border: "1px solid var(--border)",
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

          {transactions.length > 0 && (
            <div className="tx-toolbar">
              <input
                type="search"
                className="input"
                aria-label="Search transactions"
                placeholder="Search transactions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="chip-group" role="group" aria-label="Filter by type">
                {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    className={filter === f ? "filter-chip active" : "filter-chip"}
                    onClick={() => setFilter(f)}
                  >
                    {f === "ALL" ? "All" : f === "INCOME" ? "Income" : "Expenses"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="table-scroll">
            {transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div aria-hidden="true" style={{ fontSize: 34, animation: "float 4s ease-in-out infinite" }}>
                  💸
                </div>
                <p style={{ color: "var(--text-faint)", marginTop: 8 }}>
                  No transactions yet.
                </p>
              </div>
            ) : groups.length === 0 ? (
              <p style={{ color: "var(--text-faint)", marginTop: 8, textAlign: "center" }}>
                No matching transactions.
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
                  <tr style={{ color: "var(--text-muted)", textAlign: "left" }}>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>

                <tbody>
                  {groups.map(([day, items]) => (
                    <Fragment key={day}>
                    <tr className="group-row">
                      <td colSpan={6}>
                        <span>{dayLabel(day)}</span>
                        <span className="group-total">
                          {formatNet(items)}
                        </span>
                      </td>
                    </tr>
                  {items.map((t) => (
                    <tr
                      key={t.id}
                      style={{
                        background: "var(--surface-2)",
                        borderRadius: 12,
                      }}
                    >
                      <td style={{ padding: "12px 2px" }}>{formatDate(t.date)}</td>
                      <td>{t.description}</td>
                      <td>{t.accountName ?? t.accountId}</td>

                      <td>
                        <span
                          style={{
                            padding: "4px 6px",
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

                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          color: t.type === "EXPENSE" ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {t.type === "EXPENSE" ? "-" : "+"}€{t.amount.toFixed(2)}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          paddingLeft: 12,
                          paddingRight: 8,
                        }}
                      >
                        <DeleteButton
                          label={`Delete ${t.description}`}
                          confirmMessage={`Delete "${
                            t.description
                          }" (€${t.amount.toFixed(2)})? This cannot be undone.`}
                          onDelete={() => deleteTransaction(t)}
                        />
                      </td>
                    </tr>
                  ))}
                    </Fragment>
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

function dayLabel(day: string) {
  const d = new Date(`${day}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function formatNet(items: TransactionResponse[]) {
  const net = items.reduce(
    (sum, t) => sum + (t.type === "EXPENSE" ? -t.amount : t.amount),
    0
  );
  return `Net ${net < 0 ? "−" : "+"}€${Math.abs(net).toFixed(2)}`;
}
