/**
 * Interaction capture plugin.
 *
 * Captures user interactions (clicks, scrolls, swipes, modal events) and logs them
 * with full context including Vue component names and human-readable labels.
 */
import { useLoggingContextStore } from '~/stores/loggingContext'
import { action } from '~/composables/useClientLog'

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  const ctx = useLoggingContextStore()

  // Capture phase - sees events before handlers, passive = non-blocking.
  const options = { capture: true, passive: true }

  // Click events.
  document.addEventListener(
    'click',
    (e) => captureInteraction('click', e),
    options
  )
  document.addEventListener(
    'dblclick',
    (e) => captureInteraction('dblclick', e),
    options
  )
  document.addEventListener(
    'contextmenu',
    (e) => captureInteraction('rightclick', e),
    options
  )

  // Touch events.
  let touchStart = null
  document.addEventListener(
    'touchstart',
    (e) => {
      touchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      }
    },
    options
  )
  document.addEventListener(
    'touchend',
    (e) => {
      if (!touchStart) return

      const dx = e.changedTouches[0].clientX - touchStart.x
      const dy = e.changedTouches[0].clientY - touchStart.y
      const dt = Date.now() - touchStart.time

      // Detect swipe (>50px in <300ms).
      if (dt < 300 && (Math.abs(dx) > 50 || Math.abs(dy) > 50)) {
        const direction =
          Math.abs(dx) > Math.abs(dy)
            ? dx > 0
              ? 'right'
              : 'left'
            : dy > 0
            ? 'down'
            : 'up'

        captureInteraction('swipe', {
          target: e.target,
          direction,
          distance: Math.round(Math.sqrt(dx * dx + dy * dy)),
        })
      }

      touchStart = null
    },
    options
  )

  // Form interactions.
  document.addEventListener(
    'change',
    (e) => captureInteraction('change', e),
    options
  )
  document.addEventListener(
    'submit',
    (e) => captureInteraction('submit', e),
    options
  )

  // Scroll (throttled).
  let scrollTimeout
  document.addEventListener(
    'scroll',
    () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          const scrollY = window.scrollY
          const maxScroll = document.body.scrollHeight - window.innerHeight
          captureInteraction('scroll', {
            target: document.scrollingElement,
            scrollY,
            scrollPercent:
              maxScroll > 0 ? Math.round((scrollY / maxScroll) * 100) : 0,
          })
          scrollTimeout = null
        }, 500)
      }
    },
    options
  )

  // Modal observation - track modal stack for context.
  // Note: useClientLog handles modal open/close logging, we just track the stack here.
  document.addEventListener('shown.bs.modal', (e) => {
    const modalEl = e.target
    const modalName = getModalName(modalEl)
    ctx.pushModal(modalName)
  })

  document.addEventListener('hidden.bs.modal', () => {
    ctx.popModal()
  })

  function captureInteraction(type, event) {
    const target = event.target
    if (!target || target === document.body) return

    const info = extractElementInfo(target)
    if (!info) return // Ignore non-meaningful elements.

    logInteraction({
      type,
      ...info,
      ...(event.direction && { direction: event.direction }),
      ...(event.distance && { distance: event.distance }),
      ...(event.scrollY !== undefined && {
        scrollY: event.scrollY,
        scrollPercent: event.scrollPercent,
      }),
    })
  }

  function logInteraction(entry) {
    // Log to console in development.
    if (import.meta.dev) {
      console.log('[interaction]', entry)
    }

    // Build action name from type and label.
    const actionName = entry.label
      ? `${entry.type}: ${entry.label}`
      : entry.type

    // Use the existing client log infrastructure.
    action(actionName, {
      event_type: 'interaction',
      interaction_type: entry.type,
      component: entry.component,
      tag: entry.tag,
      element_id: entry.id,
      classes: entry.classes,
      href: entry.href,
      input_type: entry.inputType,
      direction: entry.direction,
      distance: entry.distance,
      scroll_y: entry.scrollY,
      scroll_percent: entry.scrollPercent,
      ...ctx.getContext(),
    })
  }
})

// Helper functions.

function getModalName(el) {
  // Try to get a meaningful name from the modal element.
  return (
    el.getAttribute('aria-label') ||
    el.getAttribute('data-modal-name') ||
    el.querySelector('.modal-title')?.textContent?.trim() ||
    getVueComponentName(el) ||
    el.id ||
    'Modal'
  )
}

function extractElementInfo(el) {
  // Find meaningful interactive element.
  const interactive = el.closest(
    'button, a, [role="button"], input, select, textarea, ' +
      '[onclick], [tabindex]:not([tabindex="-1"]), label, ' +
      '.btn, [data-bs-toggle]'
  )

  const target = interactive || el

  // Skip non-meaningful elements.
  if (target === document.body || target === document.documentElement) {
    return null
  }

  return {
    component: getVueComponentName(target),
    label: getLabel(target),
    tag: target.tagName.toLowerCase(),
    id: target.id || null,
    classes: getCleanClasses(target),
    href: target.href ? stripQueryParams(target.href) : null,
    inputType: target.type || null,
  }
}

function getVueComponentName(el) {
  // Vue 3: walk up to find component.
  let current = el
  while (current && current !== document.body) {
    // Vue 3 attaches component to __vueParentComponent.
    const vueComponent = current.__vueParentComponent
    if (vueComponent) {
      const name =
        vueComponent.type?.name ||
        vueComponent.type?.__name ||
        vueComponent.type?.__file?.match(/([^/]+)\.vue$/)?.[1]
      if (name && !name.startsWith('_')) {
        return name
      }
    }
    current = current.parentElement
  }
  return null
}

function getLabel(el) {
  // Priority order for human-readable label.
  return (
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    el.getAttribute('data-label') ||
    getVisibleText(el) ||
    el.getAttribute('alt') ||
    el.getAttribute('placeholder') ||
    el.getAttribute('name') ||
    null
  )
}

function getVisibleText(el) {
  const text = el.innerText?.trim()
  if (!text) return null

  // Clean up whitespace.
  const clean = text.replace(/\s+/g, ' ')

  // Skip if too long (probably not a label).
  if (clean.length > 100) return null

  // Skip if looks like content not a label.
  if (clean.includes('\n') && clean.length > 50) return null

  return clean
}

function getCleanClasses(el) {
  // Return meaningful classes, skip utility classes.
  const skip = /^(d-|p-|m-|col-|row|container|flex|text-|bg-|border-)/
  return (
    [...el.classList]
      .filter((c) => !skip.test(c))
      .slice(0, 3)
      .join(' ') || null
  )
}

function stripQueryParams(url) {
  try {
    const u = new URL(url)
    return u.pathname
  } catch {
    return url
  }
}
