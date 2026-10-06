# Admin backoffice architecture — `apps/admin`

Admin-facing backoffice: React 18 + `react-admin` + MUI, plain JavaScript (no
TypeScript). This file walks through how the app boots, how `react-admin` is wired to
this specific backend, and how auth works. See `web-architecture.md` for the separate
customer storefront, and [[writing-tests]] for the Playwright conventions used here.

## 1. This is a `react-admin` app, not a hand-rolled SPA

`App.jsx` renders a single `<Admin>` from `react-admin` and declares three `<Resource>`s
— `orders`, `chefs`, `dishes` — each pointing at a plain React component for its
`list`/`edit`/`show`. **`react-admin` owns routing, data fetching, and auth UI** via two
injected providers (`dataProvider`, `authProvider`) — there is no separate router setup
or manual fetch-in-`useEffect` pattern to look for; everything flows through those two
providers plus whatever each resource page declares.

`<Admin requireAuth>` means every resource route is gated by `authProvider.checkAuth`
automatically — `security/ProtectedRoute.jsx` and `security/GuestRoute.jsx` exist in the
codebase but **are not wired into `App.jsx`**; `react-admin`'s own auth gate supersedes
them. Don't assume they're on the active code path.

`<Admin>` uses the default **hash router** (`/backoffice/#/login`, `/backoffice/#/chefs`,
...) deliberately — no `basename` prop, because `react-admin` only honors `basename`
with an externally-supplied `BrowserRouter`, and the Vite `base: "/backoffice/"` build
output is served as a static SPA shell (see the root CLAUDE.md's "Single-origin
deployment" / `SpaWebConfig`), so hash routing avoids needing any server-side route
handling for deep links.

## 2. The two providers are the entire backend integration

- **`providers/dataProvider.js`** — translates every `react-admin` CRUD call into this
  specific backend's admin REST shape:
  - Resource name → path: `orders → /order`, `chefs → /chef`, `dishes → /dish`
    (`react-admin` resource names are plural; backend paths are singular — see
    `RESOURCE_TO_PATH`).
  - `getList`/`getManyReference`: converts `react-admin`'s 1-based `page`/`perPage` to
    the backend's 0-based `page`/`size`, and unwraps the backend's `{ list, count }`
    response into `react-admin`'s expected `{ data, total }` — **this exact shape
    contract** is why `AdminListResponseDto` on the backend can't be casually renamed
    (see `backend-architecture.md` step 6). Client-side sort is applied in JS after
    fetching, since the backend doesn't accept a sort param.
  - `getOne`/`update`: straight passthrough to `GET`/`PUT /admin/<resource>/<id>`.
  - `create`, `delete`, `deleteMany`, `updateMany` all **throw** — not implemented,
    because the backend has no matching endpoints. Don't add "create chef" UI without
    first adding the backend endpoint.
- **`providers/authProvider.js`** — thin wrapper over `localStorage` (`token`,
  `username`, `role`) and `api/auth-api.js`'s `loginRequest`. `getPermissions()` returns
  the raw `role` string from storage, for any future role-gated UI.

## 3. HTTP layer (`api/base-api.js`)

A single `axios` instance (`BaseApi`) used by `dataProvider`/`authProvider`/the
per-resource `*-api.js` files:
- Base URL resolution mirrors the storefront's: explicit `VITE_API_BASE_URL` wins,
  dev defaults to `http://localhost:8081`, prod defaults to `""` (same-origin). A bare
  host gets `https://` prepended.
- Request interceptor attaches `Authorization: Bearer <token>` from `localStorage` to
  every call.
- Response interceptor unwraps Axios's `response.data` automatically (so callers get
  the JSON body directly, not an Axios envelope) and, on any `401`, clears the three
  `localStorage` auth keys and hard-redirects to the login route (respecting the Vite
  `BASE_URL`, e.g. `/backoffice/login`) if not already there.
- The exported `api` helper (`api.get`/`.post`/`.put`/`.patch`/`.delete`) prefixes every
  call with `/admin` — callers pass `/chef`, not `/admin/chef`.

## 4. Resource pages

Each resource's `list`/`edit`/`show` component is a declarative `react-admin` UI built
from its field components (`<List><Datagrid><TextField>...`, `<SimpleForm><TextInput>...`,
etc.) — see `pages/chefs/ChefList.jsx` for the pattern (filters via `SearchInput`,
clickable rows via `Datagrid`'s `rowClick="edit"`, formatted currency fields via
`NumberField`'s `options`). There's no custom list/table/pagination code to maintain;
extending a resource page means adding/removing `react-admin` field components, not
writing fetch logic.

- `layout/AppLayout.jsx` — the shared chrome (nav, app bar) passed to `<Admin layout={...}>`.
- `theme/theme.js` — the MUI theme passed to `<Admin theme={...}>`.
- `pages/LoginPage.jsx` / `pages/Dashboard.jsx` — passed to `<Admin loginPage={...}
  dashboard={...}>`, replacing `react-admin`'s defaults.
- `notistack`'s `<SnackbarProvider>` wraps the whole `<Admin>` tree for toast
  notifications.

## 5. Testing

No unit-test framework here either — coverage is Playwright E2E in `apps/admin/e2e`
(`admin-flows.spec.ts`), run against the real dev server on `:5174`. See
[[writing-tests]] for conventions shared with the storefront's E2E suite.
