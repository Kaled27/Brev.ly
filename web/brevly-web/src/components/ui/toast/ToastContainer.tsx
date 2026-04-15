import type { ToastRecord } from "../../../hooks/useToast";
import { ToastItem } from "./ToastItem";

type ToastContainerProps = {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-100 flex max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),22rem)] max-w-[calc(100vw-2rem)] flex-col gap-3 overflow-x-hidden overflow-y-auto"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
