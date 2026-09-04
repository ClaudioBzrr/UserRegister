# Setup guide

Instructions for running the User Register application locally.

> **Prefer Docker?** See [docker.md](./docker.md) — `docker compose up` runs the whole stack (server + web) with a single command.

## Prerequisites

- **Node.js ≥ 24** (the server uses native TypeScript type-stripping and `--env-file`).
- **npm** (comes with Node).
- No separate database installation is required — SQLite runs in-process.

## 1. Configure the server

```sh
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and provide at least:

```
SERVER_PORT=3000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=change-me-to-a-long-random-string
NODE_ENV=development
```

| Variable | Required | Default | Notes |
|---|---|---|---|
| `SERVER_PORT` | no | `3000` | HTTP port |
| `NODE_ENV` | no | `development` | `development`, `production`, or `test` |
| `DATABASE_URL` | yes | — | SQLite URL, e.g. `file:./prisma/dev.db` |
| `JWT_SECRET` | yes | — | Signing secret, min 8 characters; use a long random value |
| `ADMIN_EMAIL` | no | — | Together with `ADMIN_PASSWORD`, seeds the first (admin) user on startup |
| `ADMIN_PASSWORD` | no | — | Initial password for the seeded admin user (min 6 characters) |

## 2. Create the database

```sh
cd server
npx prisma migrate dev
```

This applies the migrations and creates `server/prisma/dev.db`. It also regenerates the Prisma client into `server/src/generated/prisma`.

## 3. Start the server

```sh
cd server
npm run dev
```

The server listens on http://localhost:3000 and logs to the console plus `server/logs/`.

Verify it is healthy:

```sh
curl http://localhost:3000/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"x@test.com","password":"wrong11"}'
# → 401 {"status":"error","message":"Invalid email or password."}
```

## 4. Start the web app

```sh
cd web
npm install
npm run dev
```

Vite serves the app on http://localhost:5173.

> Optional: create `web/.env.local` with `VITE_API_URL=http://localhost:3000`. If unset, the client defaults to `http://localhost:3000` anyway.

## 5. Use the app

1. Open http://localhost:5173.
2. You'll be redirected to `/login` (nothing is signed in yet).
3. Create your first user with **New user** — or register directly against the API:

   ```sh
   curl -X POST http://localhost:3000/create-user \
     -H "Content-Type: application/json" \
     -d '{"name":"Alice","email":"alice@example.com","password":"secret1"}'
   ```

4. Sign in. The Users page lists everyone; edit/delete are available only for your own account.

## Day-to-day scripts

| Task | Command |
|---|---|
| Run server (dev, watch) | `cd server && npm run dev` |
| Run server (single run) | `cd server && npm start` |
| Type-check server | `cd server && npx tsc --noEmit` |
| Run web (dev) | `cd web && npm run dev` |
| Build web (prod) | `cd web && npm run build` |
| Create migration after schema change | `cd server && npx prisma migrate dev` |
| Regenerate Prisma client | `cd server && npx prisma generate` |
| Open Prisma Studio | `cd server && npx prisma studio` |

## Production notes

- Set `NODE_ENV=production` and a strong `JWT_SECRET`.
- The `token` cookie is marked `secure` only in production — serve the API over HTTPS.
- Frontend `VITE_API_URL` must be the public API URL and is baked in at build time (`npm run build`).
- The SQLite file is local to the server process/container. For multi-instance or high-concurrency deployments, migrate the datasource to PostgreSQL (the repository layer makes this a drop-in change at the Prisma implementation).