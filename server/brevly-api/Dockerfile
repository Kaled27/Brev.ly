FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat \
  && corepack enable && corepack prepare pnpm@10 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.json tsconfig.build.json ./
COPY drizzle.config.ts ./
COPY src ./src
RUN pnpm run build

FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat

COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY drizzle.config.ts ./
COPY --from=build /app/dist ./dist
COPY src/infra/db/migrations ./src/infra/db/migrations
COPY src/infra/http/env.ts ./src/infra/http/env.ts

EXPOSE 3333

CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit migrate && node dist/infra/http/server.js"]
