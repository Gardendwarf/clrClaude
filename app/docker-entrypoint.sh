#!/bin/sh
# Runtime env var injection for Vite builds.
# Replaces placeholder strings in the built JS with actual env values at startup.
# Uses envsubst-style approach to avoid sed injection risks.

set -e

replace_placeholder() {
  PLACEHOLDER="$1"
  VALUE="$2"
  if [ -n "$VALUE" ]; then
    # Escape special characters in the value to prevent sed injection
    ESCAPED_VALUE=$(printf '%s\n' "$VALUE" | sed 's/[&/\]/\\&/g')
    find /usr/share/nginx/html/assets -name '*.js' -exec \
      sed -i "s|${PLACEHOLDER}|${ESCAPED_VALUE}|g" {} +
  fi
}

replace_placeholder "__VITE_SUPABASE_URL__" "$VITE_SUPABASE_URL"
replace_placeholder "__VITE_SUPABASE_ANON_KEY__" "$VITE_SUPABASE_ANON_KEY"

echo "clrClaude starting..."
echo "  Supabase URL: ${VITE_SUPABASE_URL:-not configured (offline mode)}"

# Hand off to nginx
exec "$@"
