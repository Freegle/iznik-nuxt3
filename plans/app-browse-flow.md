# App Browse & Item Detail Flow Redesign

## Overview

This plan redesigns the browse experience and item detail view for the Freegle mobile app, creating a modern, engaging interface that feels native and enjoyable to use.

## Goals

1. Create a full-screen, immersive item detail experience
2. Make photo viewing intuitive with pinch-to-zoom and swipe gestures
3. Use progressive disclosure to keep the UI clean
4. Replace text-heavy layouts with visual representations
5. Maintain functionality while reducing visual clutter

---

## Research Summary

### Competitor Analysis

**Depop/Vinted Style:**
- Instagram-like grid layout for browse
- Large, prominent photos in listings
- Social features (likes, shares) visually represented
- AI-powered listing creation
- Youth-oriented, trendy feel

**OfferUp/Letgo Style:**
- Local-first, proximity-based discovery
- Large photo thumbnails in browse grid
- Quick photo capture and listing
- Trust indicators (ratings, verification badges)
- Clean, minimal detail views

**Facebook Marketplace:**
- Full-width photo carousels
- Swipe between photos horizontally
- Collapsible description sections
- Floating action button for messaging
- Location shown as small map chip

### UX Best Practices (from research)

1. **Photo Gestures (Baymard Institute):**
   - 40% of mobile e-commerce sites fail to support pinch/double-tap zoom
   - Both gestures should be supported (no single convention)
   - High-resolution images required for zoom to be useful

2. **Carousel Navigation (Nielsen Norman Group):**
   - Users expect swipe gestures on mobile carousels
   - Most users stop after 3-4 items - keep carousel small
   - Provide visual cues (dots, partial next image visibility)
   - Add bounce effect at end to indicate limits

3. **Progressive Disclosure (Shopify/IxDF):**
   - Lead with essential information first
   - Use clear affordances ("Learn more", icons, arrows)
   - Minimize clicks and modal interruptions
   - Let users control the pace of information reveal

---

## Design Specification

### 1. Full-Screen Item Detail Modal

**Navigation:**
- Back arrow (top-left) instead of X (top-right)
- Swipe right from left edge to go back (iOS-style gesture)
- No visible modal chrome - should feel like a native page
- Status bar visible (safe area respected)

**Structure:**
```
+----------------------------------+
| < Back          [Share] [Heart]  |  <- Minimal header
+----------------------------------+
|                                  |
|                                  |
|       [PHOTO AREA - 60%]         |  <- Primary focus
|                                  |
|                                  |
+----------------------------------+
|  [Info Section - Scrollable]     |  <- Secondary
|  - Item name                     |
|  - Distance indicator (visual)   |
|  - Quick stats row               |
|  - Description (collapsed)       |
|  - Map thumbnail                 |
+----------------------------------+
|  [Reply Button - Fixed Footer]   |  <- CTA
+----------------------------------+
```

### 2. Photo Display Strategies

#### A. Single Photo Layout
- Photo fills 60% of viewport height
- Tap to enter full-screen lightbox mode
- Double-tap or pinch to zoom inline
- Subtle "Tap to zoom" hint on first view

#### B. Multiple Photos Layout
- Horizontal swipe carousel with dot indicators
- Show edge of next photo as visual hint (~15px)
- Counter badge: "1/4" in corner
- Swipe to navigate, tap for lightbox
- In lightbox: full swipe gallery with zoom

#### C. No Photo Layout
- Display large type icon based on category
- Gradient background in Freegle brand colors
- Or: Abstract pattern/illustration
- Item name displayed prominently over the visual

**Lightbox (Full-screen Photo View):**
- Pinch-to-zoom with smooth animation
- Pan when zoomed
- Double-tap to toggle zoom levels (1x, 2x, fit)
- Swipe up/down to dismiss (with velocity-based animation)
- Swipe left/right for next/previous photo
- Photo counter and download button visible
- Background dims to black

### 3. Information Hierarchy (Visual First)

**Quick Stats Row (replaces text):**
```
+----------------------------------+
| [🕐 2h]  [📍 0.3mi]  [💬 3]      |
|  Posted   Distance    Replies    |
+----------------------------------+
```

