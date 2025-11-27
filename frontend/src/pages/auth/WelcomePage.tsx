import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const nav = useNavigate();

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
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          padding: "60px 40px",
          background: "white",
          boxShadow: "0 20px 45px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 34,
            fontWeight: 700,
            marginBottom: 12,
            color: "#111827",
            letterSpacing: "-0.5px",
          }}
        >
          Personal Finance Manager
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "#6b7280",
            marginBottom: 36,
            lineHeight: "22px",
          }}
        >
          Your personal finance manager — track budgets, accounts, and
          transactions effortlessly.
        </p>

        {/* Login Button */}
        <button
          onClick={() => nav("/login")}
          style={{
            width: "100%",
            padding: "14px",
            background: "white",
            border: "1px solid #d1d5db",
            color: "#374151",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 18,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3eba56";
            e.currentTarget.style.borderColor = "#cfd2d6";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.color = "#374151";
          }}
        >
          Login
        </button>

        {/* Register Button */}
        <button
          onClick={() => nav("/register")}
          style={{
            width: "100%",
            padding: "14px",
            background: "white",
            border: "1px solid #d1d5db",
            color: "#374151",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3eba56";
            e.currentTarget.style.borderColor = "#cfd2d6";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.color = "#374151";
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}
