import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { env } from "@/infra/http/env";
import { and, asc, gt, isNull } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { uuidv7 } from "uuidv7";

const BATCH_SIZE = 500;

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function montarUrlEncurtada(
  protocol: string,
  host: string,
  codigo: string,
): string {
  return `${protocol}://${host}/${codigo}`;
}

export const exportarLinksCsvRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/links/export.csv",
    {
      schema: {
        tags: ["links"],
        summary:
          "Exportar links ativos (deleted_at IS NULL) em CSV, com nome de arquivo único.",
        description:
          "Colunas: URL original, URL encurtada, contagem de acessos, data de criação. Listagem em lotes no servidor. Para download no navegador, abra a URL diretamente; o “Try it out” do Swagger pode demorar em bases grandes.",
      },
    },
    async (request, reply) => {
      const forwarded = request.headers["x-forwarded-proto"];
      const protocol =
        typeof forwarded === "string"
          ? forwarded.split(",")[0].trim()
          : request.protocol;
      const host = request.headers.host ?? `localhost:${env.PORT}`;

      const filename = `links-${uuidv7()}.csv`;

      const headerLine = [
        "URL original",
        "URL encurtada",
        "Contagem de acessos",
        "Data de criação",
      ]
        .map(csvCell)
        .join(",");

      const chunks: string[] = ["\ufeff", `${headerLine}\n`];

      let lastId: string | undefined;

      for (;;) {
        const whereClause =
          lastId !== undefined
            ? and(isNull(schema.link.deleted_at), gt(schema.link.id, lastId))
            : isNull(schema.link.deleted_at);

        const batch = await db
          .select({
            id: schema.link.id,
            original_url: schema.link.original_url,
            short_url: schema.link.short_url,
            qtd_visitas: schema.link.qtd_visitas,
            created_at: schema.link.created_at,
          })
          .from(schema.link)
          .where(whereClause)
          .orderBy(asc(schema.link.id))
          .limit(BATCH_SIZE);

        if (batch.length === 0) {
          break;
        }

        for (const row of batch) {
          const urlEnc = montarUrlEncurtada(protocol, host, row.short_url);
          const created =
            row.created_at instanceof Date
              ? row.created_at.toISOString()
              : String(row.created_at);

          const line = [
            csvCell(row.original_url),
            csvCell(urlEnc),
            csvCell(row.qtd_visitas),
            csvCell(created),
          ].join(",");

          chunks.push(`${line}\n`);
        }

        lastId = batch[batch.length - 1].id;
      }

      const body = chunks.join("");

      return reply
        .header("Content-Type", "text/csv; charset=utf-8")
        .header(
          "Content-Disposition",
          `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        )
        .send(body);
    },
  );
};
