import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  CircleNotch,
  Copy,
  DownloadSimpleIcon,
  Trash,
} from "@phosphor-icons/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { ButtonDefault } from "./components/ui/button/ButtonDefault";
import { Card } from "./components/ui/card";
import { InputDefault } from "./components/ui/input/InputDefault";
import { LoadingBar } from "./components/ui/loading/LoadingBar";
import { Spinner } from "./components/ui/loading/Spinner";
import { ModalConfirmacao } from "./components/ui/modal/ModalConfirmacao";
import { ToastContainer } from "./components/ui/toast/ToastContainer";
import { esquemaUrlOriginal, mensagemDeErroDaUrl } from "./hooks/schema";
import { useToast } from "./hooks/useToast";
import {
  baixarLinksCsv,
  buscarLinks,
  deletarLink,
  enviarLink,
  LINKS_PAGE_SIZE,
  type LinkItem,
  type RespostaLinks,
} from "./lib/linksApi";
import { urlEncurtadaNoOriginAtual } from "./lib/shortLinkUrl";

const PREFIJO_LINK_ENCURTADO = "brev.ly/";
const DURACAO_ANIM_EXCLUSAO_MS = 720;
const DURACAO_ANIM_ENTRADA_LINK_MS = 580;

const CHAVE_CONSULTA_LINKS = ["links", LINKS_PAGE_SIZE] as const;

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
  const [idLinkEmExclusaoAnimada, setIdLinkEmExclusaoAnimada] = useState<
    string | null
  >(null);
  const [idsLinkEntradaAnimada, setIdsLinkEntradaAnimada] = useState<
    Set<string>
  >(() => new Set());
  const [exportandoCsv, setExportandoCsv] = useState(false);
  const { toasts, dismiss, showSuccess, showError } = useToast();

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

  const consultaLinks = useInfiniteQuery({
    queryKey: CHAVE_CONSULTA_LINKS,
    queryFn: ({ pageParam }) =>
      buscarLinks({ page: pageParam, page_size: LINKS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (ultimaPagina) => {
      const { page, total_pages } = ultimaPagina.pagy;
      if (total_pages === 0 || page >= total_pages) return undefined;
      return page + 1;
    },
  });

  const listaScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const itensLinks =
    consultaLinks.data?.pages.flatMap((pagina) => pagina.data) ?? [];

  const metaLista = consultaLinks.data?.pages[0]?.pagy;
  const totalLinks = metaLista?.total ?? 0;
  const carregadosCount = itensLinks.length;
  const progressoListaPct =
    totalLinks > 0
      ? Math.min(100, Math.round((carregadosCount / totalLinks) * 100))
      : 100;

  useEffect(() => {
    const root = listaScrollRef.current;
    const alvo = sentinelRef.current;
    if (
      !root ||
      !alvo ||
      !consultaLinks.hasNextPage ||
      consultaLinks.isFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          void consultaLinks.fetchNextPage();
        }
      },
      { root, rootMargin: "120px", threshold: 0 },
    );

    observer.observe(alvo);
    return () => observer.disconnect();
  }, [
    consultaLinks.hasNextPage,
    consultaLinks.isFetchingNextPage,
    consultaLinks.fetchNextPage,
    itensLinks.length,
  ]);

  const envioDeLink = useMutation({
    mutationFn: enviarLink,
    onSuccess: async () => {
      const cacheAntes =
        queryClient.getQueryData<InfiniteData<RespostaLinks>>(CHAVE_CONSULTA_LINKS);
      const idsAntes = new Set(
        cacheAntes?.pages.flatMap((p) => p.data.map((i) => i.id)) ?? [],
      );

      await queryClient.invalidateQueries({ queryKey: ["links"] });

      const cacheDepois =
        queryClient.getQueryData<InfiniteData<RespostaLinks>>(CHAVE_CONSULTA_LINKS);
      const todosDepois = cacheDepois?.pages.flatMap((p) => p.data) ?? [];
      const idsNovos = todosDepois
        .filter((item) => !idsAntes.has(item.id))
        .map((item) => item.id);

      if (idsNovos.length > 0) {
        setIdsLinkEntradaAnimada((prev) => {
          const next = new Set(prev);
          idsNovos.forEach((id) => next.add(id));
          return next;
        });
        window.setTimeout(() => {
          setIdsLinkEntradaAnimada((prev) => {
            const next = new Set(prev);
            idsNovos.forEach((id) => next.delete(id));
            return next;
          });
        }, DURACAO_ANIM_ENTRADA_LINK_MS);
      }

      showSuccess("Link salvo com sucesso.");
    },
    onError: () => {
      showError("Não foi possível salvar o link. Tente novamente.");
    },
  });

  const exclusaoDeLink = useMutation({
    mutationFn: deletarLink,
  });

  const confirmarExclusao = () => {
    if (!linkParaExcluir) return;
    const id = linkParaExcluir.id;
    setLinkParaExcluir(null);
    setIdLinkEmExclusaoAnimada(id);

    exclusaoDeLink.mutate(id, {
      onSuccess: async () => {
        showSuccess("Link excluído com sucesso.");
        await new Promise((r) =>
          window.setTimeout(r, DURACAO_ANIM_EXCLUSAO_MS),
        );
        await queryClient.invalidateQueries({ queryKey: ["links"] });
        setIdLinkEmExclusaoAnimada(null);
      },
      onError: () => {
        showError("Não foi possível excluir o link. Tente novamente.");
        setIdLinkEmExclusaoAnimada(null);
      },
    });
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

  const semLinksCadastrados = totalLinks === 0 && itensLinks.length === 0;

  const aoBaixarCsv = async () => {
    if (semLinksCadastrados || exportandoCsv || consultaLinks.isPending) return;
    setExportandoCsv(true);
    try {
      await baixarLinksCsv();
    } catch {
      showError("Não foi possível baixar o CSV. Tente novamente.");
    } finally {
      setExportandoCsv(false);
    }
  };

  const aoCopiarLinkEncurtado = async (item: LinkItem) => {
    const url = urlEncurtadaNoOriginAtual(item.link_encurtado);
    try {
      await navigator.clipboard.writeText(url);
      showSuccess("Link copiado para a área de transferência.");
    } catch {
      showError(
        "Não foi possível copiar o link. Verifique as permissões do navegador.",
      );
    }
  };

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
            {((consultaLinks.isFetching &&
              !consultaLinks.isFetchingNextPage) ||
              exclusaoDeLink.isPending) && <LoadingBar />}
            <Card.Header className="flex flex-row items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg text-gray-600 font-bold">Meus links</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {LINKS_PAGE_SIZE} por página · role a lista para carregar o restante
                </p>
              </div>
              <ButtonDefault
                variant="icon-default"
                className="gap-2 shrink-0"
                type="button"
                disabled={
                  semLinksCadastrados ||
                  consultaLinks.isPending ||
                  exportandoCsv
                }
                onClick={() => void aoBaixarCsv()}
              >
                {exportandoCsv ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" />
                    Baixando…
                  </>
                ) : (
                  <>
                    <DownloadSimpleIcon size={16} />
                    Baixar CSV
                  </>
                )}
              </ButtonDefault>
            </Card.Header>
            <div className="my-4 h-px w-full bg-gray-200" />
            <Card.Content className="relative">
              {idLinkEmExclusaoAnimada ? (
                <div
                  className="trash-catch-pulse pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-white/90 p-2.5 shadow-md ring-1 ring-red-200/80 backdrop-blur-sm"
                  aria-hidden
                >
                  <Trash size={22} weight="duotone" className="text-danger" />
                </div>
              ) : null}
              {consultaLinks.isPending ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <Spinner size={40} />
                  <span className="text-sm text-gray-400">Carregando links…</span>
                </div>
              ) : consultaLinks.isError ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Não foi possível carregar os links.
                </div>
              ) : itensLinks.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <img src="/Link.svg" alt="Link icon" className="mx-auto" />
                  <p className="text-center text-gray-500 text-xs">
                    AINDA NÃO EXISTEM LINKS CADASTRADOS
                  </p>
                </div>
              ) : (
                <>
                  <div
                    ref={listaScrollRef}
                    className="max-h-[min(52vh,380px)] overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg pr-0.5"
                  >
                    <div className="flex flex-col gap-4 overflow-x-hidden pb-1">
                      {itensLinks.map((item) => {
                        const urlAtalho = urlEncurtadaNoOriginAtual(
                          item.link_encurtado,
                        );
                        return (
                          <Fragment key={item.id}>
                            <div
                              className={`flex items-center justify-between ${
                                item.id === idLinkEmExclusaoAnimada
                                  ? "link-exit-to-trash"
                                  : idsLinkEntradaAnimada.has(item.id)
                                    ? "link-enter-highlight"
                                    : ""
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <a
                                  href={urlAtalho}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-base text-md font-semibold"
                                >
                                  {urlAtalho.replace(/^https?:\/\//, "")}
                                </a>
                                <p className="text-gray-500 text-sm font-normal wrap-break-word">
                                  {item.link_original}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className="px-4 text-sm font-normal">
                                  {item.qtd_acessos} acessos
                                </span>
                                <ButtonDefault
                                  variant="icon-default"
                                  className="gap-2"
                                  type="button"
                                  onClick={() => void aoCopiarLinkEncurtado(item)}
                                  title="Copiar link encurtado"
                                >
                                  <Copy size={16} />
                                </ButtonDefault>
                                <ButtonDefault
                                  variant="icon-default"
                                  className="gap-2"
                                  disabled={
                                    exclusaoDeLink.isPending ||
                                    idLinkEmExclusaoAnimada !== null
                                  }
                                  onClick={() => setLinkParaExcluir(item)}
                                >
                                  <Trash size={16} />
                                </ButtonDefault>
                              </div>
                            </div>
                            <div className="my-1 h-px w-full bg-gray-200" />
                          </Fragment>
                        );
                      })}
                    </div>
                    {consultaLinks.hasNextPage ? (
                      <div
                        ref={sentinelRef}
                        className="flex min-h-10 flex-col items-center justify-center gap-2 py-3"
                        aria-hidden
                      >
                        {consultaLinks.isFetchingNextPage ? (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Spinner size={20} />
                            <span>Carregando mais links…</span>
                          </div>
                        ) : (
                          <p className="text-center text-xs font-medium text-blue-base/80">
                            ↓ Continue rolando para carregar mais
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <p className="text-xs text-gray-400">
                          Você chegou ao fim da lista
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5 border-t border-gray-200/80 pt-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                      <span>
                        <span className="font-semibold text-gray-600">
                          {carregadosCount}
                        </span>
                        {" de "}
                        <span className="font-semibold text-gray-600">
                          {totalLinks}
                        </span>
                        {" links carregados"}
                      </span>
                      {consultaLinks.hasNextPage ? (
                        <span className="shrink-0 text-blue-base">Mais abaixo ↓</span>
                      ) : (
                        <span className="shrink-0 text-emerald-600/90">Tudo carregado</span>
                      )}
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-gray-200/90"
                      title={`${progressoListaPct}% dos links já visíveis nesta lista`}
                    >
                      <div
                        className="h-full rounded-full bg-blue-base transition-[width] duration-500 ease-out"
                        style={{ width: `${progressoListaPct}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </Card.Content>
          </Card.Root>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

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
