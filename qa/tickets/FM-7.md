**Key:** FM-7
**Type:** Feature request
**Priority:** Medium
**Component:** Storefront / Explore
**Reporter:** product@foodme.example
**Status:** Open

## Description

Customers with a specific craving have to scroll through every active chef to
find, say, a vegetarian or grill option. Add a way to filter the Explore grid
by cuisine.

## Steps to reproduce

N/A — feature request.

## Expected vs actual

**Expected:** customers can narrow the chef list to a cuisine they're
interested in without paging through everyone.

**Actual:** no filtering exists; Explore only supports paging through the
full, unfiltered list of active chefs.

## Acceptance criteria

- The Explore page shows a cuisine filter (e.g. a set of chips or a dropdown)
  populated from the distinct `kitchen` values among active chefs.
- Selecting a cuisine re-requests the chef list filtered to that cuisine and
  resets to page 1.
- The filter can be cleared to return to the full unfiltered list.
- An empty result for a selected cuisine shows the existing "no chefs
  available" empty state, not an error.
- The selected filter is reflected in the URL (e.g. a query parameter) so a
  filtered view can be shared or reloaded.

## Environment

Storefront only; no backend contract exists yet for filtering by cuisine —
this will need a new query parameter (or client-side filtering, if the full
active chef list is small enough) as part of the implementation.
