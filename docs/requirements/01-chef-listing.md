# Chef listing

## Summary

The homepage's "Explore" view shows customers a paged grid of chefs they can
order from. This is the entry point to the ordering flow: every session
starts here.

Backed by `GET /api/chef/active?page=&size=`.

## User stories

**US-1.** As a customer, I want to see a list of chefs currently accepting
orders, so I can pick one to order from.

**US-2.** As a customer, I want the chefs I'm most likely to want at the top
of the list, so I don't have to scroll through everyone to find a good option.

**US-3.** As a customer, I want to page through the chef list if there are
more chefs than fit on one screen, so the page stays fast and readable.

## Acceptance criteria

### AC-1 — Only active chefs are listed

1.1. The Explore grid calls `GET /api/chef/active` and renders every chef in
`exploreChefResponseDtoList`.

1.2. A chef whose `status` is not `ACTIVE` never appears in this list, even if
requested by page/size that would otherwise include it. (Seed data includes
one `INACTIVE` chef; it must not appear on any page of Explore.)

1.3. `count` in the response reflects the total number of `ACTIVE` chefs, not
the number of chefs on the current page, and not the total number of chef
rows in the database.

### AC-2 — Card content

2.1. Each chef card shows, at minimum: avatar (`avatarUrl`), display name
(`name`, English value), cuisine (`kitchen`, English value), and rating
(`rating`), formatted to one decimal place (e.g. `4.7`).

2.2. If `avatarUrl` is missing or fails to load, the card shows a fixed
placeholder image instead of a broken image icon.

2.3. Rating is shown only when `rating` is non-null; when null, the rating
element is omitted entirely rather than showing `0.0` or `N/A`.

### AC-3 — Ordering

3.1. Chefs are rendered in the order returned by the API, which is sorted by
`priorityIndex` ascending, then `id` ascending as a tiebreaker.

3.2. The grid does not re-sort, filter, or otherwise reorder the list
client-side.

### AC-4 — Pagination

4.1. The grid requests `size=12` chefs per page by default.

4.2. When `count` exceeds the current page's `size`, pagination controls
(next/previous, or page numbers) are shown; when `count` is less than or equal
to `size`, no pagination controls are shown.

4.3. Navigating to the next page requests `page=<n+1>` with the same `size`
and replaces the currently displayed chefs; it does not append to the
existing grid (no infinite scroll).

4.4. Every `ACTIVE` chef is reachable by paging through the full result set
exactly once — no chef is skipped and no chef is duplicated across pages.

4.5. Requesting a `page` beyond the last available page returns an empty
`exploreChefResponseDtoList` with the correct `count`; the UI shows an
"no more chefs" empty state rather than an error.

### AC-5 — Loading and error states

5.1. While the request is in flight, the grid shows skeleton placeholders in
place of chef cards, matching the requested page size.

5.2. If the request fails (network error or non-2xx response), the grid shows
an inline error message with a "Retry" action that re-issues the same
request.

5.3. If the request succeeds with zero active chefs (`count: 0`), the grid
shows an explicit "No chefs available right now" empty state, distinct from
the error state in AC-5.2.

### AC-6 — Selecting a chef

6.1. Clicking anywhere on a chef card navigates to that chef's page (see
`02-chef-menu.md`) using the chef's `id`.

6.2. Card navigation targets are keyboard-reachable and activate on `Enter`,
consistent with the rest of the site's interactive elements.