- Use compact visual chips instead of full text
- Distance shown as small number with icon
- Reply count as badge (clickable to see who replied)
- Posted time in relative format

**Item Details:**
```
+----------------------------------+
| Sony TV 42" - Working            |  <- Item name (prominent)
| [OFFER] • Electronics            |  <- Type badge + category
+----------------------------------+
| [See description ∨]              |  <- Collapsed by default
+----------------------------------+
| [Map thumbnail - small]          |  <- ~80px height
| Approximate location • 0.3 mi    |
+----------------------------------+
```

**Description Section:**
- Collapsed by default with first 2 lines preview
- "See more ∨" tap target
- Expands inline (no modal)
- Full text with preserved formatting

### 4. Progressive Disclosure for Reply

**Initial State:**
- Single "Reply" button in fixed footer
- Clean, uncluttered view focused on the item

**After Tap "Reply":**
- Footer expands upward with smooth animation
- Reveals:
  - Text input field (auto-focused, keyboard appears)
  - Quick reply suggestions: "Is this still available?", "Can I collect today?"
  - Character count (optional)
- User can tap outside or swipe down to dismiss

**Reply Input:**
```
+----------------------------------+
| [Suggested: "Is this available?"] |
+----------------------------------+
| [Your message here...]           |
|                        [Send ->] |
+----------------------------------+
```

### 5. Map Integration

**Current Problem:**
- Map takes up significant space
- Often not immediately useful
- Adds to visual clutter

**New Approach:**
- Small thumbnail map (~80px height) showing approximate area
- Tap to expand to larger interactive map
- Or: Show as location chip "Near: Loughborough, 0.3mi"
- Full map accessible but not prominent

**Map Chip Alternative:**
```
+----------------------------------+
| 📍 Near Loughborough  [See map]  |
|    0.3 miles away                |
+----------------------------------+
```

### 6. Visual Representation Instead of Tables

**Current (Text-Heavy):**
```
Posted: 2 hours ago
Location: Loughborough
Type: Offer
Replies: 3 people interested
Available: 1 item
```

**New (Visual Compact):**
```
+------+------+------+------+
|  🕐  |  📍  |  💬  |  📦  |
|  2h  | 0.3mi|   3  |   1  |
+------+------+------+------+
```

Or as inline badges:
```
[2h ago] [0.3mi] [3 replies] [1 available]
```

### 7. Browse List Card Redesign

The current `MessageSummary.vue` uses a complex CSS grid layout with many elements (title, history, description, image, expand button). For mobile app, we need a cleaner, more modern card design.

#### Current Problems with Browse Cards

1. **Too much text** - Description, history, location all visible at once
2. **Complex grid layout** - Different on mobile vs desktop, hard to maintain
3. **Small touch targets** - "See details and reply" button is small
4. **No visual hierarchy** - Everything competes for attention
5. **Prominent button** - "See details and reply" feels like desktop UI

#### New Card Design - "Photo First"

**Mobile Card Layout (App):**
```
+----------------------------------+
|                                  |
|      [PHOTO - 70% height]        |
|                                  |
|    [0.3mi]              [OFFER]  |  <- Overlays on photo
+----------------------------------+
| Kids Bike - working condition    |  <- Title only
| Loughborough • 2h ago            |  <- Location + time
+----------------------------------+
```

**Key Changes:**
- Photo dominates the card (70%+ of card height)
- Distance badge overlays bottom-left of photo
- Type badge (OFFER/WANTED) overlays bottom-right
- Only item name visible below photo
- Location and time as small subtitle
- NO description preview - save for detail view
- NO "See details" button - whole card is tappable

#### Card Variations

**With Photo:**
- Photo fills top portion
- Subtle gradient at bottom of photo for overlay readability
- Title and meta below

**Without Photo:**
- Gradient background using Freegle brand colors
- Large category icon centered
- Item name overlaid on gradient
- Same meta info below

**Promised/Reserved:**
- Semi-transparent overlay with "Reserved" badge
- Slightly dimmed but still visible

