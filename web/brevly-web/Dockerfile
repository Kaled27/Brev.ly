###############################
# STAGE 1: Base
###############################

FROM node:22 AS base

RUN npm i -g pnpm

###############################
# STAGE 2: Dependencies
###############################

FROM base AS dependencies

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm i

###############################
# STAGE 3: Build
###############################

FROM base AS build

WORKDIR /usr/src/app

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package.json pnpm-lock.yaml ./
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .

RUN pnpm run build

###############################
# STAGE 4: Production
###############################

FROM nginx:1.27-alpine AS production

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  root /usr/share/nginx/html;' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
