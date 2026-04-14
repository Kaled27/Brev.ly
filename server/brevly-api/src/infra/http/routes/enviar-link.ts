import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const enviarLinkRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/enviar-link",
    {
      schema: {
        tags: ["enviar-link"],
        summary: "Enviar link para encurtamento",
        body: z.object({
          link_original: z.string().url(),
          link_encurtado: z.string().url(),
        }),
        response: {
          201: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }).describe("Link já enviado."),
        },
      },
    },
    async (request, reply) => {
      return reply.status(201).send({ message: "Link enviado com sucesso!" });
    },
  );
};
