import { useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e?: FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      alert("Registration successfil");
      nav("/login");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown registration error";
      alert("Registration failed: " + message);
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
        padding: 20,
      }}
    >
      {/* Register Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "48px 36px",
          borderRadius: 20,
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

        <form onSubmit={handleRegister}>
          {/* Email Input */}
          <input
            placeholder="Email address"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
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

          {/* Password Input */}
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              marginBottom: 22,
              fontSize: 15,
              outline: "none",
              transition: "0.2s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(34,197,94,0.7)")
            }
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
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
    </div>
  );
}
