import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, DownloadSimpleIcon, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { ButtonDefault } from "./components/ui/button/ButtonDefault";
import { Card } from "./components/ui/card";
import { InputDefault } from "./components/ui/input/InputDefault";
import { LoadingBar } from "./components/ui/loading/LoadingBar";
import { Spinner } from "./components/ui/loading/Spinner";
import { ModalConfirmacao } from "./components/ui/modal/ModalConfirmacao";
import { esquemaUrlOriginal, mensagemDeErroDaUrl } from "./hooks/schema";
import { buscarLinks, deletarLink, enviarLink, type LinkItem } from "./lib/linksApi";

const PREFIJO_LINK_ENCURTADO = "brev.ly/";

function slugApartirDoValorDigitado(valor: string): string {
  const pl = PREFIJO_LINK_ENCURTADO.toLowerCase();
  const vl = valor.toLowerCase();

  if (vl.startsWith(pl)) {
    return valor.slice(PREFIJO_LINK_ENCURTADO.length);
  }

  if (
    valor.length < PREFIJO_LINK_ENCURTADO.length &&
    pl.startsWith(vl)
  ) {
    return "";
  }

  if (valor.length === 0) {
    return "";
  }

  const pos = vl.indexOf(pl);
  if (pos !== -1) {
    return valor.slice(pos + PREFIJO_LINK_ENCURTADO.length);
  }

  return valor;
}

/** Regra única: salvar só com ambos preenchidos, sem erro visível no URL e URL válida pelo schema. */
function podeSalvarNovoLink(input: {
  linkOriginal: string;
  erroLinkOriginal: string;
  slugEncurtado: string;
}): boolean {
  const url = input.linkOriginal.trim();
  const slug = input.slugEncurtado.trim();

  if (url.length === 0 || slug.length === 0) {
    return false;
  }

  if (input.erroLinkOriginal !== "") {
    return false;
  }

  return esquemaUrlOriginal.safeParse(url).success;
}

