# Why UI bugs keep surviving review

Postmortem of the FoodMe storefront review (Sep 2026). The agent marked the frontend “reviewed and fixed,” then the user found bugs that a real visual pass would have caught in minutes.

This file is the failure analysis. The durable checklist lives in the `review` skill.

## Bugs the review missed

| Bug | What a user saw | What the reviewer did |
| --- | --- | --- |
| Input text on the left border | First character sits on the stroke | Trusted `px-3.5` in JSX. Never typed. Never read `padding-left`. |
| Header “Order now” | Redundant black CTA next to cart | Tuned chrome, left a duplicate CTA that the hero already has. |
| Success card actions clipped | “ck order” / “Back to expl” cut by the card | Asserted “Order placed!” text. Never opened `/orders/success` with three buttons. Never checked overflow. |

## Root causes (why, not what)

1. **Class names are not CSS.** This Tailwind config *replaces* default `theme.spacing`. Tokens like `3.5` did not exist; `px-3.5` compiled to nothing. Reviewing source classes without computed styles is a fake review.

2. **Parent constraints beat child intent.** `bezel-inner` sets `overflow: hidden`. `max-w-md` + `px-8` leaves ~384px. Three `size="lg"` `whitespace-nowrap` pills cannot fit. `sm:flex-row` is a *viewport* breakpoint, not a container query — at 640px the card is still 448px.

3. **Happy-path screenshots of the wrong screen.** Review walked Home / Explore / Login. Did not place an order. Did not open success/failure. Did not type into an input. Did not measure `scrollWidth > clientWidth`.

4. **Tests as a substitute for looking.** Playwright `toBeVisible()` on “Order placed!” passes while buttons are clipped. Visibility ≠ layout.

5. **Auth variants change the chrome.** Guest success has two actions. Signed-in success has three. The overflow only shows in the denser variant. Reviewing one auth state is incomplete.

6. **Decorative shells clip content.** Rounded cards with `overflow: hidden` will silently crop anything that sticks out. Every `bezel-inner` / `overflow-hidden` ancestor is a clip trap until proven otherwise.

7. **nowrap + row + hidden overflow is one bug.** `Button` always has `whitespace-nowrap`. Combining that with `flex-row` inside a narrow clipped card is overflow by construction.

8. **Placeholders hide padding bugs.** Empty inputs and short placeholders can look “fine” until a real first letter hits the border.

## What a passing review actually requires

- Type into every text field. Read computed `padding-left` / `padding-right`.
- Confirm every utility class exists on *this* theme (spacing, radius, color).
- Open every terminal state: empty, error, success, loading, signed-in, signed-out.
- At the real container width, confirm no child is clipped (`scrollWidth <= clientWidth`, labels fully readable).
- Treat e2e green as necessary, not sufficient, for layout.
