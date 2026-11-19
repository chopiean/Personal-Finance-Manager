// Shared inline styles for the password reset screens.

export const titleStyle = {
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 10,
  color: "var(--text)",
  letterSpacing: "-0.5px",
} as const;

export const textStyle = {
  color: "var(--text-muted)",
  fontSize: 14,
  lineHeight: 1.6,
} as const;

export const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid var(--border-strong)",
  marginBottom: 16,
  fontSize: 15,
} as const;

export const primaryButtonStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  boxShadow: "0 12px 26px rgba(22,163,74,0.3)",
} as const;

export const linkButtonStyle = {
  marginTop: 16,
  background: "transparent",
  border: "none",
  color: "#6366f1",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
} as const;

export const backStyle = {
  background: "transparent",
  marginTop: 20,
  border: "none",
  color: "var(--text-muted)",
  fontSize: 16,
  cursor: "pointer",
  fontWeight: 500,
} as const;
