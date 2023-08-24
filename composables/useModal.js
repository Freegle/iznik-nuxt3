import { useRouter } from 'vue-router'
import { onUnmounted } from 'vue'

export function useModal(emit) {
  const router = useRouter()

  const showModal = ref(false)

  // Register a hook for routing so that we can close the modal rather than move route.  This is to handle the
  // back button case, where you expect the back button to close the modal.
  //
  // This is a bit of a hack, but there doesn't seem to be a good way to do it.  If we have routed to a chat
  // from within a modal then make sure we route to it - this is a case that happens if you Message someone from
  // a modal on mobile.
  const unregisterRouterGuard = router.beforeEach((to, from, next) => {
    if (!to.path.includes('/chats')) {
      back(next)
    } else {
      // It's to a chat.
      next()
    }
  })

  onUnmounted(() => {
    unregisterRouterGuard()
  })

  function show() {
    showModal.value = true
  }

  function hide() {
    emit('hide')
    showModal.value = false
  }

  function back(next) {
    if (showModal.value) {
      // Back should close the modal
      showModal.value = false
    } else {
      // No modal open - proceed with back.
      next()
    }
  }

  return {
    showModal,
    show,
    hide,
    back,
  }
}
