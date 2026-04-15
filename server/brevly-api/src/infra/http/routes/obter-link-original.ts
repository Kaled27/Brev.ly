import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const linkEncurtadoParam = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .transform((s) => s.toLowerCase());

export const obterLinkOriginalRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/links/codigo/:link_encurtado",
    {
      schema: {
        tags: ["links"],
        summary:
          "Obter URL original pelo código encurtado (incrementa qtd_acessos).",
        params: z.object({
          link_encurtado: linkEncurtadoParam,
        }),
        response: {
          200: z.object({
            link_encurtado: z.string(),
            link_original: z.string().url(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { link_encurtado: codigo } = request.params;
      const [row] = await db
        .update(schema.link)
        .set({
          qtd_visitas: sql`${schema.link.qtd_visitas} + 1`,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(schema.link.short_url, codigo),
            isNull(schema.link.deleted_at),
          ),
        )
        .returning({
          link_encurtado: schema.link.short_url,
          link_original: schema.link.original_url,
        });
      if (!row) {
        return reply.status(404).send({ message: "Link não encontrado." });
      }
      return reply.status(200).send(row);
    },
  );
};
