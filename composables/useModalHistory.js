import { onMounted, onUnmounted, unref } from 'vue'
import { action } from '~/composables/useClientLog'

/**
 * Composable that makes browser back button/swipe close the modal
 * instead of navigating away from the page.
 *
 * Usage:
 *   const emit = defineEmits(['hidden'])
 *   useModalHistory('my-modal-name', () => emit('hidden'))
 *
 * With condition (for optional modals):
 *   useModalHistory('my-modal-name', () => emit('hidden'), props.isModal)
 */
export function useModalHistory(modalId, onClose, enabled = true) {
  let isActive = false

  function handlePopState(e) {
    const willClose = isActive && e.state?.modal !== modalId

    // Log popstate event for debugging mobile navigation issues.
    action('modal_history_popstate', {
      modal_id: modalId,
      is_active: isActive,
      event_state: e.state ? JSON.stringify(e.state) : null,
      will_close: willClose,
    })

    if (willClose) {
      // Back was pressed, close the modal
      onClose()
    }
  }

  onMounted(() => {
    // Only activate if enabled (supports refs and plain values)
    if (!unref(enabled)) return

    // Push a history state so back gesture closes modal instead of navigating
    history.pushState({ modal: modalId }, '')

    action('modal_history_push', {
      modal_id: modalId,
    })

    window.addEventListener('popstate', handlePopState)
    isActive = true
  })

  onUnmounted(() => {
    if (isActive) {
      window.removeEventListener('popstate', handlePopState)
      isActive = false
    }
  })
}
