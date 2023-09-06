import { nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useModal(props, emit) {
  // the modals are hidden by default
  const show = ref(false)

  watch(show, (value) => {
    emit('update:modelValue', value)
  })

  watch(
    () => props.modelValue,
    (value) => {
      show.value = value
    }
  )

  // If the component has been instantiated with modelValue true, then there is an odd problem which means
  // the modal animation doesn't work.  By using nextTick and a separate variable to control the modal
  // show, we can make the modal animation work.
  if (props.modelValue) {
    nextTick().then(() => {
      show.value = true
    })
  }

  // Register a hook for routing so that we can close the modal rather than move route.  This is to handle the
  // back button case, where you expect the back button to close the modal.
  //
  // This is a bit of a hack, but there doesn't seem to be a good way to do it.  If we have routed to a chat
  // from within a modal then make sure we route to it - this is a case that happens if you Message someone from
  // a modal on mobile.
  const unregisterRouterGuard = useRouter().beforeEach((to, from, next) => {
    if (!to.path.includes('/chats')) {
      back(next)
    } else {
      // It's to a chat.
      next()
    }
  })

  function back(next) {
    if (show.value) {
      // Back should close the modal
      show.value = false
    } else {
      // No modal open - proceed with back.
      next()
    }
  }

  onUnmounted(() => {
    unregisterRouterGuard()
  })

  return { show }
}
