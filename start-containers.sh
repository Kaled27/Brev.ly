#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker compose -f "$ROOT/server/brevly-api/docker-compose.yml" up --build -d
docker compose -f "$ROOT/web/brevly-web/docker-compose-web.yml" up --build -d

echo "Containers iniciados. Frontend: http://localhost:5173 | API: http://localhost:3333"
