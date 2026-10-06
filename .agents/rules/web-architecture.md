# Web storefront architecture — `apps/web`

Customer-facing storefront: React 19 + Vite + TypeScript. This file walks through how
the app boots, how it talks to the backend, how auth and cart state are kept, and how
pages are composed. See `admin-architecture.md` for the separate backoffice app, and
[[writing-tests]] for the Playwright conventions used here.

## 1. Boot sequence

`main.tsx` mounts `App.tsx`, which nests three providers in a fixed order:

```
QueryClientProvider (TanStack Query, staleTime 30s, retry 1)
  └─ AuthProvider (apps/web/src/providers/auth-provider.tsx)
       └─ RouterProvider (apps/web/src/router.tsx)
```

## 2. Routing

`router.tsx` is a flat `createBrowserRouter` table — every route is wrapped in the same
`AppLayout` via a `withLayout()` helper, so there's no separate "shell" component to
hunt for. Routes: `/`, `/explore`, `/chef/:id`, `/checkout`, `/login`, `/register`,
`/orders`, `/orders/success`, `/orders/failed`, `/tracking/:number`, and a catch-all
(`*`) that redirects to `/`. One React Router instance for the whole app — there's no
nested/admin-style route tree here.

## 3. Talking to the backend

Two layers:
- **`api/client.ts`** — a thin `fetch` wrapper (`apiClient.get`/`.post`). Base URL
  resolution: explicit `VITE_API_BASE_URL` wins; otherwise dev defaults to
  `http://localhost:8081`, and production defaults to `""` (relative `/api/...` calls),
  because the backend serves this SPA from the same origin in prod (see the root
  CLAUDE.md's "Single-origin deployment"). A bare host with no scheme gets `https://`
  prepended automatically. Every request gets `Authorization: Bearer <token>` attached
  automatically if a token is stored (step 4). A `401` specifically on an `/api/customer`
  path clears stored auth — other 401s (e.g. a stale order lookup) do not log the user out.
- **`api/foodme.ts`** — the actual endpoint list (`foodmeApi.getActiveChefs`,
  `.getChefById`, `.createOrder`, `.login`, `.getMe`, `.getMyOrders`, ...). Add new
  backend calls here, not inline in components.

## 4. Auth state

Two files, two different jobs — don't confuse them:
- **`lib/auth-storage.ts`** is the actual persistence: `localStorage` key
  `foodme.customer.auth` holding `{ token, customer }`, plus a custom
  `foodme-auth-changed` window event fired on every write/clear so multiple
  components (and multiple tabs, via the native `storage` event) stay in sync without
  prop drilling.
- **`providers/auth-provider.tsx`** is the React context built on top of that storage:
  exposes `customer`, `token`, `isAuthenticated`, `login`, `register`, `logout`. On
  mount, and whenever the token changes, it re-fetches `/api/customer/me` to refresh the
  cached profile, and clears storage if that comes back `401`.
- **`lib/auth-next.ts`** (`safeAuthNext`) is unrelated to storage — it's a post-login
  redirect-target sanitizer (rejects `//`-prefixed or non-local paths, defaults to
  `/orders`) used wherever login/register redirects somewhere other than home.

## 5. Cart: client-side only, no backend round-trip until checkout

The cart is **not** server state — it's a Dexie (IndexedDB) table, so it survives
reloads without requiring an account:
- **`lib/db.ts`**: one Dexie database (`FoodMeCart`), one table `products` keyed by a
  synthetic `uid` (`"<chefId>-<dishId>-<sortedAdditionIds>"`), indexed on `chefId`.
- **`hooks/useCart.ts`** (`addDishToCart`, `incrementCartItem`, `decrementCartItem`,
  `removeCartItem`, `clearCart`, plus the `useCart()` live-query hook) owns every cart
  business rule:
  - **Single-chef cart**: adding a dish from a different chef than what's already in the
    cart returns `"mismatch"` unless the caller passes `replaceOtherChef: true`, in which
    case the cart is cleared first.
  - **Minimum order quantity**: a dish's `minimumOrderCount` is enforced as a floor on
    the line's quantity when first added.
  - **Decrement-to-removal**: decrementing a line at its minimum quantity **deletes** the
    line rather than going below the minimum. This exact rule was the subject of a real
    bug/fix/revert cycle in this repo's history (`FM-BUG-07` / `KAN-4`, see
    `apps/web/e2e/cart-decrement.spec.ts`) — if you touch this function, re-run that spec.
  - Additions (extras on a dish) are folded into the line's `uid` and `price`, so the same
    dish with different additions is a distinct cart line.

## 6. Pages and composition

- `pages/<Name>/` — one directory per route (`Home`, `Explore`, `Chef`, `Checkout`,
  `Login`, `Register`, `Orders`, `OrderStatus`, `Tracking`).
- `components/ui` — shadcn/radix-based primitives (buttons, dialogs, tabs, etc.);
  `components/sections` / `components/layout` — larger page-composition blocks built
  from those primitives. Prefer composing existing `ui/` primitives over adding new
  one-off styled elements.
- Path alias `@/*` → `src/*` (`vite.config.ts` / `tsconfig.app.json`) — always import via
  `@/...`, not relative `../../` chains.

## 7. Forms and i18n

- Forms use `react-hook-form` with `zod` schemas from `schemas/` for validation — add a
  new schema there rather than hand-rolling validation in a component.
- i18n is `i18next` + `i18next-browser-languagedetector`, configured in `lib/i18n.ts`,
  strings in `locales/en` (currently the only populated locale despite the backend
  carrying `_am`/`_ru` fields throughout).

## 8. Testing

No unit-test framework here (no Vitest/Jest) — all coverage is Playwright E2E in
`apps/web/e2e`. See [[writing-tests]] for conventions (locator style, `e2e/auth.ts`
helpers, the `FM-BUG-*`/`FM-FLAKE-*` comment convention) before adding a spec.
