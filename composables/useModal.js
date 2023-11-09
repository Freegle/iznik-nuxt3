import { onUnmounted } from 'vue'

export function useModal() {
  const modal = ref()
  const isShown = ref(false)

  onMounted(() => {
    show()
  })

  function show() {
    modal.value.show()
    isShown.value = true
  }

  function hide() {
    modal.value?.hide()
    isShown.value = false
  }

  const unregisterNavigationGuard = useRouter().beforeEach((to, from, next) => {
    if (to?.query?.noguard) {
      // This is a special query parameter we add to skip the guard.  This is used when we are navigating from
      // within a modal where the guard would otherwise suppress the navigation because it thinks we are trying
      // to use the back button to close the modal.
      next()
    } else if (isShown.value) {
      hide()
      next(false)
    } else {
      next()
    }
  })

  onUnmounted(unregisterNavigationGuard)

  return { modal, show, hide }
}
