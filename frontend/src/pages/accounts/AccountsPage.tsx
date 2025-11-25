import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";

export type Account = {
  id: number;
  name: string;
  currency: string;
  initialBalance: number;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    apiFetch<Account[]>("/accounts").then((data) => setAccounts(data));
  }, []);

  return (
    <section className="card apple-card">
      <h1 className="page-title">Accounts</h1>
      <p className="page-subtitle">Your linked finance accounts</p>

      <div className="table-wrapper">
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
    </section>
  );
}
