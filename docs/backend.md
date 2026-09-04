# Backend

Express 5 + Prisma 7 (SQLite) + jsonwebtoken + bcrypt + Winston + Zod.

## Folder structure

```
server/src/
├── controllers/            # HTTP handlers — one file per domain
│   └── user-controller.ts  # create, login, findMany, me, update, delete
├── services/               # Business logic — one file per use case
│   ├── create-user-service.ts
│   ├── delete-user-service.ts
│   ├── find-user-service.ts
│   ├── get-user-service.ts
│   ├── login-user-service.ts
│   └── update-user-service.ts
├── repositories/           # Data-access implementations
│   ├── index.ts            # DI container — all instances live here
│   ├── bcrypt/             # Password hashing implementation
│   └── prisma/             # Prisma-backed implementation
├── types/
│   ├── entities/           # Domain interfaces (IUser, IRepository, ...)
│   ├── payloads/           # Zod schemas + inferred types (user-payload.ts)
│   └── repositories/       # Repository contracts (IUserRepository, IPasswordHasher)
├── middlewares/
│   ├── validate-token.ts   # JWT verification middleware
│   └── valid-schema.ts     # Zod request-body validation middleware
├── lib/
│   ├── env.ts              # Environment variable validation (Zod)
│   ├── logger.ts           # Winston logger setup
│   └── prisma.ts           # Singleton Prisma client
├── routes/
│   ├── index.ts            # Route aggregator — public/auth boundary
│   └── user-routes.ts      # publicUserRouter + authUserRouter
├── generated/prisma/       # Generated Prisma client (gitignored)
└── server.ts               # Express entry point
```

## Running

```sh
cd server
npm install
cp .env.example .env        # set DATABASE_URL and JWT_SECRET
npx prisma migrate dev      # create SQLite DB + apply migrations
npm run dev                 # node --watch --env-file .env src/server.ts
```

The server listens on `SERVER_PORT` (default `3000`).

## Environment variables

Validated by Zod in `src/lib/env.ts`; the server exits if a required variable is missing or invalid.

| Variable | Required | Description |
|---|---|---|
| `SERVER_PORT` | no | HTTP port (default `3000`) |
| `NODE_ENV` | no | `development` \| `production` \| `test` (default `development`) |
| `DATABASE_URL` | yes | SQLite URL, e.g. `file:./prisma/dev.db` |
| `JWT_SECRET` | yes | Secret used to sign/verify JWTs (min 8 chars) |
| `ADMIN_EMAIL` | no | When both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the first (admin) user is seeded on startup |
| `ADMIN_PASSWORD` | no | Initial password for the seeded admin user (min 6 chars) |

## Admin seed

On every startup the server checks for `ADMIN_EMAIL` + `ADMIN_PASSWORD` (`src/seed-admin.ts`). If both are set and no user with that email exists yet, it creates a user named **Admin** with the given credentials (bcrypt-hashed). This gives you a ready-to-use first account:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-123
```

## API reference

All routes under the auth boundary must send a token:

```
Authorization: Bearer <token>
```

The same token is also accepted as an `httpOnly` cookie named `token` (set at login).

### Response envelope

Success responses use `{ status: "success", ... }`. Errors use `{ status: "error", message: "..." }`. Schema validation errors use `{ message: "Invalid request data", errors: "..." }`.

---

### `POST /create-user` — Register a user (public)

Body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret1"
}
```

- `name` — required, non-empty string.
- `email` — required, valid email.
- `password` — required, min 6 characters.

Responses:

| Status | Body |
|---|---|
| `201` | `{ "status": "success", "message": "User created successfully." }` |
| `400` | Invalid request data (schema) |
| `409` | `{ "status": "error", "message": "Email already registered." }` |

The password is hashed with bcrypt (10 rounds) before storage. Never store plaintext.

---

### `POST /login` — Sign in (public)

Body:

```json
{ "email": "alice@example.com", "password": "secret1" }
```

Responses:

| Status | Body |
|---|---|
| `200` | `{ "status": "success", "data": { "id", "name", "email", "createdAt", "updatedAt" }, "token": "<jwt>" }` |
| `400` | Invalid request data (schema) |
| `401` | `{ "status": "error", "message": "Invalid email or password." }` |

