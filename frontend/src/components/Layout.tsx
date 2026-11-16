import { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { apiFetch } from "../api/api";
import ChatWidget from "./ChatWidget";

const NAV_ITEMS = [
  { label: "Dashboard", path: "dashboard" },
  { label: "Accounts", path: "/accounts" },
  { label: "Transactions", path: "/transactions" },
  { label: "Budgets", path: "/budgets" },
  { label: "Reports", path: "/reports" },
  { label: "Import / Export", path: "/csv-upload" },
];

export default function Layout() {
  const nav = useNavigate();
  const location = useLocation();
  const [deleting, setDeleting] = useState(false);
  // Only used on narrow screens, where the sidebar is a slide-in drawer.
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      "Are you sure to delete your account permanently?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiFetch("/auth/me", { method: "DELETE" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      nav("/");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="app-layout"
      style={{
        background: "linear-gradient(120deg,#f5f7fb,#eef2ff)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      }}
    >
      {/* MOBILE TOP BAR (hidden on wide screens via CSS) */}
      <header className="mobile-topbar">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          onClick={() => setMenuOpen(true)}
          style={{
            background: "transparent",
            border: "1px solid rgba(148,163,184,0.4)",
            borderRadius: 10,
            padding: "6px 10px",
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
            color: "#0f172a",
          }}
        >
          ☰
        </button>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
          Finance
        </span>
      </header>

      {/* BACKDROP (mobile only, while the menu is open) */}
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="app-sidebar"
        className={menuOpen ? "sidebar open" : "sidebar"}
        style={{
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                margin: 0,
                color: "#0f172a",
                letterSpacing: 0.2,
              }}
            >
              Finance
            </h1>
            <button
              type="button"
              className="sidebar-close"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 26,
                lineHeight: 1,
                cursor: "pointer",
                color: "#475569",
              }}
            >
              ×
            </button>
          </div>

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
                  onClick={() => setMenuOpen(false)}
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

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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

          <button
            onClick={deleteAccount}
            disabled={deleting}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 999,
              border: "1px solid rgba(220,38,38,0.4)",
              background: "transparent",
              color: "#b91c1c",
              fontSize: 18,
              fontWeight: 600,
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </aside>
      {/* MAIN CONTENT */}
      <main
        className="app-main"
        style={{
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
      <ChatWidget />
    </div>
  );
}
