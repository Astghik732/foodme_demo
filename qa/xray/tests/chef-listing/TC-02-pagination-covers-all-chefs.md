**Test case:** TC-02 — Pagination covers every active chef exactly once
**Folder:** Chef Listing
**Type:** Manual
**Priority:** Medium
**Labels:** explore, pagination, regression

## Preconditions

- Seed dataset loaded.
- A page size small enough to force at least two pages (e.g. `size=3`
  against 7 active chefs).

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Call `GET /api/chef/active?page=0&size=3`. | Returns 3 chefs and `count: 7`. |
| 2 | Record the `id` of every chef returned on page 0. | — |
| 3 | Call `GET /api/chef/active?page=1&size=3`. | Returns 3 different chefs, no overlap with page 0. |
| 4 | Call `GET /api/chef/active?page=2&size=3`. | Returns the remaining active chef(s), with no id repeated from earlier pages and no active chef missing. |
| 5 | Sum the ids seen across all pages against the full list of active chef ids in the seed data. | Every active chef id appears exactly once across all pages. |
