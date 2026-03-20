# Freegle Style Board

The visual design system for the Freegle website. This document describes how things are styled and the design tokens available.

## Design Direction

**Target feel**: Warm, friendly, trustworthy, accessible. Like a community noticeboard in a village hall, not a tech startup.

**Key principles**:
- Warm off-white background (`#faf9f7`) instead of cool white
- Rounded corners (8-12px) for a soft, approachable feel
- Earthy greens for an environmental charity
- WCAG 4.5:1 minimum contrast on all text
- Subtle shadows for depth without harshness
- Source Sans Pro — humanist, readable, friendly

---

## 1. Color Palette

Colors are defined in two layers:
- **SCSS variables** (`$color-*`) in `_color-vars.scss` — available at build time
- **CSS custom properties** (`--color-*`) in `_design-tokens.scss` — available at runtime, preferred for new code

### Brand / Primary

| Token | CSS Property | Hex | Usage |
|-------|-------------|-----|-------|
| `$color-success` | `--color-primary` | `#338808` | Primary buttons, Bootstrap primary |
| `$color-success-hover` | `--color-primary-hover` | `#51a91e` | Button hover states |
| `$color-green-background` | `--color-primary-bg` | `#61AE24` | Navbar, badges, brand background |
| `$color-header` | `--color-primary-dark` | `#1d6607` | Headings |
| `$color-green--light` | `--color-primary-light` | `#E6ffE6` | Card header backgrounds |
| `$color-green--bg-gradient` | `--color-primary-surface` | `#f0f7ed` | Page background tints |

### Accent / Secondary

| Token | CSS Property | Hex | Usage |
|-------|-------------|-----|-------|
| `$color-secondary` | `--color-accent` | `#00A1CB` | Navbar notification badges |
| `$color-info-bg` | `--color-accent-light` | `#d9edf7` | Info backgrounds |

### Semantic

| Token | CSS Property | Hex | Usage |
|-------|-------------|-----|-------|
| `$color-warning` | `--color-warning` | `#e38d13` | Warning buttons and alerts |
| `$color-red` | `--color-danger` | `#dc3545` | Errors, destructive actions |
| — | `--color-link` | `#2563eb` | Links |
| — | `--color-link-hover` | `#1d4ed8` | Link hover |

### Neutrals

| CSS Property | Hex | Usage |
|-------------|-----|-------|
| `--color-gray-50` | `#faf9f7` | Page background, lightest surface |
| `--color-gray-100` | `#f5f3f0` | Surface |
| `--color-gray-200` | `#E9ECEF` | Borders, dividers |
| `--color-gray-300` | `#CED4DA` | Stronger borders |
| `--color-gray-400` | `#adb5bd` | Disabled states, btn-white borders |
| `--color-gray-500` | `#6C757D` | Secondary text |
| `--color-gray-600` | `#495057` | Body text |
| `--color-gray-700` | `#343a40` | Strong text |
| `--color-gray-900` | `#212529` | Headings, emphasis |

---

## 2. Typography

- **Font**: Source Sans Pro (Google Fonts) with system fallback
- **Base size**: 16px
- **Headings**: Dark green (`$color-header: #1d6607`)
- **Scale classes**: `.text--smallest` (0.6em) through `.text--largest` (2rem)

---

## 3. Buttons

Six button types:

| Type | Appearance |
|------|-----------|
| `.btn-primary` | Green fill, white text |
| `.btn-secondary` | Gray neutral outline |
| `.btn-white` | White bg, gray-400 border, subtle gray hover |
| `.btn-warning` | Orange fill |
| `.btn-default` | White bg, gray-400 border |
| `.btn-light` | Minimal text button |
| `.btn-link` | Text-only with underline on hover |

---

## 4. Border Radius & Corner Shape

