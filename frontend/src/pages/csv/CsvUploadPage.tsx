import { useState, useEffect } from "react";
import { apiFetch } from "../../api/api";

type Account = {
  id: number;
  name: string;
};

/* ----------------------------------------------------
   Shared Apple Glass Button Component
---------------------------------------------------- */
function AppleGlassButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    padding: "14px 24px",
    borderRadius: "14px",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "#0f172a",
    fontSize: 16,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    width: "100%",
    margin: "10px 0",
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={(e) =>
        !disabled &&
        ((e.target as HTMLButtonElement).style.background =
          "rgba(255, 255, 255, 0.45)")
      }
      onMouseLeave={(e) =>
        !disabled &&
        ((e.target as HTMLButtonElement).style.background =
          "rgba(255, 255, 255, 0.25)")
      }
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------
   Main CSV Page
---------------------------------------------------- */
export default function CsvUploadPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* Load accounts with authentication */
  useEffect(() => {
    apiFetch<Account[]>("/accounts")
      .then(setAccounts)
      .catch(() => setMessage("Failed to load accounts"));
  }, []);

  /* ----------------------------------------------------
     EXPORT ALL TRANSACTIONS
  ---------------------------------------------------- */
  const handleExport = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found – user not logged in?");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/csv/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Export failed:", text);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  /* ----------------------------------------------------
     UPLOAD CSV
  ---------------------------------------------------- */
  const handleUpload = async () => {
    if (!selectedAccount) return setMessage("Please select an account.");
    if (!file) return setMessage("Please choose a CSV file.");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8080/api/csv/import?accountId=${selectedAccount}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error(await res.text());
      setMessage("CSV uploaded successfully!");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Unexpected error during CSV upload.";
      setMessage("Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card apple-card" style={{ padding: 20 }}>
      <h1 className="page-title">Transactions Import / Export</h1>
      <p className="page-subtitle">
        Upload a CSV file containing your transactions.
      </p>

      {/* Export Button */}
      <AppleGlassButton onClick={handleExport}>
        ⬇️ Export All Transactions
      </AppleGlassButton>

      {/* Account Selector */}
      <label style={{ display: "block", marginTop: 20, marginBottom: 8 }}>
        Select Account:
      </label>

      <select
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          marginBottom: 20,
          fontSize: 15,
          width: "100%",
        }}
        value={selectedAccount ?? ""}
        onChange={(e) => setSelectedAccount(Number(e.target.value))}
      >
        <option value="" disabled>
          -- Choose an account --
        </option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </select>

      {/* File Input */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ margin: "20px 0", display: "block" }}
      />

      {/* Import Button */}
      <AppleGlassButton onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading…" : "Upload CSV"}
      </AppleGlassButton>

      {/* Message */}
      {message && (
        <p
          style={{
            marginTop: 20,
            color: message.startsWith("Error") ? "red" : "green",
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      )}
    </section>
  );
}
