# Adversarial Style Audit

A critical review of the current Freegle visual design, measured against modern web design standards and the proposed style board.

---

## Executive Summary

Freegle's frontend has grown organically over several years of Bootstrap 4-to-5 migration and feature development. While functionally solid, the visual design suffers from **inconsistency** (11 greens, mixed naming, hardcoded colors in 158 files), **dated aesthetics** (square corners, pure-blue links, text shadows on buttons), and **specificity debt** (40+ `!important` declarations in global CSS). This audit identifies concrete issues and prioritizes fixes by impact.

---

## Critical Issues

### 1. Square Corners Everywhere

**`$enable-rounded: false`** removes all border-radius from Bootstrap components. This is the single most impactful visual setting and immediately dates the site to pre-2018 design conventions.

Every modern web platform (Google, Apple, Meta, gov.uk, charity sites) uses subtle border-radius. Square corners communicate "enterprise legacy system" or "unfinished."

**Impact**: High (affects every button, card, input, modal, dropdown, badge, alert)
**Fix complexity**: Low (one variable change)

### 2. Link Color: Pure Blue #0000FF

The link color is literally `#0000FF` -- the browser default "blue" that hasn't been considered modern since the early 2000s. It's also the lowest-contrast commonly-used blue, creating accessibility concerns against light backgrounds.

Modern link blues: GitHub uses `#0969da`, Stripe uses `#635bff`, gov.uk uses `#1d70b8`.

**Impact**: High (links appear throughout every page)
**Fix complexity**: Low (one variable change)

### 3. The "Green Soup" Problem

The brand identity is green, which is appropriate for an environmental/reuse charity. But there are **11 distinct green values** that create visual noise rather than coherence:

- Primary actions: `#338808`
- Navbar: `#61AE24`
- Headings: `#1d6607`
- Secondary buttons: `#008000`
- Various borders: `#61A624`, `#3B8070`
- Backgrounds: `#E6ffE6`, `#CDE4DA`, `#84CF96`, `#f0f7ed`

The navbar green (`#61AE24`) doesn't match the button green (`#338808`), which doesn't match the heading green (`#1d6607`). A user sees three different "brand greens" on every page without understanding why.

**Impact**: High (brand inconsistency)
**Fix complexity**: Medium (requires cascading variable changes)

### 4. `!important` Specificity Wars

The buttons.scss file has **14 `!important` declarations** in 100 lines. global.scss adds another 26+. This is a symptom of fighting Bootstrap's specificity rather than working with it.

Consequences:
- Makes component-level overrides nearly impossible
- Forces future developers to also use `!important`
- Creates an escalating specificity arms race

**Impact**: Medium (developer experience, maintainability)
**Fix complexity**: Medium (requires careful specificity restructuring)

---

## Moderate Issues

### 5. Secondary Button Identity Crisis

`.btn-secondary` is styled as a **green outline button** -- visually it's an `outline-primary`. The word "secondary" in design systems universally means "visually subordinate to primary" -- typically gray/neutral.

When a user sees a green filled button next to a green outline button, both read as "primary action." There's no visual hierarchy.

Bootstrap's default secondary is gray (`#6c757d`). Overriding it to green defeats the purpose.

**Impact**: Medium (confusing action hierarchy on forms with multiple buttons)
**Fix complexity**: Low (button color change)

### 6. White Button Hover to Blue

`.btn-white` hovers from **white background to blue** (`$color-blue--light: #4895DD`). This is jarring -- the button completely changes its color identity on hover. Users expect hover states to be a subtle intensification of the resting state, not a different color entirely.

**Impact**: Medium (unexpected visual behavior)
**Fix complexity**: Low

### 7. Text Shadows on Buttons

`.btn-warning` and `.btn-default` use `text-shadow: 0 -1px 0 rgba(0,0,0,0.33)`. Text shadows on UI controls were a Bootstrap 2/3 era convention and look outdated. Modern flat/material design eliminated these.

**Impact**: Low-Medium (dated appearance)
**Fix complexity**: Low (remove the declarations)

### 8. Hardcoded Colors in 158 Components

26.7% of Vue components bypass the SCSS variable system entirely and use hardcoded hex values. The worst offenders have 40-58 hardcoded colors each (ModSystemLogEntry, ModSupportAIAssistant).