The JWT payload is `{ "id": "<user id>" }`, expires in 1 hour. A `token` cookie is also set (`httpOnly`, `sameSite: strict`, `secure` in production). The password hash is never returned.

---

### `GET /users` — List users (auth required)

Query parameters (all optional): `id`, `name`, `email`. Invalid query values are ignored (filter omitted).

| Status | Body |
|---|---|
| `200` | `{ "status": "success", "data": [ { "id", "name", "email", "createdAt", "updatedAt" }, ... ] }` |
| `401` | Missing/invalid token |

---

### `GET /users/me` — Current user (auth required)

| Status | Body |
|---|---|
| `200` | `{ "status": "success", "data": { "id", "name", "email", "createdAt", "updatedAt" } }` |
| `401` | Missing/invalid token |

---

### `PUT /users/:id` — Update a user (auth required)

Body (at least one field):

```json
{ "name": "Alice Updated", "email": "alice@example.com", "password": "newpass1" }
```

All fields optional; `password` is re-hashed when provided.

| Status | Body |
|---|---|
| `200` | `{ "status": "success", "message": "User updated successfully." }` |
| `400` | Invalid data, or `{ "message": "Nothing to update." }` |
| `401` | Missing/invalid token, or not a valid user |
| `403` | `{ "status": "error", "message": "You can only update your own account." }` |
| `409` | `{ "status": "error", "message": "Email already registered." }` |

---

### `DELETE /users/:id` — Delete a user (auth required)

| Status | Body |
|---|---|
| `200` | `{ "status": "success", "message": "User deleted successfully." }` |
| `401` | Missing/invalid token, or not a valid user |
| `403` | `{ "status": "error", "message": "You can only delete your own account." }` |

---

## Authentication

`src/middlewares/validate-token.ts` verifies the JWT and attaches the user id to the request:

```typescript
export interface IAuthRequest extends Request {
    userId?: string;
}
```

- Reads the token from `Authorization: Bearer <token>` or from the `token` cookie.
- On failure returns `401 { status: "error", message: "No token provided." }` or `"Invalid or expired token."`.
- Controllers read the authenticated id from `req.userId`.

## Services

Rules:

1. **Constructor injection only** — no direct imports of repository instances.
2. **No `req` / `res`** — services are framework-agnostic.
3. **One use case per service**.
4. **Logging** — `logger.info` at entry/exit, `logger.warn` for guard clauses, `logger.error` in catch blocks.

| Service | Responsibility |
|---|---|
| `CreateUserService` | Reject duplicate emails, hash password, insert user |
| `LoginUserService` | Look up by email, verify password, return user |
| `GetUserService` | Return a single user by id or throw `User not found.` |
| `FindUserService` | Return a filtered list of users |
| `UpdateUserService` | Verify caller, enforce self-only rule, re-hash password, update |
| `DeleteUserService` | Verify caller, enforce self-only rule, delete user |

## Repositories

| Interface | Implementation | Source |
|---|---|---|
| `IUserRepository` | `PrismaUserRepository` | SQLite via Prisma |
| `IPasswordHasher` | `BcryptPasswordHasher` | bcrypt (10 rounds) |

Both are instantiated once in `repositories/index.ts` and injected into services. The `IPasswordHasher` abstraction means switching to another algorithm (argon2, scrypt) requires a new implementation, not changes to services.

## Controllers

Controllers **parse → call → respond** and never log (HTTP logging is handled by Winston in development). They also map thrown service errors to HTTP status codes via a small message-based helper:

| Service message | HTTP status |
|---|---|
| `Invalid email or password.` / `You must be a valid user.` | `401` |
| `You can only update/delete your own account.` | `403` |
| `User not found.` | `404` |
| `Email already registered.` | `409` |
| `Nothing to update.` | `400` |
| anything else | `500` |

## Logging

Winston writes to the console plus `logs/combined.log` and `logs/error.log` (relative to the server working directory). Log lines include a timestamp in the local timezone, environment, level, and message.

## TypeScript

The server runs directly with Node's native type-stripping (`node --env-file .env src/server.ts`) and uses the `#src/*` import alias mapped in `tsconfig.json` (Node `imports` field) and `package.json`.

```sh
npx tsc --noEmit   # type-check without emitting
```