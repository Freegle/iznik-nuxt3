import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useIsochroneStore } from '~/stores/isochrone'
import { useComposeStore } from '~/stores/compose'
import { useChatStore } from '~/stores/chat'
import { useAddressStore } from '~/stores/address'

export default defineNuxtRouteMiddleware((to) => {
  // We're having trouble accessing the Nuxt config from within a Pinia store.  So instead we access it here, then
  // pass it in to each store via an init() action.
  const runtimeConfig = useRuntimeConfig()

  const groupStore = useGroupStore()
  const messageStore = useMessageStore()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const isochroneStore = useIsochroneStore()
  const composeStore = useComposeStore()
  const chatStore = useChatStore()
  const addressStore = useAddressStore()

  groupStore.init(runtimeConfig)
  messageStore.init(runtimeConfig)
  authStore.init(runtimeConfig)
  userStore.init(runtimeConfig)
  isochroneStore.init(runtimeConfig)
  composeStore.init(runtimeConfig)
  chatStore.init(runtimeConfig)
  addressStore.init(runtimeConfig)
})