Common repeated values that should be variables:
- `#f8f9fa` (light background) -- 13+ files
- `#dee2e6` (border) -- 8+ files
- `#e9ecef` (medium gray) -- 10+ files
- `#6c757d` (gray text) -- 7+ files
- `#28a745` (green) -- 4+ files

**Impact**: Medium (inconsistency, hard to change brand colors)
**Fix complexity**: High (158 files to update over time)

### 9. Bootstrap 4 Compatibility Shims

80 lines of `@extend` rules mapping `.ml-*` to `.ms-*`, `.mr-*` to `.me-*`, `.pl-*` to `.ps-*`, etc. Plus `.font-weight-bold` to `.fw-bold`. These suggest an incomplete BS4-to-BS5 migration.

Every `@extend` adds CSS output. These shims should be migrated in templates and removed.

**Impact**: Low (code bloat, developer confusion about which classes to use)
**Fix complexity**: Medium (template search-and-replace, then remove shims)

---

## Minor Issues

### 10. Duplicate Navbar Badges

Five separate badge classes that share 95% of their CSS:

```scss
.browsebadge      { position: absolute; top: 2px; right: -6px;  font-size: 11px; background-color: $colour-secondary; color: white; }
.mypostsbadge     { position: absolute; top: 2px; right: 4px;   font-size: 11px; background-color: $colour-secondary; color: white; }
.newsbadge        { position: absolute; top: 2px; right: 10px;  font-size: 11px; background-color: $colour-secondary; color: white; }
.communityeventsbadge { position: absolute; top: 2px; right: -2px; font-size: 11px; background-color: $colour-secondary; color: white; }
.volunteeropportunitiesbadge { position: absolute; top: 2px; right: 9px; font-size: 11px; background-color: $colour-secondary; color: white; }
```

Should be one `.nav-badge` class. The `right` offset should be on the parent, or the badge should be positioned relative to the icon.

### 11. Naming Inconsistency

Mixed British/American spelling (`$colour-success` vs `$color-green-background`), semantic vs descriptive names (`$colour-warning` vs `$color-blue--bright`), and numbered variants (`$color-gray-1` through `$color-gray-4` that aren't ordered by lightness and aren't even gray).

### 12. No Design Tokens for Shadows

Cards, modals, and dropdowns have no consistent shadow. The site feels flat in places where subtle depth would improve scannability (card grids, dropdown menus).

### 13. Stories Page Visual Monotony

The stories page is a long wall of alternating green header bars and white content. Every story has the same green-on-white treatment with no visual variation. Feels like a spreadsheet rather than engaging content.

### 14. Opacity Variable Explosion

27 opacity variants (11 white + 14 black + 2 gray) when most projects need 3-4. Many appear used in only one place. This is configuration pretending to be a system.

---

## Prioritized Fix List

| Priority | Issue | Effort | Visual Impact |
|----------|-------|--------|---------------|
| P0 | Enable border-radius | 1 line | Transforms entire site feel |
| P0 | Modern link color | 1 line | Every page |
| P1 | Consolidate green palette to 5 tokens | ~20 lines | Brand consistency |
| P1 | Introduce CSS custom properties | ~40 lines | Foundation for all other fixes |
| P1 | Fix secondary button to neutral | ~5 lines | Action hierarchy |
| P1 | Fix white button hover | ~3 lines | Interaction consistency |
| P2 | Remove text shadows from buttons | ~2 lines | Modern appearance |
| P2 | Remove `!important` from button styles | ~30 lines | Maintainability |
| P2 | Add shadow scale tokens | ~10 lines | Depth and polish |
| P3 | Consolidate navbar badges | ~20 lines | Code quality |
| P3 | Migrate BS4 shims | ~80 templates | Code health |
| P3 | Fix hardcoded colors in components | 158 files | Long-term consistency |

---

## What's Working Well

- **Brand color is distinctive** -- green for a reuse charity is perfect
- **Source Sans Pro** is an excellent typeface choice -- readable, friendly, professional
- **Bootstrap 5 foundation** is solid and well-configured (selective imports reduce bloat)
- **Mobile-first responsive design** is well-implemented
- **Component scoping** -- 54% of components use scoped styles, limiting pollution
- **Navbar layout** is clean and functional on both mobile and desktop
- **Give/Find flow** has a clear, focused step-by-step wizard UX

---

## Round 2 Audit (Post-Modernization)

### Completed Fixes

