"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, variant, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const showSuccess = useCallback((message: string) => push("success", message), [push]);
  const showError = useCallback((message: string) => push("error", message), [push]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:pr-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg backdrop-blur-sm ${
              toast.variant === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/95 dark:text-emerald-200"
                : "border-rose-200 bg-rose-50/95 text-rose-800 dark:border-rose-900 dark:bg-rose-950/95 dark:text-rose-200"
            }`}
          >
            {toast.variant === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <XCircle size={20} className="mt-0.5 shrink-0 text-rose-500 dark:text-rose-400" />
            )}
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Bildirimi kapat"
              className="-m-1 shrink-0 rounded-full p-1 text-current opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
