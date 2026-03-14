import { ref, onMounted, onUnmounted, useRouter } from '#imports'

export function useOurModal() {
  const modal = ref()
  const isShown = ref(false)

  onMounted(() => {
    show()
  })

  function show() {
    if (!modal.value) {
      console.error('useOurModal show problem')
    } else {
      modal.value.show()
      isShown.value = true
    }
  }

  function hide() {
    modal.value?.hide()
    isShown.value = false
  }

  const unregisterNavigationGuard = useRouter().beforeEach((to, from, next) => {
    if (isShown.value) {
      console.log('GUARD NAV STOPPED')
    } else {
      // console.log('GUARD OK OK OK')
    }
    // console.log('Guard', to?.query)
    if (to?.query?.noguard) {
      // This is a special query parameter we add to skip the guard.  This is used when we are navigating from
      // within a modal where the guard would otherwise suppress the navigation because it thinks we are trying
      // to use the back button to close the modal.
      console.log('Special')
      next()
    } else if (isShown.value) {
      console.log('Hide')
      hide()
      next(false)
    } else {
      next()
    }
  })

  onUnmounted(unregisterNavigationGuard)

  return { modal, show, hide }
}
