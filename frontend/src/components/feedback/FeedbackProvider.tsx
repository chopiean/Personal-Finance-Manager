import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./feedback.css";
import { FeedbackContext, type ConfirmOptions, type ToastKind } from "./useFeedback";

type Toast = { id: number; kind: ToastKind; message: string; leaving?: boolean };

const ICONS: Record<ToastKind, string> = { success: "✓", error: "!", info: "i" };

export default function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 250);
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = nextId.current++;
      setToasts((ts) => [...ts.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), kind === "error" ? 6000 : 3500);
    },
    [dismiss]
  );

  const confirm = useCallback((opts: ConfirmOptions | string) => {
    setDialog(typeof opts === "string" ? { message: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setDialog(null);
  }, []);

  const api = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={api}>
      {children}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`toast toast-${t.kind}${t.leaving ? " leaving" : ""}`}
          >
            <span className="toast-icon" aria-hidden="true">
              {ICONS[t.kind]}
            </span>
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {dialog && <ConfirmDialog opts={dialog} onClose={close} />}
    </FeedbackContext.Provider>
  );
}

function ConfirmDialog({
  opts,
  onClose,
}: {
  opts: ConfirmOptions;
  onClose: (ok: boolean) => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onClick={() => onClose(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`dialog-icon${opts.danger ? " danger" : ""}`} aria-hidden="true">
          {opts.danger ? "!" : "?"}
        </div>
        <h2 id="confirm-title">{opts.title ?? "Are you sure?"}</h2>
        <p id="confirm-message">{opts.message}</p>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn ghost" onClick={() => onClose(false)}>
            {opts.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={`dialog-btn ${opts.danger ? "danger" : "primary"}`}
            onClick={() => onClose(true)}
          >
            {opts.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
