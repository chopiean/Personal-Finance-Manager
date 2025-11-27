import { useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

type AuthResponse = {
  token: string;
};

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const { token } = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      nav("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown login error";
      alert("Login failed: " + message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(145deg, #f9fafb, #eef1f4)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          padding: "48px 36px",
          background: "white",
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          border: "1px solid #ececec",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 10,
            color: "#111827",
            letterSpacing: "-0.5px",
          }}
        >
          Personal Finance Manager
        </h2>

        <p style={{ color: "#6b7280", marginBottom: 30, fontSize: 14 }}>
          Track your budgets, accounts & spending.
        </p>

        <form onSubmit={handleLogin}>
          <input
            placeholder="Username or email address"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "1px solid #d1d5db",
              marginBottom: 14,
              fontSize: 15,
              outline: "none",
            }}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "1px solid #d1d5db",
              marginBottom: 22,
              fontSize: 15,
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 5px 15px rgba(22,163,74,0.25)",
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
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Don’t have an account?{" "}
        <span
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
          color: "black",
          fontSize: 18,
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}
