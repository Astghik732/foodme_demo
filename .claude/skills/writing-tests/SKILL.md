---
name: writing-tests
description: Write unit and integration tests for the FoodMe monorepo (Spring Boot backend, React storefront/admin). Use when asked to add, extend, or fix tests, cover a bug with a regression test, or when a change touches apps/backend/src/test, apps/web/e2e, or apps/admin/e2e.
---

# Writing tests for FoodMe

This repo has two distinct test styles. Match the existing one for the layer you're
touching rather than introducing a new framework.

## Backend (`apps/backend`) — Spring Boot integration tests

Every existing backend test is a full-context integration test, not an isolated unit test:

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SomethingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper; // only if you need to build a JSON request body

    @Test
    void methodUnderTest_scenario_expectedResult() throws Exception {
        mockMvc.perform(get("/api/..."))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.field").value(...));
    }
}
```

Conventions to follow (see `ChefControllerTest`, `DishControllerTest`,
`OrderControllerTest`, `CustomerAuthControllerTest` for live examples):

- **Test name = `method_scenario_expectedResult`** (e.g. `getActiveChefs_returnsActiveChefsOnly`).
- **`@ActiveProfiles("test")` is required.** It switches to `application-test.properties`:
  H2 in-memory DB, Flyway disabled, `ddl-auto=create-drop`, and
  `spring.sql.init.mode=always` loads `src/test/resources/data.sql` fresh for the context.
- **Seed data is fixed** — don't change `data.sql` to suit one test; write assertions
  against what's already there:
  - Chef 1 `marta-k` (ACTIVE, dishes 1 & 2 ACTIVE, dish 4 INACTIVE)
  - Chef 2 `ararat-grill` (ACTIVE, dish 3)
  - Chef 3 `closed-kitchen` (INACTIVE) — use this one to test that inactive chefs/dishes
    are excluded from customer-facing endpoints
  - Admin user `admin` exists for admin-auth tests
- **Endpoints needing a customer JWT**: register a fresh customer through the real
  `/api/auth/register` endpoint inside the test (see `customerToken()` in
  `OrderControllerTest`) and use a **unique email per call** (`UUID.randomUUID()` or an
  `AtomicInteger` counter) — the DB persists across tests in the same class, so a fixed
  email will collide.
- If a test needs earlier tests' side effects (e.g. an order created by a prior test),
  use `@TestMethodOrder(MethodOrderer.OrderAnnotation.class)` + `@Order(n)` like
  `OrderControllerTest` — otherwise keep tests independent.
- There is currently no Mockito/`@WebMvcTest`/service-level unit test in the codebase.
  If a case is easier to express against a `Service` directly (e.g. pure branching logic
  in `DishService`/`OrderService` that doesn't need HTTP or the DB), it's fine to add a
  plain JUnit 5 test with Mockito (`testImplementation` already pulls in
  `spring-boot-starter-test`, which includes Mockito) — construct the service with mocked
  repositories via its constructor (services in this codebase use constructor injection,
  no field injection) rather than `@SpringBootTest`. Prefer this only when a full MockMvc
  round-trip wouldn't exercise anything extra.

Run tests:

```
cd apps/backend
./gradlew test                                          # whole suite
./gradlew test --tests "ChefControllerTest"              # one class
./gradlew test --tests "ChefControllerTest.getChefById_returnsChefWithDishes"  # one method
```

## Frontend (`apps/web`, `apps/admin`) — Playwright E2E

Neither frontend app has a unit-test framework (no Vitest/Jest) — all frontend coverage is
Playwright E2E in `apps/web/e2e` / `apps/admin/e2e`, run against a real dev server (and,
for `apps/web`, the real backend in CI). Don't introduce a unit-test runner for a one-off
test; write a Playwright spec, or if you believe pure-logic unit coverage (e.g. cart math
in `lib/db.ts` / `hooks/useCart.ts`) is genuinely needed, flag it to the user before adding
a new dependency.

Conventions (see `apps/web/e2e/cart-decrement.spec.ts`, `happy-path.spec.ts`,
`storefront-flows.spec.ts`):

- Prefer role/label-based locators (`page.getByRole(...)`, `page.getByLabel(...)`,
  `page.getByText(...)`) over raw CSS. Existing specs do fall back to a handful of stable
  structural classes (e.g. `a.cc_card` for a chef card, `button.dc_card` for a dish card,
  `aside.uc-panel` for the cart panel) where there's no accessible role — grep the spec
  files for the component's class before inventing a new selector.
- Reuse shared setup from `e2e/auth.ts` (`createAccountAtCheckout` for UI signup,
  `registerCustomerViaApi` for a fast API-level signup) instead of re-implementing
  registration in a new spec.
- Generate unique emails per test run (`Date.now()` + random suffix) — the backend
  persists customers for real during E2E runs.
- A comment referencing a bug/ticket id at the top of a regression spec (e.g.
  `// FM-BUG-07 / KAN-19: ...`) is the existing convention for "this test encodes a fix for
  bug X" — follow it when a test exists specifically to cover a reported bug.
- `apps/admin/e2e` follows the same pattern against the react-admin backoffice UI.

Run tests:

```
cd apps/web   # or apps/admin
npm run test:e2e                                    # full suite, starts its own dev server
npx playwright test e2e/<file>.spec.ts              # one file
npx playwright test e2e/<file>.spec.ts -g "<name>"  # one test by title
npx playwright show-report                          # view last HTML report
```

`apps/web`'s Playwright server boots on `:5180`, `apps/admin`'s on `:5174`; both reuse an
already-running dev server outside CI (`reuseExistingServer: !process.env.CI`).
