import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const enviarLinkRoute: FastifyPluginAsyncZod = async (server) => {
  server.post("/enviar-link", async (request, reply) => {
    return "Enviar Link!";
  });
};
