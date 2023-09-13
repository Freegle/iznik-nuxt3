import { onUnmounted } from 'vue'

export function useModal() {
  const modal = ref()

  onMounted(() => {
    show()
  })

  function show() {
    modal.value.show()
  }

  function hide() {
    modal.value.hide()
  }

  const unregisterNavigationGuard = useRouter().beforeEach((to, from, next) => {
    // TODO
    next()
  })

  onUnmounted(unregisterNavigationGuard)

  return { modal, show, hide }
}
