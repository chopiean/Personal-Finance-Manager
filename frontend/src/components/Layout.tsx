import { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { apiFetch } from "../api/api";
import ChatWidget from "./ChatWidget";
import ThemeToggle from "./ThemeToggle";
import { useConfirm, useToast } from "./feedback/useFeedback";
import {
  IconChart,
  IconDashboard,
  IconLogo,
  IconLogout,
  IconSwap,
  IconTarget,
  IconUpload,
  IconWallet,
} from "./Icons";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: IconDashboard },
  { label: "Accounts", path: "/accounts", icon: IconWallet },
  { label: "Transactions", path: "/transactions", icon: IconSwap },
  { label: "Budgets", path: "/budgets", icon: IconTarget },
  { label: "Reports", path: "/reports", icon: IconChart },
  { label: "Import / Export", path: "/csv-upload", icon: IconUpload },
];

// Short labels for the phone tab bar (the rest stay in the drawer menu)
const TAB_ITEMS = [
  { ...NAV_ITEMS[0], short: "Home" },
  { ...NAV_ITEMS[1], short: "Accounts" },
  { ...NAV_ITEMS[2], short: "Activity" },
  { ...NAV_ITEMS[3], short: "Budgets" },
  { ...NAV_ITEMS[4], short: "Reports" },
];

export default function Layout() {
  const nav = useNavigate();
  const location = useLocation();
  const [deleting, setDeleting] = useState(false);
  // Only used on narrow screens, where the sidebar is a slide-in drawer.
  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem("username");
  const confirm = useConfirm();
  const toast = useToast();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    nav("/");
  }

  async function deleteAccount() {
    const confirmed = await confirm({
      title: "Delete your account?",
      message:
        "Are you sure to delete your account permanently? All accounts, transactions and budgets will be removed.",
      confirmLabel: "Delete forever",
      danger: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiFetch("/auth/me", { method: "DELETE" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      nav("/");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete account.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="app-layout"
      style={{
        background: "var(--bg)",
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
            color: "var(--text)",
          }}
        >
          ☰
        </button>
        <Link to="/dashboard" className="brand-link" title="Go to dashboard">
          <span className="brand-mark" aria-hidden="true" style={{ width: 32, height: 32 }}>
            <IconLogo size={18} />
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
            Finance
          </span>
        </Link>
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
          background: "var(--glass)",
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
              marginBottom: 32,
            }}
          >
            <Link
              to="/dashboard"
              className="brand-link"
              title="Go to dashboard"
              onClick={() => setMenuOpen(false)}
            >
              <span className="brand-mark" aria-hidden="true">
                <IconLogo size={22} />
              </span>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  margin: 0,
                  color: "var(--text)",
                  letterSpacing: "-0.5px",
                }}
              >
                Finance
              </h1>
            </Link>
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
                color: "var(--text-muted)",
              }}
            >
              ×
            </button>
          </div>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={active ? "nav-item active" : "nav-item"}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ThemeToggle />
          {username && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                marginBottom: 6,
                borderRadius: 16,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  color: "white",
                  background: "linear-gradient(135deg,#6366f1,#22c55e)",
                }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Signed in as</div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {username}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="btn-shine"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "none",
              background:
                "linear-gradient(135deg,rgba(248,113,113,1),rgba(239,68,68,1))",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(248,113,113,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <IconLogout size={18} />
            Logout
          </button>

          <button
            onClick={deleteAccount}
            disabled={deleting}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(220,38,38,0.3)",
              background: "transparent",
              color: "#b91c1c",
              fontSize: 14,
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
          background: "var(--bg-main)",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
          }}
        >
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </div>
      </main>
      {/* MOBILE BOTTOM TABS (hidden on wide screens via CSS) */}
      <nav className="bottom-tabs" aria-label="Quick navigation">
        {TAB_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              data-label={item.short}
              className={active ? "bottom-tab active" : "bottom-tab"}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </nav>
      <ChatWidget />
    </div>
  );
}
