import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { and, eq, isNull } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deletarLinkRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/links/:id",
    {
      schema: {
        tags: ["links"],
        summary: "Excluir link (lógico): preenche deleted_at.",
        params: z.object({
          id: z.string().uuidv7(),
        }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const now = new Date();

      const [row] = await db
        .update(schema.link)
        .set({ deleted_at: now, updated_at: now })
        .where(and(eq(schema.link.id, id), isNull(schema.link.deleted_at)))
        .returning({ id: schema.link.id });

      if (!row) {
        return reply.status(404).send({ message: "Link não encontrado." });
      }

      return reply.status(200).send({ message: "Link removido." });
    },
  );
};
