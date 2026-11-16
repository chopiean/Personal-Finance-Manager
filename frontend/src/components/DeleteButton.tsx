// src/components/DeleteButton.tsx
import { useState } from "react";

type Props = {
  /** Accessible name, e.g. "Delete Netflix". */
  label: string;
  /** Question shown in the confirm dialog. */
  confirmMessage: string;
  /** Performs the delete; throw to report failure. */
  onDelete: () => Promise<void>;
};

export default function DeleteButton({ label, confirmMessage, onDelete }: Props) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy || !window.confirm(confirmMessage)) return;
    setBusy(true);
    try {
      await onDelete();
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : "";
      window.alert(`Could not delete. ${msg}`.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleClick}
      disabled={busy}
      style={{
        background: "transparent",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        borderRadius: 8,
        padding: "4px 10px",
        fontSize: 13,
        fontWeight: 600,
        cursor: busy ? "default" : "pointer",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
