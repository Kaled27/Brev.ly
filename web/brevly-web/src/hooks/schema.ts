import { z } from "zod";

export const esquemaUrlOriginal = z
  .string()
  .trim()
  .url("Informe uma URL valida. Ex: https://www.exemplo.com.br");

export function mensagemDeErroDaUrl(valor: string): string {
  if (!valor.trim()) return "";
  const resultado = esquemaUrlOriginal.safeParse(valor);
  return resultado.success ? "" : resultado.error.issues[0].message;
}