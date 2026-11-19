import { createContext, useContext } from "react";

export type ToastKind = "success" | "error" | "info";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type FeedbackApi = {
  toast: (message: string, kind?: ToastKind) => void;
  confirm: (opts: ConfirmOptions | string) => Promise<boolean>;
};

/**
 * Without a provider (e.g. a component rendered on its own in a test)
 * we fall back to the browser's built-in dialogs.
 */
const fallback: FeedbackApi = {
  toast: (message, kind = "info") => {
    if (kind === "error") window.alert(message);
  },
  confirm: (opts) =>
    Promise.resolve(window.confirm(typeof opts === "string" ? opts : opts.message)),
};

export const FeedbackContext = createContext<FeedbackApi>(fallback);

export function useToast() {
  return useContext(FeedbackContext).toast;
}

export function useConfirm() {
  return useContext(FeedbackContext).confirm;
}

