#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: $0 <worker-base-url>"
  echo "Example: $0 https://team10-backend.<subdomain>.workers.dev"
  exit 1
fi

BASE_URL="${1%/}"

echo "1) Health check: ${BASE_URL}/api/health"
HEALTH_RESPONSE="$(curl -sS -i "${BASE_URL}/api/health")"
echo "${HEALTH_RESPONSE}" | head -n 1
echo "${HEALTH_RESPONSE}" | tail -n +2

if ! echo "${HEALTH_RESPONSE}" | head -n 1 | grep -q "200"; then
  echo "Health check failed."
  exit 1
fi

echo ""
echo "2) GraphQL smoke test: ${BASE_URL}/api/graphql"
GRAPHQL_RESPONSE="$(
  curl -sS "${BASE_URL}/api/graphql" \
    -H "content-type: application/json" \
    -d '{"query":"query Smoke { orders { id status } receives { id status } }"}'
)"
echo "${GRAPHQL_RESPONSE}"

if echo "${GRAPHQL_RESPONSE}" | grep -q '"errors"'; then
  echo "GraphQL smoke test failed (errors returned)."
  exit 1
fi

if ! echo "${GRAPHQL_RESPONSE}" | grep -q '"data"'; then
  echo "GraphQL smoke test failed (no data field)."
  exit 1
fi

echo ""
echo "Smoke test passed."
