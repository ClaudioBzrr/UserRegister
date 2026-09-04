# User Register

A full-stack login and user management system built with **Express + Prisma + React (Vite)**.

- **Server** (`server/`): Node.js + Express 5 + Prisma 7 (SQLite) + JWT + bcrypt + Winston + Zod.
- **Web** (`web/`): React 19 + React Router 7 + Vite + CSS Modules.

## Quick start

### With Docker (recommended)

```sh
cp .env.example .env        # optional — sane defaults for dev
docker compose up           # server → http://localhost:3000, web → http://localhost:5173
```

### Without Docker

```sh
# 1. Server (run from server/)
npm install
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev      # creates the SQLite database
npm run dev                 # starts on http://localhost:3000

# 2. Web (run from web/, in another terminal)
npm install
npm run dev                 # starts on http://localhost:5173
```

Open http://localhost:5173, sign in (or create a user on the Users page).

## Features

- Public registration (`POST /create-user`) and login (`POST /login`).
- JWT-based authentication for all other endpoints (bearer token or cookie).
- Password hashing with **bcrypt** (10 salt rounds).
- User management: list users, view your profile, update and delete your own account.
- Layered architecture: `Route → Controller → Service → Repository → Prisma`, with constructor dependency injection.
- Detailed documentation in [`docs/`](./docs/README.md).

## Documentation

| Document | Scope |
|---|---|
| [Setup guide](./docs/setup.md) | Prerequisites, environment variables, running and building |
| [Docker](./docs/docker.md) | Compose dev/prod commands, multi-stage images, nginx proxy |
| [Architecture](./docs/architecture.md) | Layered pattern, request flow, dependency injection |
| [Backend](./docs/backend.md) | Server structure, API reference, services, repositories, auth |
| [Frontend](./docs/frontend.md) | React structure, auth flow, route guards, components |
| [Database](./docs/database.md) | Prisma schema and migration workflow |
| [Security](./docs/security.md) | Password handling, JWT, authorization rules, validation |

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js 24, Express 5, Prisma 7, SQLite (better-sqlite3), jsonwebtoken, bcrypt, Winston, Zod |
| Frontend | React 19, React Router 7, Vite 7, TypeScript, CSS Modules, lucide-react |