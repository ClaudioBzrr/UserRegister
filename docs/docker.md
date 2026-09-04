# Docker

The project is containerized following a three-file Compose layout with multi-stage Dockerfiles, mirroring the `open-architecture` conventions adapted for **SQLite** (no separate database service — the SQLite file lives in a named volume).

## Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Base — services, network, SQLite volume, server healthcheck |
| `docker-compose.override.yml` | Dev — hot reload, bind mounts, exposed ports (auto-loaded) |
| `docker-compose.prod.yml` | Prod — Traefik + TLS, production build targets |
| `server/dockerfile` | Server multi-stage: `base` → `development` / `production` |
| `server/entrypoint.sh` | Runs as root: apply migrations, generate client, fix volume ownership, drop to non-root |
| `web/dockerfile` | Web multi-stage: `development` → `build-stage` → `production-stage` (nginx) |
| `web/nginx.conf` | Serves the SPA and proxies `/api/*` to the backend |
| `.env.example` | Root env template for Compose interpolation |

## Commands

### Development

```sh
docker compose up          # builds + starts (auto-loads docker-compose.override.yml)
docker compose up -d       # detached
docker compose down        # stops containers (the sqlite volume persists)
```

- Server → http://localhost:3000
- Web (Vite) → http://localhost:5173
- The web dev server is a Vite HMR process; the browser calls the API at `http://localhost:3000` (CORS is enabled).
- Source is bind-mounted (`./server:/app`, `./web:/app`); anonymous `/app/node_modules` volumes preserve the container's Linux binaries.

### Production

```sh
cp .env.example .env       # set JWT_SECRET, APP_HOST, ADMIN_EMAIL
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env up -d --build
```

- Traefik terminates TLS (Let's Encrypt) for the frontend at `https://<APP_HOST>`.
- The frontend bundle is served by nginx, which proxies `/api/*` to the server container (no CORS in production).
- The server is not exposed publicly — it is reachable only through the nginx proxy on the internal network.

## How it works

### Server entrypoint (`server/entrypoint.sh`)

1. Creates `/app/data` (SQLite volume) and `/app/logs`.
2. Runs `prisma migrate deploy` + `prisma generate` as root (validates the schema and applies migrations on every boot).
3. `chown`s the writable directories to the non-root `appuser`.
4. Drops privileges with `su-exec appuser` and runs the app (`node --watch src/server.ts` in dev, `npm start` in prod).

The SQLite database persists in the `sqlite_data` named volume at `/app/data/dev.db`.

### Server Dockerfile (`server/dockerfile`)

```
base          node:24-alpine + build tools + su-exec, npm ci, prisma generate
development   base + source, ENTRYPOINT entrypoint.sh, CMD node --watch src/server.ts
production    base + source, ENTRYPOINT entrypoint.sh, CMD npm start
```

Build tools (`python3 make g++`) are installed so native modules (`bcrypt`, `better-sqlite3`) can compile on Alpine if prebuilt musl binaries are unavailable.

### Web Dockerfile (`web/dockerfile`)

```
development      node:24-alpine, CMD npm run dev -- --host   (Vite HMR)
build-stage      node:24-alpine, ARG VITE_API_URL, npm run build
production-stage nginx:alpine, serves /app/dist, proxies /api/* via nginx.conf
```

`VITE_API_URL` is a **build-time** variable baked into the JS bundle. Production uses `VITE_API_URL=/api` so the app talks to the same origin; nginx rewrites `/api/*` to the server's unprefixed routes (`/api/login` → `/login`).

### Nginx (`web/nginx.conf`)

- Serves the hashed JS/CSS assets with a 1-year immutable cache.
- Proxies `location /api/` to `${SERVER_UPSTREAM}` (injected at runtime via `envsubst`), rewriting away the `/api` prefix.
- Falls back to `index.html` for SPA routes.

## Environment variables

| Variable | Used by | Required |
|---|---|---|
| `SERVER_PORT` | Compose (published port) | no (default `3000`) |
| `NODE_ENV` | Server image | no (default `development`) |
| `JWT_SECRET` | Server | yes (prod); default provided in dev |
| `DATABASE_URL` | Server — always `file:/app/data/dev.db` in containers | set by Compose |
| `ADMIN_EMAIL` | Server seed **and** Traefik Let's Encrypt | prod |
| `ADMIN_PASSWORD` | Server seed | no |
| `APP_HOST` | Traefik route + TLS cert | prod |
| `VITE_API_URL` | Web build arg | prod (`/api`) |

The server seeds the first admin user on startup when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are provided (see [`backend.md`](./backend.md#admin-seed)).

## Common pitfalls

1. **SQLite volume ownership** — the entrypoint must `chown` `/app/data` (not `/data`) after migrations; otherwise the non-root user gets `attempt to write a readonly database`.
2. **`VITE_API_URL` is build-time** — changing it requires `docker compose build`, not just `up`.
3. **Anonymous `node_modules` volumes** — without `/app/node_modules`, host binaries shadow the container's Linux binaries.
4. **File watching in dev** — `node --watch`/Vite inside containers may not pick up changes on all Docker Desktop backends; restart the container if hot reload does not fire.
5. **`.env` at the repo root** — it is gitignored; create it from `.env.example`. Never commit secrets.

## CI/CD note

The `open-architecture` reference describes a push-to-deploy workflow (SCP + SSH + `docker compose ... up -d --build`). To wire this project to a VPS, add a GitHub Actions workflow that writes `.env` from secrets (create/use/delete in the same step) and runs the production Compose command above.