| Priority | Issue | Status |
|----------|-------|--------|
| P0 | Enable border-radius | DONE - `$enable-rounded: true` with 6px default |
| P0 | Modern link color | DONE - `#0000FF` → `#2563eb` |
| P1 | Introduce CSS custom properties | DONE - `_design-tokens.scss` with 25+ tokens |
| P1 | Fix secondary button to neutral | DONE - gray outline instead of green |
| P1 | Fix white button hover | DONE - subtle gray instead of jarring blue |
| P2 | Remove text shadows from buttons | DONE |
| P2 | Add shadow scale tokens | DONE - 3-level shadow system |
| P3 | Consolidate navbar badges | DONE - 5 classes → 1 |
| P3 | Migrate BS4 shims | DONE - 640 replacements, shims removed |
| P3 | Fix hardcoded colors in components | DONE - 4 key components fixed |
| -- | Variable naming standardization | DONE - `$colour-*` → `$color-*` across 58 files |
| -- | Remove unused color variables | DONE - 28 variables removed |

### Round 3: Comprehensive Token Migration (2026-03-20)

Systematic sweep of ~400 hardcoded values across 131 files:

| Category | Replacements | Files | Notes |
|----------|-------------|-------|-------|
| Border-radius | ~90 | 60+ | All px values → `var(--radius-sm/md/lg/xl)` |
| Box-shadows | ~95 | 65+ | All rgba → `var(--shadow-sm/md/lg/xl)` |
| Transitions | 125 durations + 26 missing hovers | 62 | `0.2s` → `var(--transition-normal)` etc. |
| Colors (SCSS) | ~200 | 39+ | Hex → `$color-*` variables |
| Colors (templates/JS) | ~20 | 10+ | Inline hex → `var(--color-*)` |

Additional fixes:
- Landing page: hero glass card border-radius + shadow, location input double-border
- Photo count pills: added missing border-radius on MessageSummary/MicroVolunteering
- Autocomplete dropdown: modernized (font-family, shadow, radius, hover states)
- Social login buttons: 4px radius (brand guidelines)
- Login modal: bolder switch button, visible forgot-password link
- Chat page: strengthened Photo button and text contrast
- Navbar badges: restored per-badge right offsets (consolidation broke icon overlap)
- btn-white/btn-default: strengthened border from gray-300 to gray-400
- Modtools: synced design tokens, fixed ModMember.vue undefined SCSS variable

New design tokens added:
- `--radius-xl: 1.25rem` (chat bubbles, hero cards)
- `--shadow-xl: 0 10px 30px rgba(0,0,0,0.15)` (modals, overlays)
- `--transition-slow: 300ms ease-in-out` (transforms, layout)

### Remaining Issues

#### Still Needed

1. **`!important` proliferation** (PARKED) - 538 declarations across 72 files. Proper fix requires specificity restructuring. High risk of layout breakage.

2. **Typography scale enforcement** (PARKED) - 45% of font-sizes off the defined 7-step scale. Needs visual regression testing infrastructure before changes.

3. **No dark mode foundation** - CSS custom properties are now in place. Adding `@media (prefers-color-scheme: dark)` overrides would be straightforward.

4. **Stories page visual monotony** - Still a wall of identical green-on-white cards.

5. **Inconsistent icon sizing** - Custom `.fa-8-75x`, `.fa-0-8x` etc. Should use a defined scale.

6. **Form label `font-weight: bold`** - Global `!important` prevents lighter-weight labels.

### Metrics After Round 3

| Metric | Before | Round 2 | Round 3 | Target |
|--------|--------|---------|---------|--------|
| Color variables defined | 115 (80+) | 87 (~52) | 87 (~52) | ~25 tokens |
| Components with hardcoded hex | 158 (26.7%) | ~150 (~25%) | ~30 (~5%) | <10% |
| Hardcoded box-shadow | 115+ | 115+ | ~20 (focus rings only) | 0 reachable |
| Hardcoded border-radius | 150+ | 150+ | ~10 (intentional) | 0 reachable |
| Hardcoded transition durations | 109 | 109 | ~10 (non-standard easing) | 0 reachable |
| `!important` in global CSS | 40+ | 35+ | 35+ | <10 (parked) |
| Bootstrap 4 compat shims | 97 lines | 0 | 0 | 0 |
| CSS custom properties | 8 | 25+ | 30+ | 30+ |
| Shadow system | None | 3-level | 4-level | 4-level |
| Transition tokens | None | 2 | 3 | 3 |
| Border radius tokens | 3 | 3 | 4 | 4 |
