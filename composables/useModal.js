import { onUnmounted } from 'vue'

export function useModal() {
  const modal = ref()

  onMounted(() => {
    modal.value.show()
  })

  const unregisterNavigationGuard = useRouter().beforeEach((to, from, next) => {
    // TODO
    next()
  })

  onUnmounted(unregisterNavigationGuard)

  return { modal }
}
