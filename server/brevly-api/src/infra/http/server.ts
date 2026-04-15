import { env } from "@/infra/http/env";
import { fastifyCors } from "@fastify/cors";
import { fastifyMultipart } from "@fastify/multipart";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { deletarLinkRoute } from "./routes/deletar-link";
import { enviarLinkRoute } from "./routes/enviar-link";
import { exportarLinksCsvRoute } from "./routes/exportar-links-csv";
import { listarLinksRoute } from "./routes/listar-links";
import { obterLinkOriginalRoute } from "./routes/obter-link-original";

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.validation,
    });
  }
  console.error(error);
  return reply.status(500).send({ message: "Internal server error." });
});

server.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

server.register(fastifyMultipart);
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Brevly API",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

server.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

server.register(listarLinksRoute);
server.register(exportarLinksCsvRoute);
server.register(obterLinkOriginalRoute);
server.register(enviarLinkRoute);
server.register(deletarLinkRoute);

server.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log(`HTTP Server running on port ${env.PORT}!`);
});
