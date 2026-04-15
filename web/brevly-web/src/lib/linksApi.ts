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

export async function buscarLinks(): Promise<RespostaLinks> {
  const { data } = await apiClient.get<RespostaLinks>("links");
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
