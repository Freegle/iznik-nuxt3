# Freegle Style Board

A comprehensive inventory of the visual design system, aligned with 2026 web design trends for a warm, welcoming community site serving an older demographic.

## Design Direction

**Target feel**: Warm, friendly, trustworthy, accessible. Like a community noticeboard in a village hall, not a tech startup.

**2026 trends applied**:
- Warm off-white backgrounds (#faf9f7) instead of cool whites - reduces visual fatigue
- Larger border-radius (8-12px) for soft, approachable feel
- Earthy greens (perfect for environmental charity)
- Higher contrast for accessibility (WCAG 4.5:1 minimum)
- Subtle shadows for depth without harshness
- Source Sans Pro font - humanist, readable, friendly

**Pantone Cloud Dancer** (warm inviting neutral) influence on the gray scale - shifted from cool blue-grays to warmer tones.

---

## 1. Color Palette

### Current State (Post-Modernization)

The project uses ~52 color variables in `_color-vars.scss` with consistent `$color-*` American spelling. CSS custom properties in `_design-tokens.scss` provide runtime theming support.

#### Primary / Brand Colors (Current)

| Token | Hex | Usage |
|-------|-----|-------|
| `$colour-success` | `#338808` | Bootstrap primary override, buttons |
| `$color-green-background` | `#61AE24` | Navbar, badges, popovers, toggle switches |
| `$colour-header` | `#1d6607` | Headings (h1-h4) |
| `$colour-success-hover` | `#51a91e` | Button hover states |
| `$colour-secondary` | `#00A1CB` | Navbar notification badges |
| `$colour-warning` | `#e38d13` | Warning buttons and alerts |

#### Green Variants (11 defined, most used in 1-2 places)

| Token | Hex | Observation |
|-------|-----|-------------|
| `$colour-success` | `#338808` | Bootstrap primary |
| `$colour-success-hover` | `#51a91e` | Hover only |
| `$colour-header` | `#1d6607` | Headings only |
| `$color-green-background` | `#61AE24` | Navbar bg + 9 hardcoded inline uses |
| `$color-green--light` | `#E6ffE6` | Card headers |
| `$color-green--lighter` | `#CDE4DA` | Rarely used |
| `$color-green--medium` | `#84CF96` | Rarely used |
| `$color-green--dark` | `#3B8070` | Teal-green, btn-white borders |
| `$color-green--darker` | `#008000` | Secondary button text/border |
| `$color-green--mid` | `#3c763d` | Duplicate of success-fg |
| `$color-green--button-border` | `#61A624` | Near-identical to green-background |
| `$color-green--bg-gradient` | `#f0f7ed` | Page background gradient |
| `$color-green--light-alt` | `#00FF00` | Pure green (accessibility concern) |

#### Neutral / Gray (7 named + 4 numbered)

| Token | Hex |
|-------|-----|
| `$color-gray--lighter` | `#F5F5F5` |
| `$color-gray--light` | `#CDCDCD` |
| `$color-gray--base` | `#A9A9A9` |
| `$color-gray--normal` | `#6C757D` |
| `$color-gray--dark` | `#808080` |
| `$color-gray--darker` | `#212529` |
| `$color-gray-1` | `rgba(221,142,98,0.05)` (tinted!) |
| `$color-gray-2` | `rgba(62,108,178,0.02)` (tinted!) |
| `$color-gray-3` | `#E9ECEF` |
| `$color-gray-4` | `#CED4DA` |

Note: `$color-gray-1` and `$color-gray-2` are not gray at all -- they are tinted semi-transparent colors.

#### Blue (6 variants)

| Token | Hex |
|-------|-----|
| `$color-blue--base` | `#0000FF` (pure blue -- link color) |
| `$color-blue--bright` | `#007BFF` |
| `$color-blue--lighter` | `#2F9AF7` |
| `$color-blue--light` | `#4895DD` |
| `$color-blue--x-light` | `#D1ECF1` |
| `$color-blue--1` | `#0C5460` |

### Recommended Palette

Consolidate to a focused set of **semantic design tokens** using CSS custom properties:

#### Core Brand

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-primary` | `#2d7a0a` | Primary brand green (slightly darker than current for better contrast) |
| `--color-primary-hover` | `#3a9c0e` | Interactive hover state |
| `--color-primary-light` | `#e8f5e1` | Light green backgrounds |
| `--color-primary-dark` | `#1d5a07` | Headings, emphasis |
| `--color-primary-surface` | `#f0f7ed` | Page background tints |

#### Accent / Secondary

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-accent` | `#0891b2` | Secondary actions, info badges (modernized from #00A1CB) |
| `--color-accent-light` | `#d1ecf1` | Info backgrounds |

#### Neutrals

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-gray-50` | `#f8f9fa` | Lightest surface |
| `--color-gray-100` | `#f1f3f5` | Surface |
| `--color-gray-200` | `#e9ecef` | Borders, dividers |
| `--color-gray-300` | `#dee2e6` | Stronger borders |
| `--color-gray-400` | `#adb5bd` | Disabled states |
| `--color-gray-500` | `#6c757d` | Secondary text |
| `--color-gray-600` | `#495057` | Body text |
| `--color-gray-700` | `#343a40` | Strong text |
| `--color-gray-900` | `#212529` | Headings, emphasis |

#### Semantic

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-warning` | `#d97706` | Warnings (slightly modernized) |
| `--color-danger` | `#dc3545` | Errors, destructive actions |
| `--color-link` | `#2563eb` | Links (modern blue, not #0000FF) |
| `--color-link-hover` | `#1d4ed8` | Link hover |

---

## 2. Typography

### Current State

- **Font**: Source Sans Pro (Google Fonts) with system fallback
- **Base size**: 16px
- **Headings**: Dark green (`$colour-header: #1d6607`) with `!important`
- **Custom scale**: 7 text size classes (`.text--smallest` to `.text--largest`)
- **Responsive variants**: 3 classes using `vw` units

### Recommended

- Keep Source Sans Pro -- it's a good, readable humanist sans-serif
- Adopt a standard type scale instead of custom classes
- Use CSS custom properties for the scale
- Remove `!important` from heading color

| Token | Size | Current Equivalent |
|-------|------|--------------------|
| `--text-xs` | 0.75rem (12px) | `.text--smallest` (0.6em) |
| `--text-sm` | 0.875rem (14px) | `.text--small` (0.9rem) |
| `--text-base` | 1rem (16px) | `.text--medium` |
| `--text-lg` | 1.125rem (18px) | (gap -- no equivalent) |
| `--text-xl` | 1.25rem (20px) | `.text--medium-large` (1.2rem) |
| `--text-2xl` | 1.5rem (24px) | `.text--large` |
| `--text-3xl` | 2rem (32px) | `.text--largest` |

---

## 3. Buttons

### Current State

Six button types: primary, secondary, white, danger, warning, link.

| Type | Appearance | Issues |
|------|-----------|--------|
| `.btn-primary` | Green fill, white text | `!important` on color |
| `.btn-secondary` | Green border, transparent bg, inverts on hover | Semantically confusing -- looks like an outline-primary |
| `.btn-white` | White bg, black border, hovers to **blue** | Jarring color shift on hover |
| `.btn-warning` | Orange fill | Has text-shadow (dated look) |
| `.btn-default` | White bg, green border | Also has text-shadow |
| `.btn-light` | Minimal, gray text | font-size forced to 0.8rem |

All use `!important` extensively (14 uses in buttons.scss alone), suggesting specificity conflicts with Bootstrap.

### Recommended

| Type | Appearance | Change |
|------|-----------|--------|
| Primary | Green fill, white text | Remove `!important`, adjust specificity properly |
| Secondary | Gray/neutral outline, inverts on hover | Not green -- secondary should be visually subordinate |
| Outline | Green border, transparent bg | What current "secondary" actually is |
| Ghost/Tertiary | Minimal with hover highlight | Replace btn-white with consistent hover |
| Danger | Red fill | Standard |
| Warning | Amber fill | Remove text-shadow |
| Link | Text-only with underline on hover | Standard |

---

## 4. Border Radius

### Current State

`$enable-rounded: false` -- all Bootstrap components have **square corners**. This gives the site a distinctly dated, pre-2018 aesthetic.

### Recommended

Enable rounding with a modest radius:

```scss
$enable-rounded: true;
$border-radius: 0.375rem;    // 6px - standard modern radius
$border-radius-sm: 0.25rem;  // 4px
$border-radius-lg: 0.5rem;   // 8px
$border-radius-pill: 50rem;  // pill shape
```

---

## 5. Shadows / Elevation

### Current State

No shadow system. The only shadow definition is on popper tooltips:
```css
--popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
```

Cards, modals, and dropdowns use Bootstrap defaults (minimal).

### Recommended

Introduce a 3-level shadow scale:

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards, inputs |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, sticky elements |

---

## 6. Spacing

### Current State

Uses Bootstrap's spacing utilities (m/p-1 through m/p-5) plus 80 lines of Bootstrap 4 compatibility shims (`.ml-*` -> `.ms-*`, `.mr-*` -> `.me-*`, etc.).

### Recommended

- Migrate remaining BS4 class usage in templates, then remove shims
- Bootstrap 5 spacing scale is fine as-is

---

## 7. Components

### Navbar Badges

Five near-identical badge classes (`.browsebadge`, `.mypostsbadge`, `.newsbadge`, `.communityeventsbadge`, `.volunteeropportunitiesbadge`) that differ only in their `right` position offset. Should be one `.nav-badge` class with the offset handled by the parent element's padding.

### Cards

Card headers use `.bg-success` and `.bg-info` with `!important` overrides. Should use semantic CSS custom properties instead.

### Modals

Z-index management uses arbitrary magic numbers (1030, 2000, 5000, 10000, 100000, 199999, 200000). Should use a defined z-index scale.

### Form Controls

Labels globally forced to `font-weight: bold` with `!important`. This prevents any lighter-weight label styling.

---

## 8. Icons

Font Awesome SVG icons via `vue-awesome`. Custom size classes (`.fa-8-75x`, `.fa-0-8x`, `.fa-1-5x`, `.fa-1-75x`, `.fa-bh`) suggest ad-hoc sizing. Should use a consistent icon size scale.

---

## 9. Layout

- Mobile-first with Bootstrap breakpoints
- Desktop navbar: ~80px
- Mobile bottom nav: 67px with post button overhang
- Sticky banner heights vary by device (73px-273px)
- Sidebar uses complex `calc()` chains

Layout is generally sound -- no changes recommended here.

---

## 10. Consistency Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Color variables defined | 80+ | ~25 semantic tokens |
| Green variants | 11 | 5 |
| Components with hardcoded hex colors | 158 (26.7%) | <10% |
| `!important` declarations in global CSS | 40+ | <10 |
| Bootstrap 4 compat shims | 80 lines | 0 |
| Near-duplicate utility classes | 5 badge classes | 1 |
| CSS custom properties used | 8 | 25+ (full token set) |
