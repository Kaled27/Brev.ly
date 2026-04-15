import { uuidv7 } from "uuidv7";
import { apiClient } from "./apiClient";


export type LinkItem = {
  id: string;
  link_encurtado: string;
  link_original: string;
  qtd_acessos: number;
};

export type Pagy = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type RespostaLinks = {
  data: LinkItem[];
  pagy: Pagy;
};

/** Itens por página na listagem (alinha com scroll infinito no app). */
export const LINKS_PAGE_SIZE = 5;

export type BuscarLinksParams = {
  page: number;
  page_size?: number;
};

export async function buscarLinks(
  params: BuscarLinksParams,
): Promise<RespostaLinks> {
  const page_size = params.page_size ?? LINKS_PAGE_SIZE;
  const { data } = await apiClient.get<RespostaLinks>("links", {
    params: { page: params.page, page_size },
  });
  return data;
}

export type CorpoEnviarLink = {
  link_original: string;
  link_encurtado: string;
};

export async function enviarLink(corpo: CorpoEnviarLink): Promise<void> {
  await apiClient.post("enviar-link", corpo);
}

export async function deletarLink(id: string): Promise<void> {
  await apiClient.delete(`links/${id}`);
}

export type RespostaLinkPorCodigo = {
  link_encurtado: string;
  link_original: string;
};

export async function buscarUrlOriginalPorCodigo(
  linkEncurtado: string,
): Promise<RespostaLinkPorCodigo> {
  const { data } = await apiClient.get<RespostaLinkPorCodigo>(
    `links/codigo/${encodeURIComponent(linkEncurtado)}`,
  );
  return data;
}


/** Sempre retorna um nome tipo csv-<uuidv7>.csv */
function nomeArquivoDoContentDisposition(_header: string | undefined): string {
  return `csv-${uuidv7()}.csv`;
}

/** Baixa o CSV de links; dispara o download no navegador. */
export async function baixarLinksCsv(): Promise<void> {
  const response = await apiClient.get<Blob>("links/export.csv", {
    responseType: "blob",
  });

  const dispoRaw = response.headers["content-disposition"];
  const dispo =
    typeof dispoRaw === "string"
      ? dispoRaw
      : Array.isArray(dispoRaw)
        ? dispoRaw[0]
        : undefined;

  const filename = nomeArquivoDoContentDisposition(dispo);
  const blob = response.data;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
