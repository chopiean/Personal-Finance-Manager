import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem("user");
    nav("/login");
  }

  return (
    <div style={styles.wrapper}>
      {/* Animated Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Finance</h2>

        <nav style={styles.nav}>
          <Link style={styles.link} to="/">
            Dashboard
          </Link>
          <Link style={styles.link} to="/accounts">
            Accounts
          </Link>
          <Link style={styles.link} to="/transactions">
            Transactions
          </Link>
          <Link style={styles.link} to="/budgets">
            Budgets
          </Link>
        </nav>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Content */}
      <main style={styles.content}>{children}</main>
    </div>
  );
}

/* -----------------------------------------------------
   ⚡ Inline Styles + Keyframes for Animation
----------------------------------------------------- */
const fadeIn = {
  animation: "fadeIn 0.4s ease-out forwards",
};

const slideIn = {
  animation: "slideIn 0.6s ease-out forwards",
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    height: "100vh",
    fontFamily: "Inter, sans-serif",
    background:
      "linear-gradient(135deg, #dfe9f3 0%, #ffffff 60%, #f8f9fa 100%)",
  },

  /* Glassmorphism Sidebar */
  sidebar: {
    width: 260,
    padding: "30px 20px",
    background: "rgba(255, 255, 255, 0.14)",
    boxShadow: "0 4px 25px rgba(0,0,0,0.15)",
    backdropFilter: "blur(18px)",
    borderRight: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "0 20px 20px 0",
    display: "flex",
    flexDirection: "column",
    ...slideIn,
  },

  logo: {
    fontSize: "2rem",
    marginBottom: 40,
    fontWeight: 700,
    color: "#1e293b",
    letterSpacing: "-1px",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  link: {
    color: "#0f172a",
    textDecoration: "none",
    fontSize: "1.15rem",
    fontWeight: 500,
    padding: "10px 16px",
    borderRadius: 12,
    transition: "all 0.25s ease",
    backdropFilter: "blur(5px)",
    background: "rgba(255,255,255,0.1)",
  },

  logoutBtn: {
    marginTop: "auto",
    padding: "12px",
    background: "linear-gradient(135deg, #ff5757 0%, #ff1e1e 100%)",
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 600,
    boxShadow: "0 4px 10px rgba(255,0,0,0.3)",
    transition: "0.25s",
  },

  content: {
    flex: 1,
    padding: 40,
    overflowY: "auto",
    ...fadeIn,
  },
};

/* Inject keyframes into the page */
const styleTag = document.createElement("style");
styleTag.innerHTML = `
@keyframes slideIn {
  0% { transform: translateX(-80px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleTag);
