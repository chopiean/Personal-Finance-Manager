import { useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";
import AuthBackground from "./AuthBackground";
import { useToast } from "../../components/feedback/useFeedback";
import { IconLogo } from "../../components/Icons";
import { validateEmail, validatePassword } from "../../utils/validation";

const errorTextStyle = {
  color: "#dc2626",
  fontSize: 13,
  textAlign: "left" as const,
  margin: "-8px 0 12px",
};

export default function RegisterPage() {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleRegister(e?: FormEvent) {
    if (e) e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) return;

    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email: email.trim() }),
      });
      localStorage.removeItem("token");

      toast("Account created! Please log in.", "success");
      nav("/login");
    } catch (err) {
      let message =
        err instanceof Error ? err.message : "Unknown registration error";
      // Backend validation errors come back as a JSON map of field -> message
      try {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed === "object") {
          message = Object.values(parsed).join(" ");
        }
      } catch {
        /* plain-text error, keep as is */
      }
      toast("Registration failed. " + message, "error");
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
        padding: 20,
      }}
    >
      <AuthBackground />
      {/* Register Card */}
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
          Create an Account
        </h2>

        <p style={{ color: "var(--text-muted)", marginBottom: 30, fontSize: 14 }}>
          Start managing your finances smarter.
        </p>

        <form onSubmit={handleRegister} noValidate>
          {/* Username Input */}
          <input
            className="auth-input"
            placeholder="Choose username"
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
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(validateEmail(e.target.value));
            }}
            required
            aria-invalid={!!emailError}
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "1px solid var(--border-strong)",
              marginBottom: 14,
              fontSize: 15,
            }}
          />
          {emailError && (
            <p role="alert" style={errorTextStyle}>
              {emailError}
            </p>
          )}

          {/* Password Input */}
          <input
            className="auth-input"
            placeholder="Create password"
            type="password"
            value={password}
            onChange={(e) => {
              setPass(e.target.value);
              if (passwordError) setPasswordError(validatePassword(e.target.value));
            }}
            required
            aria-invalid={!!passwordError}
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "1px solid var(--border-strong)",
              marginBottom: 14,
              fontSize: 15,
            }}
          />
          {passwordError ? (
            <p role="alert" style={errorTextStyle}>
              {passwordError}
            </p>
          ) : (
            <p
              style={{
                ...errorTextStyle,
                color: "var(--text-muted)",
              }}
            >
              At least 8 characters, including a number and a special character.
            </p>
          )}
          <div style={{ height: 8 }} />

          {/* Register Button */}
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
            {loading ? "Registering…" : "Register"}
          </button>
        </form>
      </div>

      {/* Login Link */}
      <p
        style={{
          marginTop: 24,
          fontSize: 15,
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        Already have an account?{" "}
        <span
          className="auth-link"
          onClick={() => nav("/login")}
          style={{
            color: "#0ea5e9",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Login
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
