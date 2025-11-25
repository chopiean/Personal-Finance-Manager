import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import type { AccountResponse } from "../../api/type";

type AccountWithBalance = AccountResponse & {
  balance?: number;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<AccountWithBalance[]>("/accounts");
        setAccounts(data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="card">
      <h1 className="page-title">Accounts</h1>
      <p className="page-subtitle">
        Manage the wallets and bank accounts used in your budget.
      </p>

      {loading ? (
        <p className="muted">Loading accounts…</p>
      ) : accounts.length === 0 ? (
        <p className="muted">
          You don't have any accounts yet. Create one in the backend or via the
          API.
        </p>
      ) : (
        <div className="list-grid">
          {accounts.map((a) => (
            <div key={a.id} className="account-card">
              <div className="account-name">{a.name}</div>
              <div className="account-meta">
                {a.type ?? "Account"} • {a.currency ?? "EUR"}
              </div>

              {/* SAFE — no any needed */}
              {typeof a.balance === "number" && (
                <div className="account-balance">€ {a.balance.toFixed(2)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
