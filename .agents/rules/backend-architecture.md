# Backend architecture — `apps/backend`

Spring Boot 3.3 / Java 17 REST API. This file walks through the backend layer step by
step: how a request enters, how it's authenticated, how it's routed, how it's handled,
and how data and observability are wired underneath. Read [[writing-tests]] before
adding or changing tests here.

## 1. Entry point and profiles

- `FoodmeBackendApplication` is the Spring Boot entry point. Server port is
  `${PORT:8081}` (Render sets `PORT`; local/docker default to 8081).
- Three profiles matter:
  - default (`application.properties`) — Postgres via `DB_HOST`/`DB_PORT`/`DB_NAME`/
    `DB_USER`/`DB_PASSWORD`, or a single `DATABASE_URL`/`SPRING_DATASOURCE_URL` (see
    step 7). Flyway runs migrations on startup.
  - `docker` (`SPRING_PROFILES_ACTIVE=docker`, set in the Dockerfile/compose) — same as
    default, just the profile name used in deploy configs.
  - `test` (`application-test.properties`, `@ActiveProfiles("test")`) — H2 in-memory DB,
    `ddl-auto=create-drop`, Flyway disabled, `data.sql` seeds fixed fixture rows instead.

## 2. Every request hits the security filter chain first

`SecurityConfig` builds one `SecurityFilterChain` for the whole app: CSRF disabled, CORS
enabled (origins from `foodme.cors.allowed-origins`, `*` in the cloud-lab config),
sessions are `STATELESS`, and `JwtAuthenticationFilter` runs before Spring's own
`UsernamePasswordAuthenticationFilter`. Authorization rules are evaluated **in this exact
order — first match wins**:

1. `/api/auth/**` → `permitAll` (register/login must be reachable with no token)
2. `/api/customer/**` → `hasRole("CUSTOMER")`
3. `POST /api/order` → `hasRole("CUSTOMER")`
4. `/api/**` → `permitAll` (chef/dish/image/debug browsing is public)
5. `/actuator/**`, `/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**` → `permitAll`
6. `/admin/auth/login` → `permitAll`
7. `GET /admin/dish/**` → `permitAll` — **deliberate carve-out**: the storefront previews
   the admin-curated menu before any admin session exists. Easy to accidentally widen or
   remove; there's a regression test for it (`AdminDishControllerTest.list_withoutToken_succeeds`).
