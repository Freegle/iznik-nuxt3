import { computed } from 'vue'

// Get the preferred non-platform email for a user object.
export function getPreferredEmail(u) {
  if (!u) return null

  if (u.email) return u.email

  if (u.emails?.length) {
    let best = null
    for (const e of u.emails) {
      if (!e.ourdomain && (!best || e.preferred)) {
        best = e.email
      }
    }
    return best
  }

  return null
}

// Composable version — takes a ref, returns a computed.
export function usePreferredEmail(userRef) {
  return computed(() => getPreferredEmail(userRef.value))
}
