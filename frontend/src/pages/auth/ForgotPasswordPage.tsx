import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/api";
import AuthBackground from "./AuthBackground";
import { IconLogo } from "../../components/Icons";
import { useToast } from "../../components/feedback/useFeedback";
import {
  backStyle,
  inputStyle,
  linkButtonStyle,
  primaryButtonStyle,
  textStyle,
  titleStyle,
} from "./authStyles";

export default function ForgotPasswordPage() {
  const nav = useNavigate();
  const toast = useToast();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      setSent(true);
    } catch (err) {
      toast(
        "Could not send the reset link. " +
          (err instanceof Error ? err.message : "Please try again."),
        "error"
      );
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
        {sent ? (
          <div key="sent">
            <div className="success-check" aria-hidden="true">✓</div>
            <h2 style={titleStyle}>Check your email</h2>
            <p style={{ ...textStyle, marginBottom: 28 }}>
              If an account matches <strong>{identifier.trim()}</strong>, we've
              sent a link to reset the password. It's valid for 30 minutes, so
              check your spam folder too.
            </p>
            <button
              type="button"
              className="btn-shine auth-btn"
              onClick={() => nav("/login")}
              style={primaryButtonStyle}
            >
              Back to Login
            </button>
            <button
              type="button"
              className="auth-link"
              onClick={() => setSent(false)}
              style={linkButtonStyle}
            >
              Didn't get it? Try again
            </button>
          </div>
        ) : (
          <div key="form">
            <div className="auth-logo" aria-hidden="true">
              <IconLogo size={28} />
            </div>
            <h2 style={titleStyle}>Forgot your password?</h2>
            <p style={{ ...textStyle, marginBottom: 28 }}>
              Enter your email or username and we'll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                className="auth-input"
                placeholder="Email or username"
                aria-label="Email or username"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-shine auth-btn"
                style={primaryButtonStyle}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </div>
        )}
      </div>

      <button type="button" onClick={() => nav("/login")} style={backStyle}>
        ← Back to Login
      </button>
    </div>
  );
}