8. `/admin/**` (everything else — chef, order, and non-GET dish) → `authenticated()`
9. `anyRequest()` → `permitAll` (static SPA assets / HTML shells — see
   `SpaWebConfig`, covered in the root CLAUDE.md's "Single-origin deployment" section)

## 3. JWT verification (`JwtAuthenticationFilter` + `JwtService`)

- `JwtService` signs/verifies HMAC256 tokens (`foodme.jwt.secret` / `foodme.jwt.issuer`),
  embedding the subject and a single `role` claim.
- **Customer tokens**: subject = the customer's **email** (not a numeric id), role =
  literal string `"CUSTOMER"` (`CustomerAuthService.toAuth`).
- **Admin tokens**: subject = admin username, role = whatever `foodme.admin.role` column
  holds (seed data: `"ADMIN"`).
- `JwtAuthenticationFilter` reads the `Authorization: Bearer <token>` header, verifies it,
  and builds a Spring `Authentication` with exactly one authority:
  `new SimpleGrantedAuthority("ROLE_" + role)`. This is why `hasRole("CUSTOMER")` in step 2
  works — Spring Security's `hasRole` auto-prepends `"ROLE_"`, matching what the filter
  grants. Any verification failure (bad signature, wrong issuer, expired) just clears the
  security context and lets the request continue unauthenticated — it does not reject the
  request itself; a downstream `authenticated()`/`hasRole()` rule is what actually 401s it.

## 4. Routing: two parallel controller trees

- `controller/api/*` — customer-facing, mounted under `/api/**` (chef, dish, customer
  auth, order, image, debug). Path constants live in `utils/ControllerUtil`
  (`API_CHEF_CONTROLLER`, etc. — always check here before guessing a path).
- `controller/admin/*` — admin-facing, mounted under `/admin/**` (auth, chef, dish,
  order). Same `ControllerUtil` pattern (`ADMIN_CHEF_CONTROLLER`, etc.).
- Every controller constructor-injects its service (no field injection anywhere in this
  codebase) and delegates immediately — controllers hold no business logic.

## 5. Controller → Service → Repository, and a load-bearing pitfall

Standard layering: `Service` depends on a Spring Data `Repository`, constructor-injected.
Two different update patterns exist for admin edit endpoints — **only one is safe**:

- **Safe pattern** (`AdminDishService.update`): load the existing managed entity via
  `getById`, mutate its fields one by one from the incoming DTO, then `save()` the same
  instance.
- **Unsafe pattern** (`AdminChefService.update`): discard the loaded entity (only used to
  check existence) and `save()` the brand-new object Jackson deserialized straight from
  the request body instead. Any `@OneToMany(cascade = ALL, orphanRemoval = true)` field
  the client's JSON didn't include (e.g. `Chef.chefTagOrderList`, `Chef.dishList`) arrives
  as `null`, and Hibernate's merge throws `JpaSystemException: A collection with
  cascade="all-delete-orphan" was no longer referenced by the owning entity instance` —
  **every** real `PUT /admin/chef/{id}` hits this, not just the test fixture. This was
  caught by `AdminChefControllerTest.update_changesNameEn_persists` and is currently
  still unfixed — follow the safe pattern for any new entity-bound admin update endpoint.

## 6. DTO conventions

- Every DTO with both directions has static `mapEntityToDto(Entity)` /
  `mapDtoToEntity(Dto)` methods — follow this convention rather than inlining mapping in
  a service or controller.
- Null-safety matters in these mappers: `OrderDto.mapEntityToDto` and friends null-check
  nested associations (`chef`, `address`, `orderDishList`) before dereferencing, because
  services sometimes build partial entities (see step 5's pitfall) or load shallow graphs.
- **Admin list responses use `{list, count}`** (`AdminListResponseDto<T>`), not Spring
  Data's `{content, totalElements}` — the admin frontend's `dataProvider.js` depends on
  exactly this shape (see `admin-architecture.md`).
- Field-naming traps: `ChefResponseDto` exposes `nameEn`/`nameHy`/`nameRu` for what the
  `Chef` entity calls `fullNameEn`/`fullNameAm`/`fullNameRu`. `DishDto` exposes `nameHy`
  for the entity's `nameAm`. Don't assume a DTO field name matches its entity column.

## 7. Data layer

- Postgres in prod (schema `foodme`), H2 (`MODE=PostgreSQL`) in tests. Flyway migrations
  live in `src/main/resources/db/migration`; test profile skips Flyway and uses
  `create-drop` + `src/test/resources/data.sql` instead (fixed fixture: chefs 1/2 active,
  chef 3 inactive with no dishes, dishes 1/2/4 belong to chef 1, dish 3 to chef 2, admin
  user `admin`/`admin123`).
- `config/DatabaseUrlEnvironmentPostProcessor` lets a plain `DATABASE_URL` (e.g. a pasted
  Neon connection string) stand in for the discrete `spring.datasource.*` properties.
- IDs are DB sequences (`chef_id_seq`, `order_id_seq`, `order_number_seq`, ...), not
  UUIDs. The customer-facing order **number** (`"FM-100001"`) is a separate, formatted
  sequence from the order's internal numeric **id** — admin endpoints address orders by
  id, not number; there's no "get admin order by number" endpoint.
- Dish/chef images are blobs in `foodme.image`, seeded from `src/main/resources/img-seed`
  on first boot (`ImageSeedRunner`), served back at `/api/images/**`. No object storage.

## 8. Error handling

`GlobalExceptionHandler` (`@RestControllerAdvice`) is the single place HTTP status codes
get decided:
- `NotFoundException` → 404
- `BadRequestException` → 400
- `MethodArgumentNotValidException` (bean validation) → 400, first field error's message
- `NoResourceFoundException` → 404, generic "Not found"
- anything else → 500, **and the response body includes the full stack trace** (`trace`
  field) — fine for this workshop repo, would need tightening before any real deploy.

All error responses share one shape (`ErrorResponseDto`): `timestamp`, `status`, `error`,
`message`, `path`, `trace`. Tests assert on `$.message`.

## 9. Observability (always wired, no-op until configured)

- Structured JSON logs via `logstash-logback-encoder` (`logback-spring.xml`).
- Loki shipping via `loki-logback-appender`, gated by `loki.push.url`
  (`LOKI_PUSH_URL`) — the `<if>` conditional needs `janino` on the classpath, already a
  dependency.
- Prometheus scrape endpoint at `/actuator/prometheus` (`management.endpoints.web.exposure.include=health,info,prometheus`),
  with percentile histogram buckets enabled for `http.server.requests` so Grafana can
  compute p95/p99.
- Sentry/GlitchTip via `sentry.dsn` (`SENTRY_DSN`) — no-op when blank.
- `foodme.http-logging.enabled` (default true, false in tests) turns on request/response
  body logging for `/api/**` and `/admin/**` (secrets redacted) — see the HTTP logging
  filter in `observability/`.
- `config/SimulatedLatencyConfig` injects artificial latency per
  `foodme.latency.min-ms`/`max-ms` (zeroed under the `test` profile) — a deliberate
  workshop knob, not a production concern.
