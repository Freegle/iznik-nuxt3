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
    if (isShown.value) {
      hide()
      next(false)
    } else {
      next()
    }
  })

  onUnmounted(unregisterNavigationGuard)

  return { modal, show, hide }
}
