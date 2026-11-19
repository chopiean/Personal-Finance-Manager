import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../api/api";
import AuthBackground from "./AuthBackground";
import { IconLogo } from "../../components/Icons";
import { useToast } from "../../components/feedback/useFeedback";
import { validatePassword } from "../../utils/validation";
import {
  backStyle,
  inputStyle,
  primaryButtonStyle,
  textStyle,
  titleStyle,
} from "./authStyles";

const errorStyle = {
  color: "#dc2626",
  fontSize: 13,
  textAlign: "left" as const,
  margin: "-8px 0 12px",
};

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem =
      validatePassword(password) ??
      (password !== confirm ? "Passwords do not match." : null);
    setError(problem);
    if (problem) return;

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      toast("Password updated! Please log in with your new password.", "success");
      nav("/login");
    } catch (err) {
      let message = err instanceof Error ? err.message : "Something went wrong.";
      // Validation errors come back as a JSON map of field -> message
      try {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed === "object") message = Object.values(parsed).join(" ");
      } catch {
        /* plain-text error */
      }
      setError(message);
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

      <div
        className="auth-card"
        style={{ width: "100%", maxWidth: 460, padding: "44px 36px", textAlign: "center" }}
      >
        <div className="auth-logo" aria-hidden="true">
          <IconLogo size={28} />
        </div>

        {!token ? (
          <>
            <h2 style={titleStyle}>Link not valid</h2>
            <p style={{ ...textStyle, marginBottom: 28 }}>
              This reset link is incomplete. Please request a new one.
            </p>
            <button
              type="button"
              className="btn-shine auth-btn"
              onClick={() => nav("/forgot-password")}
              style={primaryButtonStyle}
            >
              Request a new link
            </button>
          </>
        ) : (
          <>
            <h2 style={titleStyle}>Choose a new password</h2>
            <p style={{ ...textStyle, marginBottom: 28 }}>
              At least 8 characters, including a number and a special character.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <input
                className="auth-input"
                type="password"
                placeholder="New password"
                aria-label="New password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
                autoFocus
                style={inputStyle}
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm new password"
                aria-label="Confirm new password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={!!error}
                style={inputStyle}
              />
              {error && (
                <p role="alert" style={errorStyle}>
                  {error}
                </p>
              )}
              {error?.includes("expired") && (
                <button
                  type="button"
                  onClick={() => nav("/forgot-password")}
                  className="auth-link"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6366f1",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    marginBottom: 14,
                  }}
                >
                  Request a new link
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-shine auth-btn"
                style={primaryButtonStyle}
              >
                {loading ? "Saving…" : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>

      <button type="button" onClick={() => nav("/login")} style={backStyle}>
        ← Back to Login
      </button>
    </div>
  );
}
