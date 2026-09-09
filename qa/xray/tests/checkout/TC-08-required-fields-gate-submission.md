**Test case:** TC-08 — Checkout requires mandatory fields before submission is enabled
**Folder:** Checkout
**Type:** Manual
**Priority:** Medium
**Labels:** checkout, validation, regression

## Preconditions

- Cart contains at least one dish.
- `DELIVERY` is available for the chef.

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Go to checkout with `DELIVERY` selected and leave all fields empty. | "Place order" is disabled. |
| 2 | Fill in city, street, and building only. | "Place order" remains disabled (receiver name/phone still missing). |
| 3 | Fill in receiver name and phone number as well. | "Place order" becomes enabled. |
| 4 | Clear the phone number field. | "Place order" becomes disabled again. |
| 5 | Enter an implausible phone number (e.g. `123`). | Field shows a validation error; "Place order" remains disabled until corrected. |