export default function App() {
  const [originalLink, setOriginalLink] = useState("");
  const [originalLinkError, setOriginalLinkError] = useState("");
  const [slugEncurtado, setSlugEncurtado] = useState("");
  const [linkParaExcluir, setLinkParaExcluir] = useState<LinkItem | null>(null);

  const aoAlterarLinkOriginal = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const valor = event.target.value;
    setOriginalLink(valor);
    setOriginalLinkError(mensagemDeErroDaUrl(valor));
  };

  const aoAlterarLinkEncurtado = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSlugEncurtado(slugApartirDoValorDigitado(event.target.value));
  };

  const queryClient = useQueryClient();

  const consultaLinks = useQuery({
    queryKey: ["links"],
    queryFn: buscarLinks,
  });

  const envioDeLink = useMutation({
    mutationFn: enviarLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["links"] });
      setOriginalLink("");
      setOriginalLinkError("");
      setSlugEncurtado("");
    },
  });

  const exclusaoDeLink = useMutation({
    mutationFn: deletarLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["links"] });
      setLinkParaExcluir(null);
    },
  });

  const confirmarExclusao = () => {
    if (linkParaExcluir) {
      exclusaoDeLink.mutate(linkParaExcluir.id);
    }
  };

  const cancelarExclusao = () => {
    if (!exclusaoDeLink.isPending) {
      setLinkParaExcluir(null);
    }
  };

  const salvarLinkHabilitado = podeSalvarNovoLink({
    linkOriginal: originalLink,
    erroLinkOriginal: originalLinkError,
    slugEncurtado,
  });

  const aoSubmeterNovoLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const urlLimpa = originalLink.trim();
    const slug = slugEncurtado.trim();

    if (!podeSalvarNovoLink({
      linkOriginal: originalLink,
      erroLinkOriginal: originalLinkError,
      slugEncurtado,
    })) {
      if (!urlLimpa) {
        setOriginalLinkError("Informe a URL original.");
        return;
      }
      const erroUrl = mensagemDeErroDaUrl(urlLimpa);
      if (erroUrl) {
        setOriginalLinkError(erroUrl);
      }
      return;
    }

    envioDeLink.mutate({
      link_original: urlLimpa,
      link_encurtado: slug,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-4 bg-gray-200 px-3 pt-8 lg:px-8 lg:pt-10">
      <div className="flex w-full max-w-[1120px] flex-col gap-4">
        <img
          src="/Logo_H.svg"
          width={100}
          height={100}
          alt="Brevly logo"
          className="mx-auto pb-2 lg:mx-0 lg:pb-4"
        />

        <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-start">
          <Card.Root className="shrink-0">
            {envioDeLink.isPending && <LoadingBar />}
            <Card.Header>
              <h2 className="text-lg font-bold">Novo link</h2>
            </Card.Header>
            <form onSubmit={aoSubmeterNovoLink} className="contents">
              <Card.Content>
                <InputDefault
                  variant="primary-default"
                  label="link original"
                  placeholder="https://www.exemplo.com.br"
                  value={originalLink}
                  onChange={aoAlterarLinkOriginal}
                  errorMessage={originalLinkError}
                />
                <InputDefault
                  variant="primary-default"
                  label="link encurtado"
                  placeholder={`${PREFIJO_LINK_ENCURTADO}meet`}
                  value={`${PREFIJO_LINK_ENCURTADO}${slugEncurtado}`}
                  onChange={aoAlterarLinkEncurtado}
                  autoComplete="off"
                />
                {envioDeLink.isError ? (
                  <p className="text-danger text-xs">
                    Não foi possível salvar o link. Tente novamente.
                  </p>
                ) : null}
              </Card.Content>
              <Card.Footer>
                <ButtonDefault
                  variant="primary-default"
                  type="submit"
                  disabled={!salvarLinkHabilitado || envioDeLink.isPending}
                >
                  {envioDeLink.isPending ? "Salvando…" : "Salvar link"}
                </ButtonDefault>
              </Card.Footer>
            </form>
          </Card.Root>

          <Card.Root className="lg:max-w-none lg:flex-1">
            {(consultaLinks.isFetching || exclusaoDeLink.isPending) && <LoadingBar />}
            <Card.Header className="flex flex-row items-center justify-between">
              <h2 className="text-lg text-gray-600 font-bold">Meus links</h2>
              <ButtonDefault variant="icon-default" className="gap-2" disabled>
                <DownloadSimpleIcon size={16} />
                Baixar CSV
              </ButtonDefault>
            </Card.Header>
            <div className="my-4 h-px w-full bg-gray-200" />
            <Card.Content>
              {consultaLinks.isPending ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <Spinner size={40} />
                  <span className="text-sm text-gray-400">Carregando links…</span>
                </div>
              ) : consultaLinks.isError ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Não foi possível carregar os links.
                </div>
              ) : consultaLinks.data.data.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <img src="/Link.svg" alt="Link icon" className="mx-auto" />
                  <p className="text-center text-gray-500 text-xs">
                    AINDA NÃO EXISTEM LINKS CADASTRADOS
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {consultaLinks.data.data.map((item) => (
                    <><div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <a href={`${item.link_original}`} target="_blank" className="text-blue-base text-md font-semibold">
                          brev.ly/{item.link_encurtado}
                        </a>
                        <p className="text-gray-500 text-sm font-normal">
                          {item.link_original}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-4 text-sm font-normal">{item.qtd_acessos} acessos</span>
                        <ButtonDefault variant="icon-default" className="gap-2">
                          <Copy size={16} />
                        </ButtonDefault>
                        <ButtonDefault
                          variant="icon-default"
                          className="gap-2"
                          onClick={() => setLinkParaExcluir(item)}
                        >
                          <Trash size={16} />
                        </ButtonDefault>
                      </div>
                    </div><div className="my-1 h-px w-full bg-gray-200" /></>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card.Root>
        </div>
      </div>

      <ModalConfirmacao
        aberto={linkParaExcluir !== null}
        titulo="Excluir link"
        mensagem={
          linkParaExcluir
            ? `Tem certeza que deseja excluir o link "brev.ly/${linkParaExcluir.link_encurtado}"?`
            : ""
        }
        textoBotaoConfirmar="Excluir"
        textoBotaoCancelar="Cancelar"
        aoConfirmar={confirmarExclusao}
        aoCancelar={cancelarExclusao}
        carregando={exclusaoDeLink.isPending}
      />
    </div>
  );
}
