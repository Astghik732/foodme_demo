# Self-review: missed storefront bugs

Full write-up: [docs/self-review.md](../../../docs/self-review.md)

## Misses

- **Input:** `px-3.5` was not on the replaced spacing scale → padding 0 → first letter on the border. Reviewer never typed, never read computed padding.
- **Header:** leftover “Order now” next to cart while the hero already has that CTA.
- **Order success:** `sm:flex-row` + nowrap `lg` buttons inside `max-w-md` + `.bezel-inner { overflow: hidden }` → “Track order” / “Back to explore” clipped.

## Why

Class names ≠ CSS. Viewport `sm:` ≠ card width. Visibility tests ≠ layout. Auth variants add a third button. Decorative `overflow: hidden` clips.

## Rule

No UI review is done until a rendered pass at real container width, with typed input and every terminal state opened.
