# Architecture

The application follows a strict five-layer pattern on the backend and a provider/guard pattern on the frontend. No layer may skip or bypass the next one.

## Layer chain

Every HTTP request travels through the same chain:

```
Route → Controller → Service → Repository (interface) → Implementation
```

| Layer | Owns | Must NOT own |
|---|---|---|
| **Route** | HTTP path, middleware stacking (validation, auth) | Business logic, response formatting |
| **Controller** | Parse `req.body` / `req.params` / `req.query`, call a service, return status + JSON | Business logic, direct database access, logging |
| **Service** | All business logic, orchestration, validation, logging | `req` / `res` objects, HTTP concerns |
| **Repository (interface)** | Contract (method signatures, return types) | Implementation details |
| **Implementation** | Actual data access (Prisma, bcrypt) | Business logic |

### Example: login flow

```
1. Route        POST /login  →  validSchema(loginUserPayload), UserController.login
2. Controller   const data = req.body → LoginUserService.exec(data) → res.status(200).json(result)
3. Service      userRepository.findOne({ email }) → passwordHasher.compare(...) → returns user
4. Repository   PrismaUserRepository.findOne({ email }) → prisma.user.findFirst({ where: { email } })
5. Implementation  Prisma Client → SQLite
```

## Manual dependency injection

There is no DI framework. All wiring happens in **`server/src/repositories/index.ts`**:

```typescript
export const userRepository = new PrismaUserRepository();
export const passwordHasher = new BcryptPasswordHasher();
```

Services receive their dependencies through the constructor. This keeps services framework-agnostic and makes testing trivial — swap real implementations for mocks at construction time:

```typescript
export class LoginUserService {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher
    ) {}
}
```

Because **services never import repository instances directly**, `CreateUserService`, `LoginUserService`, `UpdateUserService`, and `DeleteUserService` all depend on the `IUserRepository` interface, and password operations depend on the `IPasswordHasher` interface rather than on `bcrypt` directly.

### Adding a new repository

1. Define the interface in `server/src/types/repositories/`.
2. Create the implementation in `server/src/repositories/<source>/`.
3. Instantiate and export it in `server/src/repositories/index.ts`, typed by the interface.
4. Inject it into any service that needs it.

## Route mounting order

Route order is critical because it defines the **authentication boundary**. Anything mounted before the auth router is public:

```typescript
// server/src/routes/index.ts
export const routes = Router();

// 1. Public — no authentication
routes.use(publicUserRouter);   // POST /create-user, POST /login

// 2. Global auth — every route after this requires a valid JWT
routes.use(authUserRouter);     // GET /users, GET /users/me, PUT /users/:id, DELETE /users/:id
```

The `authUserRouter` applies `validateToken` at its own router level, so all of its routes require a JWT.

## Request flow (update example)

```
Browser (Users page)
  → PUT /users/:id  (Authorization: Bearer <token>)
    → routes/index.ts → authUserRouter (validateToken → userId attached to request)
      → UserController.update
        → UpdateUserService.exec({ authId, id, data })
          → userRepository.findOne({ id: authId })   // is the caller valid?
          → userRepository.update({ filter: { id }, data })   // password hashed first
            → prisma.user.updateMany({ where: { id }, data })
  → 200 { status: "success", message: "User updated successfully." }
```

## Frontend flow

The frontend mirrors the layering:

```
Page → Auth Context (state) → API client → Server
```

- `AuthProvider` holds the signed-in user and revalidates it against `GET /users/me` on reload.
- The API client injects `Authorization: Bearer <token>` from `localStorage` and dispatches an `unauthorized` event on 401, which triggers automatic logout.
- Route guards (`PrivateRoute`, `PublicOnlyRoute`) decide which pages render based on auth state.

## Frontend provider tree

Provider order matters — consumers must be nested inside their providers:

```tsx
// web/src/router.tsx
<AuthProvider>
    <RouterProvider router={router} />
</AuthProvider>
```

`RouterProvider` renders the route tree; guards call `useAuth()` to read the current session.

## Summary

- **Backend:** strict layer chain, constructor DI, public-vs-protected route boundary.
- **Frontend:** global auth state via context, guard-wrapped routes, single API client.
- **Both:** TypeScript end to end; the path alias `#src/*` (server) and relative imports (web) keep imports explicit.