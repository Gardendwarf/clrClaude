#!/bin/sh
# Runtime env var injection for Vite builds.
# Vite bakes env vars at build time, but we want to set them at container start.
# This replaces placeholder strings in the built JS files with actual env values.

set -e

# Only replace if env vars are set (not empty)
if [ -n "$VITE_SUPABASE_URL" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec \
    sed -i "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL}|g" {} +
fi

if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec \
    sed -i "s|__VITE_SUPABASE_ANON_KEY__|${VITE_SUPABASE_ANON_KEY}|g" {} +
fi

echo "clrClaude starting..."
echo "  Supabase URL: ${VITE_SUPABASE_URL:-not configured (offline mode)}"

# Hand off to nginx
exec "$@"
