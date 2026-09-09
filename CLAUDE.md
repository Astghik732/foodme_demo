# FoodMe

FoodMe is a small food-ordering app: customers browse chefs, view a chef's
menu, build a cart, and check out with cash on delivery. There is also a
back-office admin app for managing chefs, dishes, and orders. This repo is a
known-imperfect training target used in a QA course — see the root
`README.md` for the full warning before running or deploying it anywhere.

## Layout

```
apps/
  backend/   Spring Boot 3 (Java 17, Gradle) — REST API + admin API
  web/       React 18 + Vite + TypeScript — customer storefront
  admin/     React 18 + Vite (JavaScript) + react-admin — back office
docs/
  api-contract.md      frozen request/response shapes — read before changing any endpoint
  requirements/         product specs, one per storefront feature
  runbook.md             operator guide for the supporting infra
qa/
  tickets/    sample issue tracker tickets
  xray/       sample manual test repository
  mcp/        MCP server config templates
infra/        docker-compose.yml and service configuration
```

## Running things

Full stack (Postgres + backend + both frontends):

```bash
docker compose -f infra/docker-compose.yml --profile core up -d
```

Backend alone, for local iteration:

```bash
cd apps/backend
./gradlew bootRun
```

Storefront:

```bash
cd apps/web
npm ci
npm run dev
```

Admin app:

```bash
cd apps/admin
npm ci
npm run dev
```

Ports: backend `8081`, storefront `3000`, admin `3001`, Postgres `5432`.

## Tests

```bash
cd apps/backend && ./gradlew test          # JUnit + MockMvc
cd apps/web && npm run test:e2e            # Playwright, needs the stack running
```

Backend tests use `application-test.properties` against a disposable schema —
they do not need Docker running, only a reachable Postgres instance (see that
file for connection settings).

## API contract

`docs/api-contract.md` is authoritative for every `/api/**` and `/admin/**`
path, request body, and response shape. It is frozen: field names and URL
paths are inherited from the product this app is modeled on and must not be
renamed, even where they look inconsistent (e.g. `nameHy`, mixed camelCase
across DTOs). If a change to the contract is genuinely needed, update
`docs/api-contract.md` in the same change as the code.

## Code conventions

- **Backend** — package-by-layer under `am.foodme.backend`: `model/`, `dto/`,
  `repository/`, `service/`, `controller/api/` (public), `controller/admin/`
  (JWT-protected), `security/`, `exceptionHandler/`. Entities are plain JPA;
  DTOs are separate classes, never entities returned directly from a
  controller. Flyway migrations under `src/main/resources/db/migration`,
  numbered sequentially (`V1__`, `V2__`, ...) — never edit an already-applied
  migration, add a new one.
- **Storefront** — functional components, TanStack Query for server state,
  Dexie (IndexedDB) for the client-side cart. Tailwind for styling.
- **Admin** — react-admin resources and a thin `dataProvider` adapting the
  backend's `{list, count}` shape to react-admin's expected format. Axios
  modules under `src/api/` mirror one backend resource each.
- Money values are numbers (not strings) in every DTO and are always computed
  server-side; never trust a price sent from a client.
- Translation-bearing fields keep the `[{lang, value}]` array shape used by
  the API contract, even in single-language UI.

## Known-imperfect training target

This codebase is used to teach testing and QA practices with AI agents, so it
intentionally is not production-quality: some behavior is buggy, some
security practices are weak, and the test suite is small on purpose. Treat
anything you find here with the same scrutiny you'd bring to a real
codebase — don't assume existing code or existing tests are correct just
because they're already there.
