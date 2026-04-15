import { CheckCircle, X, XCircle } from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ToastRecord } from "../../../hooks/useToast";

type ToastItemProps = ToastRecord & {
  onDismiss: (id: string) => void;
};

export function ToastItem({
  id,
  type,
  message,
  duration,
  onDismiss,
}: ToastItemProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(id), duration);
    return () => window.clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const isSuccess = type === "success";

  return (
    <div
      role="status"
      className={`toast-slide-in pointer-events-auto relative flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm ${
        isSuccess
          ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-950"
          : "border-red-200/80 bg-red-50/95 text-red-950"
      }`}
    >
      <div className="flex gap-3 p-4 pr-10">
        <div
          className={`toast-icon-pop flex shrink-0 items-center justify-center rounded-full p-1 ${
            isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          }`}
        >
          {isSuccess ? (
            <CheckCircle size={26} weight="fill" />
          ) : (
            <XCircle size={26} weight="fill" />
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold leading-tight">
            {isSuccess ? "Tudo certo" : "Algo deu errado"}
          </p>
          <p className="mt-1 wrap-break-word text-xs leading-relaxed opacity-90">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className={`absolute right-2 top-2 rounded-lg p-1.5 transition-colors ${
            isSuccess
              ? "text-emerald-700/70 hover:bg-emerald-100/80 hover:text-emerald-900"
              : "text-red-700/70 hover:bg-red-100/80 hover:text-red-900"
          }`}
          aria-label="Fechar notificação"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
      <div
        className={`h-0.5 w-full ${
          isSuccess ? "bg-emerald-200/60" : "bg-red-200/60"
        }`}
      >
        <div
          className={`toast-progress-fill h-full rounded-full ${
            isSuccess ? "bg-emerald-500" : "bg-red-500"
          }`}
          style={{
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
}
