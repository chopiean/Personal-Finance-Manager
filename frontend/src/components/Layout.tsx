import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", path: "dashboard" },
  { label: "Accounts", path: "/accounts" },
  { label: "Transactions", path: "/transactions" },
  { label: "Budgets", path: "/budgets" },
];

export default function Layout() {
  const nav = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.removeItem("user");
    nav("/");
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(120deg,#f5f7fb,#eef2ff)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: 320,
          minWidth: 320,
          padding: "32px 26px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(148,163,184,0.25)",
          boxShadow: "4px 0 18px rgba(15,23,42,0.06)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 24,
              color: "#0f172a",
              letterSpacing: 0.2,
            }}
          >
            Finance
          </h1>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#0f172a" : "#475569",
                    backgroundColor: active ? "#e5f2ff" : "transparent",
                    border: active
                      ? "1px solid rgba(59,130,246,0.25)"
                      : "1px solid transparent",
                    transition: "background-color 0.15s ease, transform 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLAnchorElement).style.backgroundColor =
                      active ? "#e5f2ff" : "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLAnchorElement).style.backgroundColor =
                      active ? "#e5f2ff" : "transparent")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg,rgba(248,113,113,1),rgba(239,68,68,1))",
            color: "white",
            fontSize: 20,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 18px rgba(248,113,113,0.35)",
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
          }}
          onMouseEnter={(e) => {
            const btn = e.target as HTMLButtonElement;
            btn.style.transform = "translateY(-1px)";
            btn.style.boxShadow = "0 10px 22px rgba(248,113,113,0.42)";
          }}
          onMouseLeave={(e) => {
            const btn = e.target as HTMLButtonElement;
            btn.style.transform = "translateY(0)";
            btn.style.boxShadow = "0 8px 18px rgba(248,113,113,0.35)";
          }}
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "28px 40px",
          overflowY: "auto",
          background: "linear-gradient(135deg,#f9fbff,#ffffff)",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
