#!/bin/sh
set -e

# 1. Ensure writable runtime directories exist (SQLite volume + log dir)
mkdir -p /app/data /app/logs

# 2. Apply migrations and regenerate the client (runs as root)
npx prisma migrate deploy
npx prisma generate

# 3. Fix ownership of writable directories for the non-root app user
chown -R appuser:appgroup /app/data /app/logs

# 4. Drop to the non-root user and run the application
exec su-exec appuser "$@"