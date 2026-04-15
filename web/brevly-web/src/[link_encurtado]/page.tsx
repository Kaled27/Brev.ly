import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/ui/card";
import { buscarUrlOriginalPorCodigo } from "../lib/linksApi";

/** Pausa curta para o usuário ver a tela de redirecionamento antes de sair. */
const ATRASO_REDIRECT_MS = 1200;

export function Page() {
  const { linkEncurtado } = useParams<{ linkEncurtado: string }>();
  const codigo = linkEncurtado?.trim() ?? "";

  const consulta = useQuery({
    queryKey: ["link-por-codigo", codigo],
    queryFn: () => buscarUrlOriginalPorCodigo(codigo),
    enabled: codigo.length > 0,
    retry: false,
  });

  useEffect(() => {
    const url = consulta.data?.link_original;
    if (!url) return;

    const id = window.setTimeout(() => {
      window.location.replace(url);
    }, ATRASO_REDIRECT_MS);

    return () => window.clearTimeout(id);
  }, [consulta.data?.link_original]);

  if (!codigo) {
    return (
      <div className="fixed flex min-h-screen min-w-full items-center justify-center bg-gray-200">
        <Card.Root className="flex max-w-md items-center justify-center lg:min-h-[200px]">
          <Card.Content className="flex w-full flex-col items-center gap-4 p-8 text-center">
            <p className="text-sm text-gray-600">Código do link inválido.</p>
            <Link
              to="/"
              className="text-sm font-semibold text-blue-base underline hover:text-blue-dark"
            >
              Voltar ao início
            </Link>
          </Card.Content>
        </Card.Root>
      </div>
    );
  }

  if (consulta.isError) {
    return (
      <div className="fixed flex min-h-screen min-w-full items-center justify-center bg-gray-200">
        <Card.Root className="flex max-w-md items-center justify-center lg:min-h-[200px]">
          <Card.Content className="flex w-full flex-col items-center gap-4 p-8 text-center">
            <p className="text-sm text-gray-600">
              Não encontramos esse link. Ele pode ter sido removido ou o código está
              incorreto.
            </p>
            <Link
              to="/"
              className="text-sm font-semibold text-blue-base underline hover:text-blue-dark"
            >
              Voltar ao início
            </Link>
          </Card.Content>
        </Card.Root>
      </div>
    );
  }

  const urlDestino = consulta.data?.link_original;

  return (
    <div className="fixed flex min-h-screen min-w-full items-center justify-center bg-gray-200">
      <Card.Root className="flex flex-1 items-center justify-center lg:min-h-[296px] lg:min-w-[580px]">
        <Card.Content className="flex w-full flex-col items-center justify-center gap-3 p-8 text-center">
          <img
            src="/Logo_V.svg"
            alt="Brevly logo"
            width={50}
            height={50}
            className="mx-auto"
          />

          <p className="w-full text-center text-xl font-bold text-gray-600">
            Redirecionando...
          </p>
          <span className="text-md w-full text-center font-semibold text-gray-600">
            O link será aberto automaticamente em alguns instantes.
            <br />
            Não foi redirecionado?{" "}
            {urlDestino ? (
              <a
                href={urlDestino}
                className="text-md font-semibold text-blue-base underline"
              >
                Acesse aqui
              </a>
            ) : (
              <span className="text-gray-400">Aguarde…</span>
            )}
          </span>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
