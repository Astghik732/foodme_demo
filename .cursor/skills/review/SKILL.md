---
name: review
description: >-
  Visual and functional UI review for this FoodMe storefront. Use when reviewing
  frontend components, pages, layout, Tailwind, CSS, or after claiming a UI
  pass is done. Catches phantom utilities, clipped overflow, padding/border
  collisions, redundant chrome, and auth-variant layout traps.
---

# Review

Read [self-review.md](self-review.md) if this is a postmortem. For a review pass, follow this file.

A source read plus a passing e2e suite is not a review. Class names can compile to nothing. Tests can pass on clipped text. Finish only after a rendered pass at real container width.

## Hard rules

1. **Do not trust a Tailwind class until it exists on this theme.** `apps/web/tailwind.config.js` *replaces* default `theme.spacing`. Dotted fractions (`px-3.5`, `gap-1.5`, `p-0.5`) are no-ops unless the key is on the scale. Same for colors, radii, shadows. If unsure, check computed style in the browser.
2. **Do not trust `sm:` / `md:` to mean “fits in this card.”** Those are viewport breakpoints. A `max-w-md` card is still ~448px at `sm`. Count the inner width: container max − padding − borders.
3. **Do not put `flex-row` + `whitespace-nowrap` (Button default) inside `overflow: hidden`.** `.bezel-inner` clips. Stack (`flex-col`, `w-full`) or wrap with `min-w-0`. If labels clip, the review failed.
4. **Type real text.** Placeholders hide missing padding. First glyph must not touch the border. Check `padding-left` / `padding-right` computed, not the class string.
5. **Open every state the component has.** Empty, error, success, loading, signed-in, signed-out. Success with 3 actions is a different layout than guest with 2.
6. **e2e `toBeVisible()` is not layout.** Green tests do not close a visual review.

## Pass checklist (copy and tick)

For each component / page touched or claimed reviewed:

- [ ] Typed into every text field; first character inset from border
- [ ] Computed padding / gap / height match intended tokens (no 0px from missing scale keys)
- [ ] Every action label fully readable (no “ck order”, no truncated CTA unless `truncate` is intentional)
- [ ] No child wider than a clipped ancestor (`overflow: hidden` / `.bezel-inner`)
- [ ] Flex rows that cannot fit at the card’s max width are stacked or wrapped
- [ ] Signed-in and signed-out chrome both checked
- [ ] Success / failure / empty / error surfaces opened, not only the happy list page
- [ ] Header / footer audited for duplicate or leftover CTAs
- [ ] Browser pass at desktop and a ~375px width

## Layout math (do this, do not eyeball)

```
inner = min(viewport, max-w-*) - horizontal padding - border
```

`max-w-md` + `px-8` ≈ 384px inner. Three `h-12` nowrap pills with `px-6` and an icon will overflow. Stack them.

If `scrollWidth > clientWidth` on a clipped node, that is a bug even when Playwright says visible.

## Tailwind landmines in this repo

- Spacing keys use both `"1-5"` and `1.5` *now*; older code may still assume default Tailwind fractions.
- Prefer integers on the scale (`px-4` = 16px) for padding that must exist.
- `Button` is `whitespace-nowrap` + `inline-flex`. It will not wrap. It will overflow.

## How to fail a review (do not)

- Screenshot Home and call the app reviewed
- Read JSX classes and assume they applied
- Skip typing into inputs
- Skip `/orders/success` and `/orders/failed`
- Treat one auth session as all variants
- Close because `npx playwright test` passed
