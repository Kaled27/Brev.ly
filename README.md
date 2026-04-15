# Brev.ly

Monorepo com API (Fastify + PostgreSQL) e frontend (React + Vite).

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose v2 (`docker compose`)
- Para desenvolvimento local fora do Docker: [Node.js](https://nodejs.org/) (versão alinhada aos Dockerfiles, por exemplo 22) e [pnpm](https://pnpm.io/)

## Subir tudo com Docker (recomendado para testar)

Na raiz do repositório:

```bash
chmod +x start-containers.sh   # só na primeira vez
./start-containers.sh
```

Ou manualmente:

```bash
docker compose -f server/brevly-api/docker-compose.yml up --build -d
docker compose -f web/brevly-web/docker-compose-web.yml up --build -d
```

Após subir os serviços:

| Serviço    | URL / porta        |
|-----------|---------------------|
| Frontend  | http://localhost:5173 |
| API       | http://localhost:3333 |
| PostgreSQL| localhost:5432 (usuário/senha/db conforme `docker-compose` da API) |

Para encerrar:

```bash
docker compose -f server/brevly-api/docker-compose.yml down
docker compose -f web/brevly-web/docker-compose-web.yml down
```

## Desenvolvimento local (sem Docker para o app)

### API (`server/brevly-api`)

É necessário um PostgreSQL acessível (por exemplo o container só do `pg` do compose da API). Depois:

```bash
cd server/brevly-api
pnpm install
# configure DATABASE_URL no .env conforme seu ambiente
pnpm run dev
```

### Web (`web/brevly-web`)

```bash
cd web/brevly-web
pnpm install
pnpm run dev
```

Ajuste variáveis (por exemplo URL da API) conforme o `.env` do projeto web.

## Dependências e ferramentas

### pnpm

Gerenciador de pacotes para Node.js. Usa um store global e links simbólicos, o que costuma economizar espaço em disco e acelerar instalações em monorepos. Os lockfiles `pnpm-lock.yaml` em `server/brevly-api` e `web/brevly-web` fixam versões exatas; nos Dockerfiles a instalação também passa pelo pnpm para builds reproduzíveis.

### API (`server/brevly-api`)

- **Node.js** — runtime
- **Fastify** — servidor HTTP
- **Drizzle ORM** + **postgres** — acesso ao PostgreSQL e migrações (`drizzle-kit`)
- **Zod** + **fastify-type-provider-zod** — validação e tipagem das rotas
- **@fastify/cors**, **@fastify/multipart**, **@fastify/swagger** / **swagger-ui** — CORS, upload e documentação OpenAPI
- **tsx** — execução TypeScript em desenvolvimento

### Web (`web/brevly-web`)

- **React** + **React DOM** — UI
- **Vite** — bundler e dev server
- **TypeScript** — tipagem
- **Tailwind CSS** — estilos
- **React Router** — rotas
- **TanStack Query** — cache e requisições assíncronas
- **Axios** — cliente HTTP
- **Zod** — validação de esquemas
- **Phosphor Icons** — ícones
