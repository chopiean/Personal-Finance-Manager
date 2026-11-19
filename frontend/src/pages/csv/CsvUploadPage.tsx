import { useState, useEffect } from "react";
import { apiFetch } from "../../api/api";
import { IconUpload } from "../../components/Icons";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

type Account = {
  id: number;
  name: string;
};

/* ----------------------------------------------------
   Secondary button
---------------------------------------------------- */
function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className="csv-secondary-btn"
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
  const [dragging, setDragging] = useState(false);

  const pickFile = (f: File | null) => {
    if (f && !f.name.toLowerCase().endsWith(".csv")) {
      setMessage("Please choose a .csv file.");
      return;
    }
    setFile(f);
    setMessage("");
  };

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
      const res = await fetch(`${API_BASE}/csv/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(await res.text());
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
        `${API_BASE}/csv/import?accountId=${selectedAccount}`,
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
    <section
      className="pfm-page"
      style={{ padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}
    >
      {/* Same heading style as the other pages */}
      <h1
        className="pfm-title"
        style={{
          fontSize: 34,
          fontWeight: 700,
          marginBottom: 5,
          letterSpacing: "-0.5px",
        }}
      >
        Import / Export
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 16 }}>
        Export your transactions or import them from a CSV file.
      </p>

      {/* Export */}
      <div className="pfm-card csv-card">
        <div className="csv-card-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
          <IconDownload />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="csv-card-title">Export</h2>
          <p className="csv-card-text">Download every transaction as a CSV file.</p>
        </div>
        <SecondaryButton onClick={handleExport}>Export All Transactions</SecondaryButton>
      </div>

      {/* Import */}
      <div className="pfm-card csv-card" style={{ flexDirection: "column", alignItems: "stretch" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div className="csv-card-icon" style={{ background: "rgba(22,163,74,0.12)", color: "#16a34a" }}>
            <IconUpload />
          </div>
          <div>
            <h2 className="csv-card-title">Import</h2>
            <p className="csv-card-text">Add transactions from a CSV file into one account.</p>
          </div>
        </div>

        <label htmlFor="csv-account" className="field-label" style={{ display: "block", marginTop: 8 }}>
          Select Account:
        </label>
        <select
          id="csv-account"
          className="select"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid var(--border-strong)",
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

        {/* Drop zone (the real file input sits inside, visually hidden) */}
        <label
          className={`dropzone${dragging ? " dragging" : ""}${file ? " has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) pickFile(dropped);
          }}
        >
          <input
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
          <span className="dropzone-icon" aria-hidden="true">
            {file ? "📄" : "☁️"}
          </span>
          {file ? (
            <>
              <strong className="dropzone-title">{file.name}</strong>
              <span className="dropzone-hint">{(file.size / 1024).toFixed(1)} KB · click to change</span>
            </>
          ) : (
            <>
              <strong className="dropzone-title">Drag & drop your CSV here</strong>
              <span className="dropzone-hint">or click to browse</span>
            </>
          )}
        </label>

        <button
          type="button"
          className="btn-shine csv-upload-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? "Uploading…" : "Upload CSV"}
        </button>
        {loading && <div className="upload-progress" aria-hidden="true" />}

        {message && (
          <p
            key={message}
            role="status"
            className={message === "CSV uploaded successfully!" ? "csv-message ok" : "csv-message"}
          >
            <span aria-hidden="true">{message === "CSV uploaded successfully!" ? "✓" : "!"}</span>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

function IconDownload() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
