# Frontend

React 19 + React Router 7 + Vite + TypeScript + CSS Modules + lucide-react.

## Folder structure

```
web/src/
├── main.tsx                 # ReactDOM entry point — renders <Router />
├── router.tsx               # Route definitions + guards + providers
├── contexts/
│   ├── auth-context.tsx     # Global auth state (user, login, logout)
│   └── toast-context.tsx    # Global toast notifications (useToast)
├── services/
│   └── api.ts               # HTTP client (fetch wrapper)
├── types/
│   └── user.ts              # IUser and payload types
├── components/
│   ├── app-shell/           # Responsive dashboard layout (sidebar + topbar + Outlet)
│   └── ui/
│       ├── avatar/          # Initials avatar (color derived from name)
│       ├── badge/           # Small pill (default / success / warning / danger)
│       ├── button/          # index.tsx + index.module.css
│       ├── input/           # index.tsx + index.module.css
│       ├── modal/           # index.tsx + index.module.css
│       ├── password-input/  # index.tsx + index.module.css
│       ├── skeleton/        # Shimmer loading placeholder
│       ├── stat-card/       # Metric card with icon + label + value
│       └── toast/           # Toast notification item
├── pages/
│   ├── login/               # index.tsx + index.module.css
│   └── users/               # index.tsx + index.module.css
└── assets/
    ├── fonts/rubik/         # Rubik font files
    └── styles/global.css    # Fonts + CSS custom properties + reset
```

Rules:

- All folders and files are **lowercase kebab-case**.
- Each component/page has `index.tsx` plus `index.module.css` (CSS Modules).
- `index.tsx` files default-export the component.

## Entry point

`main.tsx` mounts the router:

```tsx
createRoot(document.getElementById("root")!).render(<Router />);
```

`Router` (`router.tsx`) composes the providers and the route tree:

```tsx
<AuthProvider>
    <ToastProvider>
        <RouterProvider router={router} />
    </ToastProvider>
</AuthProvider>
```

## Routing and guards

Routes are defined with `createBrowserRouter` using a **layout route** for the dashboard chrome:

| Path | Guard | Element |
|---|---|---|
| `/login` | `PublicOnlyRoute` | Login page (redirects to `/users` if signed in) |
| `/users` | `PrivateRoute` → `AppShell` | Users management page |

```tsx
{
    element: <PrivateRoute><AppShell /></PrivateRoute>,
    children: [
        { path: "/users", element: <Users /> },
    ],
}
```

- `PrivateRoute` — redirects to `/login` when not signed in; shows a loading state while the session is revalidated.
- `PublicOnlyRoute` — redirects signed-in users away from `/login`.
- `AppShell` renders the sidebar/topbar chrome and an `<Outlet />` for the nested page.

## Auth context

`contexts/auth-context.tsx` exposes:

```typescript
interface IAuthContextData {
    user: IUser | null;                       // current signed-in user (no password)
    signed: boolean;
    loading: boolean;                         // true while restoring the session
    login: (payload: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}
```

Behaviors:

- `user` and `token` are persisted in `localStorage` (`user` and `token` keys).
- On mount, if a token exists it calls `GET /users/me` to restore the session; on failure it logs out.
- Listens for the `unauthorized` window event (dispatched by the API client on 401) and logs out automatically.
- `login` calls `POST /login`, stores the returned token + user, and updates state.

Consume it with `useAuth()` — it throws if used outside `AuthProvider`.

## API client

`services/api.ts` wraps `fetch`:

- Base URL: `import.meta.env.VITE_API_URL` or defaults to `http://localhost:3000`.
- Injects `Authorization: Bearer <token>` from `localStorage` when present.
- On a `401` response, dispatches the `unauthorized` event (triggers logout) and throws `Session expired.`.
- Parses the error envelope and throws `Error(body.message)`.

```typescript
export const api = {
    get:  <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
    post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put:  <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    del:  <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
```

> `VITE_API_URL` is baked in at **build time**. Changing it requires a rebuild (or set it before `vite dev`).

## App shell

`components/app-shell/` provides the authenticated layout:

- **Desktop (≥1024px):** sticky sidebar with the brand, a nav list (`NavLink` to `/users`), and a footer with the signed-in user card and sign-out button. The top bar is hidden.
- **Mobile/tablet (<1024px):** the sidebar becomes an off-canvas drawer opened from a top bar hamburger, with a blurred backdrop.
- Content renders through `<Outlet />`, centered with a max width.

## Toast notifications

`contexts/toast-context.tsx` exposes `useToast()`:

```typescript
const { toast } = useToast();
toast('User created successfully.');        // tone: 'success' | 'error' | 'info'
```

Toasts auto-dismiss after ~3.8s, stack bottom-right on desktop and bottom-full-width on mobile, and are rendered by `components/ui/toast/`.

## Login page

`pages/login/`:

- Split layout on desktop (brand panel with feature highlights + a centered form card); single-column with the panel hidden on mobile.
- Email + password inputs with labels, a password visibility toggle, and inline server-error banner.
- Calls `login()` from the auth context, then navigates to `/users`.
- Shows a loading spinner on the submit button while signing in.

## Users page

`pages/users/` is the user management screen:

- Page header with title, description, and `Refresh` / `New user` actions.
- Three stat cards: total users, signed-in account, account email.
- A responsive table (name + avatar, email, created date, actions) that becomes **stacked cards on mobile** (each `td` carries a `data-label` used by a `::before` pseudo-element).
- The current user's row is highlighted with a `you` badge; edit/delete actions are enabled only for that row (the server enforces the same rule with `403`).
- Loading state uses shimmer skeletons; empty state shows an illustration-style block with a call-to-action.
- Create/edit and delete flows use modals; every mutation reports back through a toast.

## Components

All components live in `components/ui/<name>/`.

| Component | Purpose |
|---|---|
| `button` | Primary / secondary / ghost / danger variants; `sm`/`md` sizes; optional icons, `fullWidth`, and `loading` spinner |
| `input` | Text input with optional `label`, `error`, and side icons |
| `password-input` | Input with lock icon and show/hide toggle |
| `modal` | Dialog with animated backdrop, ESC-to-close, body scroll lock, `footer` slot; bottom sheet on mobile |
| `avatar` | Initials avatar with a deterministic color from the name |
| `badge` | Pill label with semantic tones |
| `skeleton` | Shimmer placeholder |
| `stat-card` | Metric card with icon, value, and label |
| `toast` | Notification item (used by the toast context) |

## Styling

Global tokens live in `assets/styles/global.css` — a dark, modern design system:

```css
:root {
    --bg: #0b0d13;
    --surface: #12151f;
    --border: #232a3a;
    --text: #e9ecf3;
    --primary: #7c6cf6;
    --success: #34d399;
    --danger: #f87171;
    --radius-sm: 8px;
    --transition: 160ms ease;
}
```

Pages and components use CSS Modules (`index.module.css`) with these tokens. Adjust the brand and surface colors by editing the variables in `global.css`.

## Running

```sh
cd web
npm install
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # tsc && vite build → dist/
npm run preview   # preview the production build
```

The dev server proxies nothing; the API client talks directly to the server (CORS is enabled on the backend).