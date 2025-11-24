import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 10, background: "#222", color: "white" }}>
      <Link to="/" style={{ marginRight: 15 }}>
        Dashboard
      </Link>
      <Link to="/accounts" style={{ marginRight: 15 }}>
        Accounts
      </Link>
      <Link to="/transactions" style={{ marginRight: 15 }}>
        Transactions
      </Link>
      <Link to="/budgets" style={{ marginRight: 15 }}>
        Budgets
      </Link>
    </nav>
  );
}
