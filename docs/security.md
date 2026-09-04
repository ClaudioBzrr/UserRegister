# Security

How credentials and access control are handled in User Register.

## Password storage

- Passwords are hashed with **bcrypt**, 10 salt rounds (`BcryptPasswordHasher`).
- Hashing is abstracted behind the `IPasswordHasher` interface so the algorithm can be swapped (argon2, scrypt) without touching services.
- Hashes are never returned by the API. Every controller response strips the `password` field (see `toSafeUser` in `user-controller.ts`).
- Login only ever compares against the stored hash; plaintext passwords never leave the request body.

## Authentication (JWT)

- On successful login the server signs a JWT with `JWT_SECRET`:
  - payload: `{ id: "<user id>" }`
  - expiry: 1 hour (`expiresIn: "1h"`)
- The token is delivered in two ways:
  1. In the response body (`token` field) — the web app stores it in `localStorage` and sends it as `Authorization: Bearer <token>`.
  2. As an `httpOnly` cookie (`token`), `sameSite: strict`, `secure` only in production.
- `validateToken` middleware accepts either form, verifies the signature, and attaches `userId` to the request.
- Invalid/expired/missing tokens → `401`.

## Authorization rules

The application uses an **ownership model**:

- Any signed-in user may list users (`GET /users`) and read their own profile (`GET /users/me`).
- A user may **only update or delete their own account**. The check happens in the service, not the controller:

  ```
  UpdateUserService / DeleteUserService
    → find caller by authId (401 if invalid)
    → id !== authUser.id  →  throw "You can only ... your own account." (403)
  ```

- The frontend mirrors this by disabling edit/delete on other users' rows, but the server is the source of truth — the UI can never bypass the check.

### Route boundary

| Group | Routes | Requires JWT |
|---|---|---|
| Public | `POST /create-user`, `POST /login` | no |
| Protected | `GET /users`, `GET /users/me`, `PUT /users/:id`, `DELETE /users/:id` | yes |

The boundary is enforced by mount order in `server/src/routes/index.ts`: public router first, then the auth-protected router.

## Input validation

- Every request body is validated with **Zod** before reaching the controller (`validSchema` middleware):
  - `POST /create-user` → `createUserPayload`
  - `POST /login` → `loginUserPayload`
  - `PUT /users/:id` → `updateUserPayload`
  - `GET /users` query → `filterUserPayload` (parsed safely; invalid values are dropped)
- Schemas are strict (`.strict()`), so unknown fields are rejected.
- Email uniqueness is checked in `CreateUserService` and `UpdateUserService` (409 on conflict).

## Error handling and information disclosure

- Generic errors return `500` without leaking stack traces or internals.
- Service messages are deliberately specific for common cases (invalid credentials, duplicate email, ownership violations) and are mapped to the appropriate status code by the controller.

## Session invalidation on the client

- The API client listens for `401` responses and dispatches an `unauthorized` window event.
- `AuthProvider` reacts by clearing `localStorage` and setting the user to `null`, which causes `PrivateRoute` to redirect to `/login`.
- Deleting your own account also logs the client out.

## Recommendations for production hardening

- Use a long, random `JWT_SECRET` (store it in a secrets manager, never in the repository).
- Serve over HTTPS and set `NODE_ENV=production` (this flags the cookie `secure`).
- Add rate limiting on `/login` and `/create-user` to slow brute-force attempts.
- Consider account lockout or exponential backoff after repeated failed logins.
- Introduce a role/permission model (e.g., `admin`) if account management should be delegated beyond self-service.
- If deploying multiple server instances, replace SQLite with PostgreSQL; the repository layer already isolates data access to a single implementation.