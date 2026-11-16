import { useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(email: string): string | null {
  return EMAIL_RE.test(email.trim()) ? null : "Please enter a valid email address.";
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(password)) return "Password must contain a number.";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain a special character.";
  return null;
}

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

      alert("Registration successfil");
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
      alert("Registration failed. " + message);
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
        background: "linear-gradient(145deg, #f9fafb, #eef1f4)",
        padding: 20,
      }}
    >
      {/* Register Card */}
      <div
        className="auth-card"
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
          Create an Account
        </h2>

        <p style={{ color: "#6b7280", marginBottom: 30, fontSize: 14 }}>
          Start managing your finances smarter.
        </p>

        <form onSubmit={handleRegister} noValidate>
          {/* Email Input */}
          <input
            placeholder="Choose username"
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
              transition: "0.2s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(34,197,94,0.7)")
            }
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
          <input
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
              border: `1px solid ${emailError ? "#dc2626" : "#d1d5db"}`,
              marginBottom: 14,
              fontSize: 15,
              outline: "none",
              transition: "0.2s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(34,197,94,0.7)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = emailError ? "#dc2626" : "#d1d5db")
            }
          />
          {emailError && (
            <p role="alert" style={errorTextStyle}>
              {emailError}
            </p>
          )}

          {/* Password Input */}
          <input
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
              border: `1px solid ${passwordError ? "#dc2626" : "#d1d5db"}`,
              marginBottom: 14,
              fontSize: 15,
              outline: "none",
              transition: "0.2s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(34,197,94,0.7)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = passwordError ? "#dc2626" : "#d1d5db")
            }
          />
          {passwordError ? (
            <p role="alert" style={errorTextStyle}>
              {passwordError}
            </p>
          ) : (
            <p
              style={{
                ...errorTextStyle,
                color: "#6b7280",
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
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = "0.9")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = "1")
            }
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
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Already have an account?{" "}
        <span
          onClick={() => nav("/login")}
          style={{
            color: "#0ea5e9",
            cursor: "pointer",
            fontWeight: 600,
            transition: "0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLSpanElement).style.opacity = "0.8")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLSpanElement).style.opacity = "1")
          }
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