**Freegled/Completed:**
- Grayscale filter
- "Freegled!" badge overlay
- Or: Remove from list entirely

#### Card Sizes

**Grid View (2 columns):**
- Square aspect ratio (1:1)
- Photo cropped to fill
- Minimal text (title only, truncated)

**List View (1 column):**
- 16:9 aspect ratio
- More room for subtitle
- Optional: Show first line of description

**App-Specific Cards:**
Create new `MessageCardApp.vue` for mobile:
- Optimized touch targets (min 44px)
- No hover states (mobile doesn't have hover)
- Haptic feedback on tap
- Press-and-hold for quick actions

#### Visual Refinements

**Rounded Corners:**
- 12-16px radius for modern feel
- Consistent across cards

**Shadows:**
- Subtle, soft shadow (not harsh box-shadow)
- `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`

**Typography:**
- Item name: 16px, medium weight, 2 lines max
- Meta: 13px, regular weight, muted color
- No all-caps except for badges

**Colors:**
- OFFER badge: Green background, white text
- WANTED badge: Blue/purple background, white text
- Distance: Semi-transparent dark background
- Time: Gray text, no background

#### Animation & Interaction

**On Tap:**
- Scale down slightly (0.98) with 100ms ease
- Release scales back up
- Opens full-screen detail

**On Long Press (500ms):**
- Quick actions menu (Share, Hide, Report)
- Haptic feedback

**Scroll Behavior:**
- Cards lazy-load as they enter viewport
- Skeleton placeholders during load
- Smooth scroll snap for grid view (optional)

---

## Implementation Tasks

### Phase 1: Browse Card Redesign
1. Create new `MessageCardApp.vue` component for mobile app
2. Implement photo-first card layout with overlaid badges
3. Create no-photo fallback with gradient/icon
4. Add tap animation and haptic feedback
5. Implement long-press quick actions menu

### Phase 2: Browse Page for App
6. Create `/browse/app/index.vue` - simplified mobile browse
7. Implement 2-column grid layout with scroll snap
8. Add skeleton loading placeholders
9. Optimize lazy loading for cards

### Phase 3: Item Detail - Core Infrastructure
10. Create `/browse/app/[id].vue` - full-screen item detail
11. Implement full-screen modal wrapper component
12. Add swipe-to-go-back gesture support (edge detection)
13. Create shared photo lightbox component with zoom

### Phase 4: Item Detail - Photo Experience
14. Implement multi-photo carousel with swipe
15. Add pinch-to-zoom using existing `zoompinch` library
16. Create fallback visuals for no-photo posts
17. Implement swipe-to-dismiss in lightbox

### Phase 5: Item Detail - Information Display
18. Create visual stats chips component
19. Implement collapsible description section
20. Create compact map thumbnail component
21. Add location chip alternative

### Phase 6: Reply Flow
22. Implement expandable reply footer (bottom sheet pattern)
23. Add quick reply suggestions
24. Create smooth expand/collapse animations
25. Integrate with existing chat/message system

### Phase 7: Polish & Refinement
26. Add micro-interactions and animations
27. Implement haptic feedback on key actions
28. Performance optimization for image loading
29. Accessibility review and improvements
30. Cross-platform testing (iOS/Android differences)

---

## Technical Considerations

### Existing Code to Leverage
- `ImageCarousel.vue` - Has zoom buttons, but needs swipe gestures
- `PinchMe.vue` - Already uses `zoompinch` library
- `MessagePhotosModal.vue` - Full-screen photo modal exists
- `MessageExpanded.vue` - Current detail view layout

### New Components Needed

**Browse Components:**
- `MessageCardApp.vue` - Photo-first mobile card
- `MessageCardSkeleton.vue` - Loading placeholder
- `QuickActionsSheet.vue` - Long-press actions bottom sheet

**Detail Components:**
- `AppMessageDetail.vue` - Full-screen item view
- `PhotoLightbox.vue` - Enhanced zoom/swipe gallery
- `ExpandableReplyFooter.vue` - Progressive reply UI (bottom sheet)
- `VisualStatsRow.vue` - Compact stat badges
- `MapThumbnail.vue` - Small inline map preview
- `NoPhotoPlaceholder.vue` - Gradient/icon fallback for posts without photos

### Libraries to Consider
- `vue3-touch-events` - Simple swipe/tap/hold directives for Vue 3
- Existing `zoompinch` - Already in use, needs configuration
- CSS `scroll-snap` - For native-feeling carousel
- Ionic Gestures (`@ionic/vue`) - More advanced gesture control if needed

**Note:** `vue3-touch-events` is recommended for simplicity:
```javascript
// Setup
import Vue3TouchEvents from "vue3-touch-events"
app.use(Vue3TouchEvents)

// Usage in template
<div v-touch:swipe.left="handleSwipeLeft" v-touch:swipe.right="handleSwipeRight">
```

### Known Capacitor Issue
When using Capacitor with Vue Router and iOS swipe-back gestures enabled, scrolling before navigation can cause blank pages on swipe-back. May need to disable native swipe-back and implement custom gesture handling, or avoid `scrollBehavior` in router config.

### Performance Notes
- Lazy load photos below the fold
- Use Uploadcare transforms for appropriate sizes
- Preload adjacent photos in carousel
- Consider skeleton loading states

---

## Potential Issues & Mitigations

### Issue 1: Gesture Conflicts
**Problem:** Swipe-to-go-back may conflict with photo carousel swipe
**Mitigation:**
- Use edge detection (back gesture only from screen edge)
- Disable back gesture when in photo lightbox
- iOS already handles this natively in Capacitor

### Issue 2: Keyboard Push on Reply
**Problem:** Keyboard appearing may push content awkwardly
**Mitigation:**
- Use `visualViewport` API to detect keyboard
- Animate reply section to stay above keyboard
- Consider bottom sheet pattern instead of inline expansion

### Issue 3: No-Photo Posts Look Empty
**Problem:** Without photos, the detail view may feel sparse
**Mitigation:**
- Rich placeholder graphics (category icons, illustrations)
- Larger item name typography
- More prominent location/map section
- Add visual interest through color/gradient

### Issue 4: Map Load Performance
**Problem:** Loading maps for every detail view is expensive
**Mitigation:**
- Use static map image initially (no JS)
- Load interactive map only on tap
- Cache map tiles aggressively
- Consider OpenStreetMap static tiles

### Issue 5: Accessibility Concerns
**Problem:** Gesture-only navigation excludes some users
**Mitigation:**
- Always provide tap targets as alternatives
- Screen reader announcements for carousel position
- Respect reduced motion preferences
- Ensure all actions are keyboard accessible

### Issue 6: Reply When Not Logged In
**Problem:** User flow when tapping reply while logged out
**Mitigation:**
- Show login prompt inline (not separate page)
- After login, return to same item with reply expanded
- Consider storing reply intent during auth flow

---

## Open Questions for Discussion

1. **Animation Library:** Should we use a dedicated animation library (e.g., Motion One) or stick with CSS transitions?

2. **Carousel Style:** Dots vs counter vs partial-preview for indicating multiple photos?

3. **Reply Suggestions:** Should quick replies be hardcoded or context-aware (e.g., based on item type)?

4. **Save/Favorite:** Should we add a save/favorite feature as part of this redesign?

5. **Share Functionality:** What share options should be available? (Copy link, native share sheet, social media?)

---

## Success Metrics

- Increased time spent on item detail pages
- Higher reply rate (conversion from view to reply)
- Reduced bounce rate on item pages
- Positive user feedback on "feel" and usability
- No increase in accessibility complaints

---

## References

- [Baymard: Mobile Image Gestures](https://baymard.com/blog/mobile-image-gestures)
- [Nielsen Norman: Mobile Carousels](https://www.nngroup.com/articles/mobile-carousels/)
- [Smashing Magazine: Carousel UX](https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux/)
- [UXPin: Progressive Disclosure](https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/)
- [Depop Redesign Case Study](https://ankithavasudev.com/depop-redesign)
- [Product Page UX Guidelines 2024](https://onilab.com/blog/product-page-ux)
