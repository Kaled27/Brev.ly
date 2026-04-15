/** URL do atalho no mesmo origin da SPA (ex.: http://localhost:5173/meet). */
export function urlEncurtadaNoOriginAtual(slug: string): string {
  const limpo = slug.replace(/^\/+/, "");
  return `${window.location.origin}/${limpo}`;
}
