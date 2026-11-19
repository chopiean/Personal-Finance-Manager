import { useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";
import AuthBackground from "./AuthBackground";
import { useToast } from "../../components/feedback/useFeedback";
import { IconLogo } from "../../components/Icons";

type AuthResponse = {
  token: string;
  /** Registered username, returned even when logging in with an email. */
  username?: string;
};

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleLogin(e?: FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const { token, username: registeredName } = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: username, password }),
      });

      localStorage.setItem("token", token);
      localStorage.setItem("username", registeredName || username);

      nav("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown login error";
      toast("Login failed: " + message, "error");
    } finally {
      setLoading(false);
    }
  }

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
        padding: "20px",
      }}
    >
      <AuthBackground />
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 500,
          padding: "48px 36px",
          textAlign: "center",
        }}
      >
        <div className="auth-logo" aria-hidden="true">
          <IconLogo size={28} />
        </div>

        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 10,
            color: "var(--text)",
            letterSpacing: "-0.5px",
          }}
        >
          Personal Finance Manager
        </h2>

        <p style={{ color: "var(--text-muted)", marginBottom: 30, fontSize: 14 }}>
          Track your budgets, accounts & spending.
        </p>

        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            placeholder="Username or email address"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "1px solid var(--border-strong)",
              marginBottom: 14,
              fontSize: 15,
            }}
          />

          <input
            className="auth-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "1px solid var(--border-strong)",
              marginBottom: 22,
              fontSize: 15,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-shine auth-btn"
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 12px 26px rgba(22,163,74,0.3)",
            }}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>

      <p
        style={{
          marginTop: 24,
          fontSize: 15,
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        Don’t have an account?{" "}
        <span
          className="auth-link"
          onClick={() => nav("/register")}
          style={{
            color: "#0ea5e9",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Sign up
        </span>
      </p>
      <button
        onClick={() => nav("/")}
        style={{
          background: "transparent",
          marginTop: "20px",
          border: "none",
          color: "var(--text-muted)",
          fontSize: 16,
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}
