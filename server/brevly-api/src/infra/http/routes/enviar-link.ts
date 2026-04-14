import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { env } from "@/infra/http/env";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  while (current && typeof current === "object") {
    const o = current as { code?: string; cause?: unknown };
    if (o.code === "23505") return true;
    current = o.cause;
  }
  return false;
}

export const enviarLinkRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/enviar-link",
    {
      schema: {
        tags: ["links"],
        summary: "Encurtar link (link_encurtado = só o código, ex.: google).",
        body: z.object({
          link_original: z.string().url(),
          link_encurtado: z
            .string()
            .trim()
            .min(1)
            .max(50)
            .regex(/^[a-zA-Z0-9_-]+$/)
            .transform((s) => s.toLowerCase()),
        }),
        response: {
          201: z.object({
            message: z.string(),
            data: z.object({
              link_encurtado: z.string(),
              url_curta: z.string().url(),
            }),
          }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { link_original, link_encurtado } = request.body;

      try {
        await db.insert(schema.link).values({
          original_url: link_original,
          short_url: link_encurtado,
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          return reply
            .status(409)
            .send({ message: "Esse link encurtado já está em uso." });
        }
        throw error;
      }

      const forwarded = request.headers["x-forwarded-proto"];
      const protocol =
        typeof forwarded === "string"
          ? forwarded.split(",")[0].trim()
          : request.protocol;
      const host = request.headers.host ?? `localhost:${env.PORT}`;
      const url_curta = `${protocol}://${host}/${link_encurtado}`;

      return reply.status(201).send({
        message: "Link encurtado com sucesso!",
        data: {
          link_encurtado,
          url_curta,
        },
      });
    },
  );
};
