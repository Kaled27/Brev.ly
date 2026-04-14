import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import {
  pagyResponseSchema,
  resolvePagination,
} from "@/infra/services/pagination";
import { count, desc } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(10),
});

const linkListItemSchema = z.object({
  link_encurtado: z.string().meta({ examples: ["meet"] }),
  link_original: z
    .string()
    .url()
    .meta({ examples: ["https://meet.google.com/lookup/abc-defg-hij"] }),
  qtd_acessos: z
    .number()
    .int()
    .nonnegative()
    .meta({ examples: [1523] }),
});

export const listarLinksRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/links",
    {
      schema: {
        tags: ["links"],
        summary: "Listar links encurtados com paginação.",
        querystring: listQuerySchema,
        response: {
          200: z.object({
            data: z.array(linkListItemSchema),
            pagy: pagyResponseSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const { page, page_size: pageSize } = request.query;

      const [totalRow] = await db.select({ total: count() }).from(schema.link);

      const total = Number(totalRow?.total ?? 0);
      const { offset, meta } = resolvePagination(
        { page, page_size: pageSize },
        total,
      );

      const rows = await db
        .select({
          link_encurtado: schema.link.short_url,
          link_original: schema.link.original_url,
          qtd_acessos: schema.link.qtd_visitas,
        })
        .from(schema.link)
        .orderBy(desc(schema.link.id))
        .limit(pageSize)
        .offset(offset);

      return reply.status(200).send({
        data: rows,
        pagy: meta,
      });
    },
  );
};
