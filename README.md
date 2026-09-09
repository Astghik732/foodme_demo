# FoodMe

> ## ⚠️ Training target — deliberately defective and deliberately insecure
>
> FoodMe is a **teaching artifact**, built as the System Under Test for a
> course on agentic QA. It contains intentional functional bugs and
> intentional security vulnerabilities, planted on purpose so that students
> have real things to find. Seed data also contains sample text designed to
> look like untrusted user content an AI agent might be pointed at.
>
> **Do not deploy FoodMe anywhere public. Do not expose it to the internet.
> Do not reuse any of its code, dependencies, or configuration in a real
> product.** Run it only on `localhost` or inside an isolated lab network.

## What this is

FoodMe is a minimal food-ordering web app: a storefront where a customer
browses chefs, opens a chef's page, adds dishes to a cart, and checks out with
cash on delivery. It ships with a small back-office admin app for managing
chefs, dishes, and orders.

It supports exactly one user flow, end to end:

**list of chefs → chef page + menu → cart → cash-only checkout**

Everything else — accounts, card payments, delivery maps, promotions — is out
of scope by design. The point of FoodMe is not feature completeness; it's a
small, realistic surface with real bugs and real security gaps for a QA
course to work against.

## Architecture

| Component | Tech | Port |
|---|---|---|
| Backend API | Spring Boot 3 / Java 17 | `8081` |
| Storefront (web) | React 18 / Vite | `3000` |
| Back office (admin) | React 18 / react-admin | `3001` |
| Database | PostgreSQL 16 | `5432` |
| Grafana | dashboards | `3002` |
| Prometheus | metrics | `9090` |
| Loki | logs | `3100` |
| GlitchTip | error tracking (Sentry-compatible) | `8000` |
| Jenkins | self-hosted CI | `8080` |

The backend exposes a public, unauthenticated `/api/**` for the storefront and
a JWT-protected `/admin/**` for the back office. The frontend talks to
`/api/**` only; the admin app talks to `/admin/**` only. See
[`docs/api-contract.md`](docs/api-contract.md) for the frozen request/response
shapes.

## Quickstart

Requires Docker and Docker Compose.

```bash
git clone <this-repo>
cd foodme_demo
cp .env.example .env
docker compose -f infra/docker-compose.yml --profile core up -d
```

This starts Postgres, the backend, the storefront, and the admin app. Give the
backend a few seconds to run its migrations, then:

- Storefront: <http://localhost:3000>
- Admin back office: <http://localhost:3001>
- API: <http://localhost:8081> (`/actuator/health`, `/swagger-ui.html`)

To also bring up observability (Grafana/Prometheus/Loki/GlitchTip) or the
self-hosted Jenkins, add the matching profile:

```bash
docker compose -f infra/docker-compose.yml --profile core --profile observability --profile ci up -d
```

To stop everything:

```bash
docker compose -f infra/docker-compose.yml --profile core --profile observability --profile ci down
```

## Seeded credentials

The database seeds one admin account for the back office:

| Field | Value |
|---|---|
| URL | <http://localhost:3001> |
| Username | `admin` |
| Password | `admin123` |

The storefront has no accounts — checkout is guest-only.

## Repo layout

```
foodme_demo/
  apps/
    backend/    Spring Boot API — chefs, dishes, orders, admin
    web/        React storefront
    admin/      React back office (react-admin)
  docs/
    api-contract.md       frozen request/response shapes
    requirements/         product specs for the storefront flow
    runbook.md             operator guide (instructor-facing)
  qa/
    tickets/    sample Jira tickets (Markdown + a Jira-importable CSV)
    xray/       starter Xray test repository
    mcp/        MCP server templates for Jira, Xray, Grafana, GitHub
  infra/        docker-compose.yml and per-service config
  .github/      CI workflows
```

## Running the test suites

```bash
# Backend (JUnit)
cd apps/backend && ./gradlew test

# Storefront and admin (lint + build)
cd apps/web && npm ci && npm run lint && npm run build
cd apps/admin && npm ci && npm run lint && npm run build

# End-to-end (Playwright, needs the stack running)
cd apps/web && npm run test:e2e
```

## Putting it on GitHub

These commands are for a human to run, not an agent — they create a real
remote and push real content.

1. Create the repository (adjust visibility and org/user as needed):

   ```bash
   gh repo create <org-or-user>/foodme-demo --public --source=. --remote=origin
   ```

2. Push the current branch:

   ```bash
   git push -u origin main
   ```

3. Add the `ANTHROPIC_API_KEY` secret used by the Claude PR-review GitHub
   Action:

   ```bash
   gh secret set ANTHROPIC_API_KEY --repo <org-or-user>/foodme-demo
   # paste the key when prompted, or:
   gh secret set ANTHROPIC_API_KEY --repo <org-or-user>/foodme-demo --body "sk-ant-..."
   ```

4. Confirm the workflow is present and enabled:

   ```bash
   gh workflow list --repo <org-or-user>/foodme-demo
   ```

5. Have students fork it:

   ```bash
   gh repo fork <org-or-user>/foodme-demo --clone
   ```

   Each student works in their own fork and opens pull requests back to it (or
   to their own fork's `main`, per your course setup) so the PR-review
   workflow has something to run against.
