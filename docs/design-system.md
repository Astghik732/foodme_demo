# FoodMe Design System

> **Skill sources:** `.claude/skills/design-taste-frontend-v1` · `.claude/skills/high-end-visual-design`  
> **Stack:** React 19 · TypeScript · Tailwind CSS v4 · Vite 8 · Plus Jakarta Sans + Outfit

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Elevation & Surfaces](#5-elevation--surfaces)
6. [Motion & Animation](#6-motion--animation)
7. [Component Patterns](#7-component-patterns)
8. [Page Structure](#8-page-structure)
9. [Forbidden Patterns (Anti-Patterns)](#9-forbidden-patterns)
10. [File Map](#10-file-map)

---

## 1. Design Philosophy

FoodMe follows the **Soft Structuralism** design archetype:

| Parameter | Value | Meaning |
|---|---|---|
| `DESIGN_VARIANCE` | **8 / 10** | Asymmetric layouts, masonry-capable grids, deliberate whitespace |
| `MOTION_INTENSITY` | **6 / 10** | Fluid CSS transitions, scroll-entry reveals, no static mounts |
| `VISUAL_DENSITY` | **4 / 10** | Daily-app spacing — breathable but functional |

**Core values:**
- **Haptic depth** — every surface feels physical, not flat
- **Cinematic rhythm** — elements enter the viewport, never just appear
- **Obsessive micro-interactions** — hover, active, and focus states are all crafted
- **Restraint over decoration** — one accent colour, zero gratuitous gradients

---

## 2. Color Tokens

All colours are defined as HSL CSS custom properties in [`src/index.css`](file:///Users/arman.ayvazyan/IdeaProjects/foodme_demo/apps/web/src/index.css) and consumed via Tailwind aliases in [`tailwind.config.js`](file:///Users/arman.ayvazyan/IdeaProjects/foodme_demo/apps/web/tailwind.config.js).

### 2.1 Semantic Tokens

| Token | Light value (HSL) | Usage |
|---|---|---|
| `--background` | `40 20% 98%` | Page background — warm off-white, NOT pure white |
| `--foreground` | `220 15% 12%` | Body text — off-black zinc, NOT `#000000` |
| `--card` | `0 0% 100%` | Card/panel inner surface |
| `--card-foreground` | `220 15% 12%` | Text inside cards |
| `--primary` | `220 15% 12%` | Primary actions (buttons, links) |
| `--primary-foreground` | `40 20% 98%` | Text on primary backgrounds |
| `--secondary` | `220 10% 95%` | Secondary action backgrounds |
| `--muted` | `220 10% 94%` | Muted chip/badge backgrounds |
| `--muted-foreground` | `220 8% 48%` | Subdued label text |
| `--border` | `220 10% 90%` | Dividers, hairline borders |
| `--ring` | `220 15% 12%` | Focus rings |
| `--radius` | `0.75rem` | Base border-radius (12px) |

### 2.2 Brand Accent — Warm Amber

> **Rule:** One accent colour only. Saturation < 80%. NEVER neon or purple.

| Token | Value | Tailwind class |
|---|---|---|
| `--brand` | `hsl(32 95% 52%)` | `text-brand`, `bg-brand` |
| `--brand-foreground` | `hsl(0 0% 100%)` | `text-brand-foreground` |
| `--brand-muted` | `hsl(32 95% 95%)` | `bg-brand-muted` |

**Usage pattern for amber accents:**
```tsx
// Rating badge
<span className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 text-sm font-semibold">
  ★ 4.7
</span>

// Free delivery hint
<span className="text-[11px] text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
  Add 500 AMD for free delivery
</span>
```

### 2.3 Semantic Status Colours

| Token | HSL | Use case |
|---|---|---|
| `--success` | `142 72% 29%` | Order delivered, form success |
| `--warning` | `24.6 95% 53.1%` | Caution, pending |
| `--destructive` | `0 84.2% 60.2%` | Errors, reject, delete |

### 2.4 Status Pill Pattern

```tsx
const STATUS_STYLES = {
  NEW:       "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED:  "bg-blue-50 text-blue-700 border-blue-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  REJECTED:  "bg-red-50 text-red-600 border-red-200",
};

<span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
  {STATUS_LABEL[status]}
</span>
```

---

## 3. Typography

### 3.1 Font Families

| Family | Token | Use |
|---|---|---|
| **Plus Jakarta Sans** | `font-sans` (default) | All body text, UI labels, navigation |
| **Outfit** | `font-display` | H1, H2, display numbers, hero headings |

Both are loaded via Google Fonts in [`index.html`](file:///Users/arman.ayvazyan/IdeaProjects/foodme_demo/apps/web/index.html). The fallback chain preserves Armenian character support: `Plus Jakarta Sans → Noto Sans Armenian → Noto Sans → sans-serif`.

> **BANNED fonts:** Inter, Roboto, Arial, Open Sans, Helvetica.

### 3.2 Scale

| Level | Classes | Use |
|---|---|---|
| Display / Hero | `font-display text-[clamp(2.6rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-tight` | Hero H1 |
| Page title | `font-display text-3xl md:text-4xl font-bold tracking-tight` | Page H1 |
| Section heading | `font-display text-2xl font-bold tracking-tight` | H2 |
| Card heading | `font-semibold text-lg text-zinc-900` | Card titles |
| Body | `text-base text-zinc-500 leading-relaxed max-w-[65ch]` | Body copy |
| Caption | `text-xs text-zinc-400` | Metadata, timestamps |
| Eyebrow | `text-[11px] uppercase tracking-[0.15em] font-semibold` | Section labels |

### 3.3 Eyebrow Tag Pattern

```tsx
<span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700">
  <span className="h-[6px] w-[6px] rounded-full bg-amber-500" />
  Section label
</span>
```

For neutral eyebrows:
```tsx
<span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
  Label
</span>
```

---

## 4. Spacing & Layout

### 4.1 Custom Spacing Scale

Defined in `tailwind.config.js`. The scale is in 4px increments with extra half-steps:

| Key | Value | Key | Value |
|---|---|---|---|
| `0` | 0px | `12` | 48px |
| `0-5` | 2px | `14` | 56px |
| `1` | 4px | `16` | 64px |
| `1-5` | 6px | `20` | 80px |
| `2` | 8px | `24` | 96px |
| `2-5` | 10px | `26` | 104px |
| `4` | 16px | | |

> **Note:** Hyphenated keys like `1-5` are not valid Tailwind scan targets. Use explicit `[6px]` or `py-[6px]` in JSX for non-standard values.

### 4.2 Page Container

```tsx
// Standard page wrapper
<div className="mx-auto max-w-7xl px-4 md:px-8">

// Narrow content (checkout, tracking)
<div className="mx-auto max-w-5xl px-4 md:px-8 py-12">

// Wide sections (hero)
<div className="mx-auto w-full max-w-7xl px-4 md:px-8">
```

### 4.3 Section Padding

Sections breathe heavily — use generous vertical padding:

```
py-20    →  standard section
py-24    →  hero or feature sections
py-16    →  compact sections
```

### 4.4 Grid Patterns

```tsx
// Chef cards grid
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

// Two-column split (form + summary)
<div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">

// Asymmetric bento (hero)
<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center">
```

> **Rule:** Never use `grid-cols-3` with equal-width content cards. Use `sm:grid-cols-2` or explicit `grid-cols-[2fr_1fr_1fr]`.

### 4.5 Mobile Override

Any asymmetric layout MUST collapse at `md:` (768px):
```tsx
// ✅ Always collapse to single-column on mobile
<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12">
```

Never use `h-screen` for full-height sections. Always:
```tsx
<section className="min-h-[100dvh] flex items-center">
```

---

## 5. Elevation & Surfaces

### 5.1 The Double-Bezel Pattern

The signature surface technique. Every card/panel uses a nested enclosure simulating physical depth — like a glass plate in a machined tray.

```css
/* Defined in src/index.css */

.bezel-outer {
  padding: 6px;
  border-radius: 1.5rem;                         /* 24px */
  background: hsl(var(--muted) / 0.6);
  border: 1px solid hsl(var(--border) / 0.8);
}

.bezel-inner {
  border-radius: calc(1.5rem - 6px);             /* 18px — concentric */
  background: hsl(var(--card));
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.9);
  overflow: hidden;
}
```

**Usage:**
```tsx
<div className="bezel-outer shadow-diffuse">
  <div className="bezel-inner p-6">
    {/* content */}
  </div>
</div>
```

### 5.2 Diffusion Shadows

```css
.shadow-diffuse    { box-shadow: 0 20px 40px -15px rgba(0,0,0,0.07); }
.shadow-diffuse-lg { box-shadow: 0 32px 64px -20px rgba(0,0,0,0.10); }
```

Use `shadow-diffuse` on standard cards, `shadow-diffuse-lg` on hover or hero cards.

> **Rule:** Never use generic `shadow-md` or `shadow-[rgba(0,0,0,0.3)]`. Shadow colour must be tinted to the background hue.

### 5.3 Glassmorphism (Header)

```tsx
// Floating pill navbar
<div className="bg-white/80 backdrop-blur-xl border border-zinc-200/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] rounded-full">
```

> **Rule:** Apply `backdrop-blur` ONLY to `fixed` or `sticky` elements — never to scrolling containers.

### 5.4 Border Radius Reference

| Context | Value |
|---|---|
| Default card (Tailwind `--radius`) | `0.75rem` (12px) |
| Button/pill | `rounded-full` (9999px) |
| Card images (within bezel-inner) | `0` (bezel handles rounding) |
| Avatar (chef detail) | `rounded-2xl` (16px) |
| Avatar (chef card) | `rounded-2xl` (16px) |
| Bezel outer | `1.5rem` (24px) |
| Bezel inner | `calc(1.5rem - 6px)` = `1.125rem` |
| Page CTA band | `2rem` (32px) |

---

## 6. Motion & Animation

### 6.1 Easing Curve

All transitions use a single premium cubic-bezier:

```css
ease-[cubic-bezier(0.32,0.72,0,1)]
```

This is a fast-start, slow-land curve that feels weighty without being bouncy.

**Never use:** `linear`, `ease`, `ease-in-out`, or `ease-in`.

### 6.2 Duration Scale

| Duration | Use |
|---|---|
| `duration-150` | Tactile feedback (button active) |
| `duration-300` | Hover state changes |
| `duration-500` | Card lifts, expansions |
| `duration-700` | Scroll reveal entries |

### 6.3 Scroll Reveal (`.reveal`)

```css
/* src/index.css */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s cubic-bezier(0.32,0.72,0,1),
              transform 0.7s cubic-bezier(0.32,0.72,0,1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Usage pattern with IntersectionObserver:**
```tsx
function RevealSection({ children, delay = 0, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
```

> **Rule:** Never use `window.addEventListener('scroll')` for animations — use `IntersectionObserver` only.

### 6.4 Stagger Pattern

```tsx
// Stagger a list of items by 80ms each
{items.map((item, i) => (
  <RevealSection key={item.id} delay={i * 80}>
    <ItemCard item={item} />
  </RevealSection>
))}
```

### 6.5 Keyframe Animations (Tailwind)

Defined in `tailwind.config.js`:

| Class | Duration | Use |
|---|---|---|
| `animate-fade-up` | `0.7s cubic-bezier(0.32,0.72,0,1)` | Static load-in entries |
| `animate-shimmer` | `2s linear infinite` | Skeleton loaders |
| `animate-scroll` | `40s linear infinite` | Infinite marquee |

### 6.6 Tactile Feedback

All interactive elements must have physical press simulation:

```tsx
// Cards
className="... hover:-translate-y-1 active:scale-[0.99] transition-all duration-300"

// Buttons
className="... active:scale-[0.98] transition-transform duration-150"

// Small interactive elements
className="... active:scale-[0.97]"
```

---

## 7. Component Patterns

### 7.1 Button

Defined in [`src/components/ui/button.tsx`](file:///Users/arman.ayvazyan/IdeaProjects/foodme_demo/apps/web/src/components/ui/button.tsx).

| Variant | Use |
|---|---|
| `default` | Primary CTA — off-black with diffuse shadow |
| `outline` | Secondary CTA — bordered zinc-200 |
| `ghost` | Nav links, tertiary actions |
| `secondary` | Muted actions |
| `destructive` | Delete, reject |

| Size | Shape | Height |
|---|---|---|
| `default` | `rounded-md` | 36px |
| `sm` | `rounded-full` | 32px |
| `lg` | `rounded-full` | 44px |
| `icon` | `rounded-full` | 36×36px |

**Button-in-Button trailing icon pattern:**
```tsx
<Button size="lg" className="group rounded-full px-6">
  <Link to="/explore" className="flex items-center gap-2">
    Explore chefs
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-[2px]">
      <ArrowRight size={14} />
    </span>
  </Link>
</Button>
```

### 7.2 Chef Card

[`src/components/sections/chef-card.tsx`](file:///Users/arman.ayvazyan/IdeaProjects/foodme_demo/apps/web/src/components/sections/chef-card.tsx)

```
┌─────────────────────────────────┐  ← bezel-outer
│  ┌──────────────────────────┐   │  ← bezel-inner p-5
│  │ [avatar 72px] [name    ] │   │
│  │               [kitchen ] │   │
│  │               [★ 4.7   ] │   │
│  │                   [→]    │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

- Hover: `-translate-y-1` + `shadow-diffuse-lg`
- Arrow icon circle: `bg-zinc-100 → bg-zinc-900 text-white` on hover

### 7.3 Dish Card

[`src/components/sections/dish-card.tsx`](file:///Users/arman.ayvazyan/IdeaProjects/foodme_demo/apps/web/src/components/sections/dish-card.tsx)

```
┌─────────────────────────────────┐  ← bezel-outer
│  ┌──────────────────────────┐   │  ← bezel-inner
│  │ [image 180px tall       ]│   │
│  │ name                     │   │
│  │ description (2-line)     │   │
│  │ price              [+]   │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

- Plus button: `rounded-full h-8 w-8 bg-zinc-100 hover:bg-zinc-900 hover:text-white`

### 7.4 Skeleton Loader

Never use a generic spinner. Match layout exactly:

```tsx
// Chef card skeleton
<div className="bezel-outer">
  <div className="bezel-inner h-[120px] relative overflow-hidden bg-zinc-100">
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s linear infinite",
      }}
    />
  </div>
</div>
```

### 7.5 Empty State

```tsx
<div className="flex flex-col items-center py-20 text-center gap-4">
  <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-300">
    <UtensilsCrossed size={28} strokeWidth={1.5} />
  </div>
  <div>
    <p className="font-semibold text-zinc-700">Nothing here yet</p>
    <p className="text-sm text-zinc-400 mt-1 max-w-[32ch]">
      Browse our chefs and add your first dish.
    </p>
  </div>
</div>
```

### 7.6 Error State

```tsx
<div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
  We could not load this content. Please try refreshing.
</div>
```

### 7.7 Floating Header

[`src/components/layout/header.tsx`](file:///Users/arman.ayvazyan/IdeaProjects/foodme_demo/apps/web/src/components/layout/header.tsx)

- Position: `fixed top-0 inset-x-0 z-50`, centred with `flex justify-center pt-4 px-4`
- Shape: `rounded-full` pill, `max-w-2xl w-full`
- At rest: `bg-white/60 backdrop-blur-md border border-zinc-100/80`
- On scroll: `bg-white/80 backdrop-blur-xl border border-zinc-200/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]`
- Offset: main content requires `pt-20` padding

---

## 8. Page Structure

### Home (`/`)

```
Header (fixed floating pill)
│
├── Hero Section (min-h-[100dvh], left-aligned split)
│   ├── Eyebrow tag
│   ├── H1 (font-display, clamp, left-aligned)
│   ├── Body copy
│   ├── CTA buttons (pill shape)
│   ├── Social proof strip
│   └── Floating stats card (desktop only, bezel-outer)
│
├── How It Works (py-24 bg-zinc-50)
│   ├── Section eyebrow + h2
│   └── 3-step grid (bezel-outer cards, amber icons)
│
├── Popular Chefs (py-24)
│   ├── Section eyebrow + h2
│   ├── Skeleton / Error / Empty states
│   └── Chef cards grid (staggered reveal)
│
└── CTA Band (rounded-[2rem] bg-zinc-900 with amber glow)

Footer
```

### Explore (`/explore`)

```
├── Page header (eyebrow + h1 + chef count)
├── Loading: 12 skeleton cards
├── Error: inline error message
├── Empty: beautiful empty state
├── Chef cards grid (paginated)
└── Pagination: pill prev/next + page indicator
```

### Chef (`/chef/:id`)

```
├── ChefDetails hero (banner + avatar + info)
└── Content row (max-w-7xl)
    ├── ChefDishes (dishes by tag, staggered)
    └── UserCart (sticky bezel panel)
```

### Checkout (`/checkout`)

```
├── Eyebrow + h1
└── Two-column grid (lg)
    ├── OrderDeliveryForm (left)
    └── Right column
        ├── CheckoutSummary (bezel)
        ├── CheckoutPriceSummary
        └── Error banner
```

### Order Status (`/orders/success` | `/orders/failed`)

```
└── Centered card (py-20)
    ├── Icon circle (green/red)
    ├── H1 (font-display)
    ├── Order number (font-mono pill)
    └── Action buttons (rounded-full)
```

### Tracking (`/tracking/:number`)

```
├── Eyebrow + order h1
├── Status pill (coloured by status)
├── 3-step progress bar (pure CSS)
├── Chef name row
├── Order items (bezel table)
└── Total row
```

---

## 9. Forbidden Patterns

### Strictly Banned

| Anti-Pattern | Alternative |
|---|---|
| `h-screen` | `min-h-[100dvh]` |
| `window.addEventListener('scroll')` | `IntersectionObserver` |
| Animating `top`, `left`, `width`, `height` | `transform` + `opacity` only |
| `box-shadow` neon glows | Diffusion shadows, inner borders |
| `#000000` pure black | `zinc-950` or `hsl(220 15% 12%)` |
| Purple/blue AI aesthetic | Amber accent only |
| Inter font | Plus Jakarta Sans, Outfit |
| Generic circular spinner | Skeletal loaders matching layout size |
| 3-equal-column card grids | 2-col, asymmetric, or staggered |
| Centered H1 hero (DESIGN_VARIANCE > 4) | Left-aligned or split-screen |
| `backdrop-blur` on scrolling containers | Fixed/sticky elements only |
| Arbitrary `z-50` or `z-[9999]` | Systematic z-index: header=50, modal=60 |
| Emoji in code or markup | Lucide icons with `strokeWidth={1.5}` |
| Broken Unsplash links | `https://picsum.photos/seed/{string}/800/600` |
| Generic "John Doe" placeholder names | Creative realistic names |
| `linear` or `ease-in-out` transitions | `cubic-bezier(0.32,0.72,0,1)` |

### Icon Policy

Use `lucide-react` exclusively (installed). Standard `strokeWidth={1.5}` across the entire app. Never use thick-stroke icons.

### Content Policy

- No `99.99%` round numbers — use `47.2%`, `38 min`, `2,417 orders`
- No startup names: "Acme", "Nexus" — use realistic brand language
- No filler: "Seamless", "Elevate", "Unleash", "Next-Gen"

---

## 10. File Map

```
apps/web/
├── index.html                          ← Font imports (Plus Jakarta Sans, Outfit)
├── tailwind.config.js                  ← Design tokens, animations, font families
├── src/
│   ├── index.css                       ← CSS custom properties, .bezel-*, .shadow-diffuse, .reveal
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-layout.tsx          ← Shell: Header + pt-20 main + Footer
│   │   │   ├── header.tsx              ← Floating glass pill nav
│   │   │   ├── footer.tsx              ← Editorial footer
│   │   │   └── logo.tsx                ← SVG logo
│   │   ├── sections/
│   │   │   ├── chef-card.tsx           ← Double-bezel chef listing card
│   │   │   ├── chef-details.tsx        ← Banner + avatar hero
│   │   │   ├── chef-dishes.tsx         ← Dish grid by tag
│   │   │   ├── dish-card.tsx           ← Double-bezel dish card
│   │   │   ├── dish-modal.tsx          ← Dish detail dialog
│   │   │   ├── user-cart.tsx           ← Sticky cart panel
│   │   │   ├── cart-item-card.tsx      ← Cart line item
│   │   │   ├── checkout-summary.tsx    ← Order items list
│   │   │   ├── checkout-price-summary.tsx ← Price breakdown
│   │   │   ├── order-delivery-form.tsx ← Delivery details form
│   │   │   └── item-quantity-button-group.tsx ← +/- quantity controls
│   │   └── ui/
│   │       ├── button.tsx              ← Premium button variants (rounded-full lg/sm)
│   │       ├── card.tsx                ← Base card primitives
│   │       ├── dialog.tsx              ← Radix Dialog wrapper
│   │       ├── input.tsx               ← Form input
│   │       ├── label.tsx               ← Form label
│   │       └── radio-group.tsx         ← Radio group (delivery method)
│   └── pages/
│       ├── Home/index.tsx              ← Asymmetric hero + how-it-works + CTA
│       ├── Explore/index.tsx           ← Chef grid with pagination
│       ├── Chef/index.tsx              ← Chef detail + dishes + cart
│       ├── Checkout/index.tsx          ← Order form + summary
│       ├── OrderStatus/index.tsx       ← Success / failure screen
│       └── Tracking/index.tsx          ← Live order status
```

---

*Generated from `.claude/skills/design-taste-frontend-v1` and `.claude/skills/high-end-visual-design`.*
