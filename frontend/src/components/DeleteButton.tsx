// src/components/DeleteButton.tsx
import { useRef, useState } from "react";
import { useConfirm, useToast } from "./feedback/useFeedback";

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
  const confirm = useConfirm();
  const toast = useToast();
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = async () => {
    if (busy) return;
    const ok = await confirm({
      title: label,
      message: confirmMessage,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    // Slide the surrounding row/card out before it is removed
    const row = ref.current?.closest<HTMLElement>("tr, .budget-tile, [data-row]");
    try {
      if (row && animationsEnabled()) {
        row.classList.add("row-exit");
        await new Promise((r) => setTimeout(r, 280));
      }
      await onDelete();
    } catch (err) {
      row?.classList.remove("row-exit");
      const msg = err instanceof Error && err.message ? err.message : "";
      toast(`Could not delete. ${msg}`.trim(), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      ref={ref}
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

function animationsEnabled() {
  return (
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
