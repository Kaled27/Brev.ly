import { useCallback, useState } from "react";

export type ToastKind = "success" | "error";

export type ToastRecord = {
  id: string;
  type: ToastKind;
  message: string;
  duration: number;
};

const DURACAO_SUCESSO_MS = 4200;
const DURACAO_ERRO_MS = 5500;

export function useToast() {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, duration = DURACAO_SUCESSO_MS) => {
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "success",
          message,
          duration,
        },
      ]);
    },
    [],
  );

  const showError = useCallback(
    (message: string, duration = DURACAO_ERRO_MS) => {
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "error",
          message,
          duration,
        },
      ]);
    },
    [],
  );

  return { toasts, dismiss, showSuccess, showError };
}
