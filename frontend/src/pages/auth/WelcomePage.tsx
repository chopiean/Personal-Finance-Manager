import { useNavigate } from "react-router-dom";
import AuthBackground from "./AuthBackground";
import { IconChart, IconLogo, IconTarget, IconWallet } from "../../components/Icons";

const FEATURES = [
  { icon: IconWallet, label: "Accounts" },
  { icon: IconTarget, label: "Budgets" },
  { icon: IconChart, label: "Insights" },
];

export default function WelcomePage() {
  const nav = useNavigate();

  return (
    <div
      className="auth-screen"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <AuthBackground />

      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "52px 40px 44px",
          textAlign: "center",
        }}
      >
        <div className="auth-logo" aria-hidden="true">
          <IconLogo size={28} />
        </div>

        <h1
          className="pfm-title"
          style={{
            fontSize: 34,
            fontWeight: 800,
            marginBottom: 12,
            letterSpacing: "-0.8px",
            lineHeight: 1.15,
          }}
        >
          Personal Finance Manager
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "var(--text-muted)",
            marginBottom: 28,
            lineHeight: "23px",
          }}
        >
          Your personal finance manager — track budgets, accounts, and
          transactions effortlessly.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          {FEATURES.map(({ icon: Icon, label }, i) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent-strong)",
                background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                animation: `pop-in 0.5s var(--ease-spring) ${0.35 + i * 0.1}s backwards`,
              }}
            >
              <Icon size={15} />
              {label}
            </span>
          ))}
        </div>

        <button
          onClick={() => nav("/login")}
          className="btn-shine auth-btn"
          style={{
            width: "100%",
            padding: "15px",
            background: "var(--primary-gradient)",
            border: "none",
            color: "var(--on-primary)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 12,
            boxShadow: "0 12px 26px var(--primary-shadow)",
          }}
        >
          Login
        </button>

        <button
          onClick={() => nav("/register")}
          className="auth-btn"
          style={{
            width: "100%",
            padding: "15px",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            color: "var(--text)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}