Enabled globally via `$enable-rounded: true`. Corners use **squircle** (superellipse) shape via `corner-shape: squircle` for smoother, more organic curves than standard circular `border-radius`. This is a progressive enhancement — Chrome 139+/Edge 139+ render squircles, other browsers fall back to standard rounded corners silently.

Four token levels:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.375rem (6px) | Tags, badges, small controls, standalone images |
| `--radius-md` | 0.5rem (8px) | Buttons, inputs, cards |
| `--radius-lg` | 0.75rem (12px) | Section cards, modals |
| `--radius-xl` | 1.25rem (20px) | Chat bubbles, hero cards, pills |

Bootstrap values: `$border-radius: 0.5rem`, `$border-radius-sm: 0.375rem`, `$border-radius-lg: 0.75rem`.

### What gets rounded vs square

**Rounded** (default for interactive and container elements):
- All buttons (global rule applies `--radius-sm` to bare `<button>` elements)
- Form inputs, selects, textareas (via Bootstrap `$enable-rounded`)
- Cards, modals, dropdowns, tooltips, popovers
- Badges, pills, tags
- Standalone images and thumbnails (`--radius-sm`)
- Chat bubbles (`--radius-xl`)

**Square or minimal** (intentional exceptions):
- Social sign-in buttons (4px per platform brand guidelines)
- Full-bleed images inside cards (inherit card's `overflow: hidden` clip)
- Left-border accent bars (e.g. green bar on blockquotes)
- Progress bars
- Table cells
- Input-group internal edges (Bootstrap handles first/last child radius)

---

## 5. Shadows / Elevation

Four-level shadow scale:

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Cards at rest, list items |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.1)` | Elevated cards, hover states |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.12)` | Dropdowns, popovers, sticky |
| `--shadow-xl` | `0 10px 30px rgba(0,0,0,0.15)` | Modals, overlays |

Applied globally: `.card` gets `--shadow-sm`, `.modal-content` gets `--shadow-xl`, `.dropdown-menu` gets `--shadow-md`.

---

## 6. Transitions

Three-level timing scale:

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 150ms ease-in-out | Hover highlights, opacity |
| `--transition-normal` | 200ms ease-in-out | Color, background, border |
| `--transition-slow` | 300ms ease-in-out | Transforms, layout shifts |

All interactive elements should have a transition. Hover states without transitions feel jarring.

---

## 7. Spacing

Bootstrap 5 spacing utilities (`m/p-1` through `m/p-5`). Bootstrap 4 shims (`.ml-*` → `.ms-*` etc.) have been removed.

---

## 8. Components

### Navbar Badges

Five badge classes with per-icon `right` offsets for correct overlap positioning:

| Class | Right offset |
|-------|-------------|
| `.browsebadge` | -6px |
| `.mypostsbadge` | 4px |
| `.newsbadge` | 10px |
| `.communityeventsbadge` | -2px |
| `.volunteeropportunitiesbadge` | 9px |

Each differs because the icons have different widths. The badge sits inside a `position-relative` wrapper div.

### Cards

Cards get `box-shadow: var(--shadow-sm)` globally. Card headers use `.bg-success` and `.bg-info`.

### Modals

Z-index scale: tooltips (1030), datepicker (2000), neartop (5000), verytop (10000), confirm-modal (200000).

---

## 9. Icons

Font Awesome SVG icons via `vue-awesome`. Custom size classes exist for specific layouts (`.fa-8-75x`, `.fa-0-8x`, `.fa-1-5x`, `.fa-1-75x`).

---

## 10. Layout

- Mobile-first with Bootstrap breakpoints
- Desktop navbar: ~80px green bar with icon/text links
- Mobile bottom nav: 67px with centered post button
- Warm off-white page background (`--color-page-bg: #faf9f7`)

---

## 11. Remaining Work

- **Typography scale**: ~45% of font-size declarations use off-scale values. Needs visual regression testing before enforcing the 7-step scale.
- **`!important` cleanup**: 538 declarations. Requires specificity restructuring, especially in buttons.scss.
