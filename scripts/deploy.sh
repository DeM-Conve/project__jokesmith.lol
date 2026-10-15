#!/usr/bin/env bash
# The only way to deploy: every test must pass first, then the containers are
# rebuilt and the served bundle is checked. Any failure stops here - nothing
# is deployed. Serves http://localhost:8200
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Frontend: lint, tests, build"
(cd frontend && npx oxlint && npm test && npx vite build)

echo "==> Backend: unit + integration tests (needs Docker)"
(cd backend && mvn -q verify)

echo "==> All tests passed - deploying"
docker compose up -d --build

for _ in $(seq 1 60); do
  curl -sf http://localhost:8200/api/me >/dev/null && break
  sleep 2
done
built=$(ls frontend/dist/assets | grep -o 'index-[^"]*\.js' | head -1)
served=$(curl -s http://localhost:8200 | grep -o 'index-[^"]*\.js' | head -1 || true)
echo "==> Built $built, serving ${served:-nothing}"
[ "$built" = "$served" ] || { echo "!! The served bundle is not the one just built"; exit 1; }
curl -sf http://localhost:8200/api/me >/dev/null || { echo "!! API not answering"; exit 1; }
echo "==> Deployed: http://localhost:8200"
