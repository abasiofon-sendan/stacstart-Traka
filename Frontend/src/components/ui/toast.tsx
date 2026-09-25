import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { X, CheckCircle, Warning, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: "default" | "destructive" | "success";
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[9999] flex w-full max-w-[400px] -translate-x-1/2 flex-col gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    default: <Info weight="fill" className="h-4 w-4 shrink-0 text-primary" />,
    destructive: <Warning weight="fill" className="h-4 w-4 shrink-0 text-destructive" />,
    success: <CheckCircle weight="fill" className="h-4 w-4 shrink-0 text-success" />,
  };

  const borders = {
    default: "border-primary/20",
    destructive: "border-destructive/20",
    success: "border-success/30",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-sm border border-border bg-card p-3.5 shadow-card animate-in slide-in-from-bottom-4 fade-in duration-300",
        borders[t.variant],
      )}
    >
      {icons[t.variant]}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <X weight="bold" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
