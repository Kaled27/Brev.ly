import React, { useEffect, useState } from "react";
import { Warning, X, CircleNotch } from "@phosphor-icons/react";

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoBotaoConfirmar?: string;
  textoBotaoCancelar?: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  carregando?: boolean;
}

export const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  aberto,
  titulo,
  mensagem,
  textoBotaoConfirmar = "Confirmar",
  textoBotaoCancelar = "Cancelar",
  aoConfirmar,
  aoCancelar,
  carregando = false,
}) => {
  const [visivel, setVisivel] = useState(false);
  const [animando, setAnimando] = useState(false);

  useEffect(() => {
    if (aberto) {
      setVisivel(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimando(true));
      });
    } else {
      setAnimando(false);
      const timeout = setTimeout(() => setVisivel(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [aberto]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !carregando) {
        aoCancelar();
      }
    };
    if (aberto) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [aberto, aoCancelar, carregando]);

  if (!visivel) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        animando ? "bg-black/50" : "bg-black/0"
      }`}
    >
      <div
        className="fixed inset-0"
        onClick={() => !carregando && aoCancelar()}
      />

      <div
        className={`relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
          animando
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <button
          type="button"
          onClick={aoCancelar}
          disabled={carregando}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="flex flex-col items-center px-6 pt-8 pb-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 animate-pulse">
            <Warning size={32} weight="fill" className="text-red-500" />
          </div>

          <h3 className="mb-2 text-center text-xl font-bold text-gray-800">
            {titulo}
          </h3>
          <p className="text-center text-sm leading-relaxed text-gray-500">
            {mensagem}
          </p>
        </div>

        <div className="flex border-t border-gray-100">
          <button
            type="button"
            onClick={aoCancelar}
            disabled={carregando}
            className="flex-1 border-r border-gray-100 py-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {textoBotaoCancelar}
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            disabled={carregando}
            className="flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {carregando ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                Excluindo...
              </>
            ) : (
              textoBotaoConfirmar
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
