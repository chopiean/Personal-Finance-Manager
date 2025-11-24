import { NavLink } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/accounts", label: "Accounts" },
  { to: "/transactions", label: "Transactions" },
  { to: "/budgets", label: "Budgets" },
];

export default function Navbar() {
  return (
    <header className="nav-shell">
      <div className="nav-inner">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          <span>Finance Manager</span>
        </div>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link-active" : "")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
