# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project overview

FoodMe is a food-ordering demo: a customer storefront, an admin backoffice, and a Spring
Boot API, deployed as a single Docker image behind one origin (Render free tier) plus a
separate monitoring stack (Prometheus/Loki/Grafana on Render too). It's a teaching/workshop
repo — expect occasional intentionally-planted bugs in the history.

## Monorepo layout

- `apps/backend` — Spring Boot 3.3 (Java 17) REST API
- `apps/web` — customer storefront (React 19 + Vite + TypeScript)
- `apps/admin` — admin backoffice (React 18 + react-admin + MUI, JavaScript)
- `infra/monitoring` — Prometheus + Loki + Grafana, bundled into one Docker image (`infra/monitoring/stack`), deployed via `render-monitoring.yaml`

There is no root package manager / build tool tying the three apps together — each app
is built and run independently from its own directory.

## Commands

### Backend (`apps/backend`)

```
./gradlew build                                   # compile + test + assemble
./gradlew test                                     # run all tests (JUnit 5, H2 in-memory DB)
./gradlew test --tests "ChefControllerTest"        # run one test class
./gradlew test --tests "ChefControllerTest.someMethodName"  # run one test method
./gradlew bootRun                                  # run locally (needs Postgres, see below)
```

Running `bootRun` locally requires a reachable Postgres (`DB_HOST`/`DB_PORT`/`DB_NAME`/
`DB_USER`/`DB_PASSWORD`, defaults in `application.properties` point at
`localhost:5432/foodme` / `foodme`/`foodme`). Flyway migrations run automatically on
startup (`src/main/resources/db/migration`). Tests use the `test` profile
(`application-test.properties`) with an H2 in-memory DB and Flyway disabled, so `./gradlew
test` needs no database running.

### Web storefront (`apps/web`)

```
npm install
npm run dev          # Vite dev server
npm run build         # tsc -b && vite build
npm run lint          # oxlint
npm run test:e2e      # Playwright, starts its own dev server on :5180
npm run test:e2e:all  # this app's e2e suite, then admin's
```

Run a single Playwright test from `apps/web`: `npx playwright test e2e/<file>.spec.ts -g
"<test name>"`.

### Admin backoffice (`apps/admin`)

```
npm install
npm run dev          # Vite dev server on :5174 (strictPort)
npm run build
npm run lint          # eslint
npm run test:e2e      # Playwright, starts its own dev server on :5174
```

### CI

`.github/workflows/ci.yml` runs backend build+test, web lint+build, admin lint+build, an
e2e job (docker-compose + Playwright against `apps/web`), and a Docker image build for all
three apps. Note: the e2e job references `infra/docker-compose.yml`, which is not currently
checked in (removed in a prior cleanup commit) — that job will not run successfully as-is.

## Architecture

### Single-origin deployment

The backend Dockerfile (`apps/backend/Dockerfile`) is a multi-stage build that compiles
both frontend SPAs and copies their `dist/` output into the Spring Boot jar's
`static/` resources: the storefront at `static/` (served at `/`) and admin at
`static/backoffice/` (served at `/backoffice`). `SpaWebConfig` + its custom
`PathResourceResolver` decide, per request, whether to serve a static asset, fall back to
the storefront's `index.html`, or fall back to the admin's `index.html` — paths under
`api/`, `admin/`, `actuator/`, `swagger-ui`, `v3/` are explicitly excluded from the SPA
fallback since those are real `@RestController` / Actuator endpoints. In production there
is one origin, no CORS, and no separate frontend hosting; `docker build` context is the
repo root (`dockerContext: .` in `render.yaml`) specifically so the Dockerfile can reach
both `apps/web` and `apps/admin`.

Frontend Sentry DSNs are baked in at Docker build time via build args
(`VITE_SENTRY_DSN_WEB` / `VITE_SENTRY_DSN_ADMIN`), not read at runtime.

### Per-app architecture

Backend, web storefront, and admin backoffice each have their own detailed,
step-by-step architecture doc under `.agents/rules/` (symlinked at `.claude/rules/`) —
read the one for whatever you're touching:

- **`.agents/rules/backend-architecture.md`** — Spring Boot layering, the exact
  security filter-chain rule order, JWT verification, DTO conventions, data layer,
  error handling, observability, and a documented real bug in the admin chef-update
  path worth knowing about before touching entity-bound admin updates.
- **`.agents/rules/web-architecture.md`** — the customer storefront's boot sequence,
  API client, auth storage, the Dexie-backed cart's business rules (single-chef cart,
  minimum order quantity, decrement-to-removal), and page/forms/i18n conventions.
- **`.agents/rules/admin-architecture.md`** — the backoffice's `react-admin` wiring
  (`dataProvider`/`authProvider`, the `{list, count}` ↔ `{data, total}` shape contract
  with the backend, hash routing, and why `security/ProtectedRoute.jsx` /
  `GuestRoute.jsx` aren't actually on the active auth path).

### Monitoring stack (`infra/monitoring`)

Prometheus, Loki, and Grafana are bundled into a single Docker image
(`infra/monitoring/stack`, supervised by `supervisord`) and deployed as one Render service
via `render-monitoring.yaml`, separate from the app service. The two services are wired
together purely through public URLs and env vars after both are deployed (`BACKEND_HOST` on
the monitoring service; `LOKI_PUSH_URL` on the app service) — see `README.md` for the exact
steps. A Grafana MCP endpoint is exposed at `/mcp` on the monitoring service
(`infra/monitoring/README.md` has ready-to-paste client configs).
