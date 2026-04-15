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
