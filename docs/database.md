# Database

Prisma 7 with SQLite (via the `better-sqlite3` adapter). Schema lives in `server/prisma/schema.prisma`.

## Data model

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

- `id` — UUID primary key.
- `email` — unique; used for login lookup and duplicate detection.
- `password` — bcrypt hash (never plaintext).
- `createdAt` / `updatedAt` — managed automatically by Prisma.

## SQLite specifics

The datasource URL is not stored in `schema.prisma`; it is provided by the environment through `prisma.config.ts`:

```typescript
// server/prisma.config.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
```

A typical dev value:

```
DATABASE_URL=file:./prisma/dev.db
```

The path is resolved relative to the `server/` directory, producing `server/prisma/dev.db`. The same environment variable is consumed at runtime by the adapter in `src/lib/prisma.ts`.

## Client singleton

`src/lib/prisma.ts` exports a single `PrismaClient` instance:

```typescript
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "#src/generated/prisma/client.ts";

const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

Never instantiate another `PrismaClient`.

## Migrations

Migrations are tracked in `server/prisma/migrations/`.

### After any schema change

```sh
cd server
npx prisma migrate dev   # create and apply the next migration
npx prisma generate      # regenerate the client (mandatory)
```

`prisma generate` outputs the client to `server/src/generated/prisma`, which is gitignored — it must be regenerated on every fresh checkout (or after `npm install`).

Never edit the database directly, and never skip `prisma generate`.

## Repository access

Feature code never touches Prisma directly. All data access goes through the `IUserRepository` interface:

```typescript
// server/src/types/repositories/user-repository.ts
export interface IUserRepository extends IRepository<IUser> {}
```

`IRepository<T>` defines `create`, `findOne`, `findMany`, `update`, and `delete` with filters that automatically exclude sensitive fields (`password`) and DB-generated defaults (`id`, `createdAt`, `updatedAt`).

The Prisma implementation (`repositories/prisma/prisma-user-repository.ts`) maps each method to a Prisma call:

| Repository method | Prisma call |
|---|---|
| `create(data)` | `prisma.user.create({ data })` |
| `findOne(filter)` | `prisma.user.findFirst({ where: filter })` |
| `findMany(filter?)` | `prisma.user.findMany({ where: filter })` / `findMany()` |
| `update({ filter, data })` | `prisma.user.updateMany({ where: filter, data })` |
| `delete(filter)` | `prisma.user.deleteMany({ where: filter })` |

## Seeding (development)

There is no seed script. For local development, register users through the API:

```sh
curl -X POST http://localhost:3000/create-user \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"secret1"}'
```

Or use the **New user** button on the Users page.