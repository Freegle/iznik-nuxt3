/**
 * Logging context plugin.
 *
 * Initializes the logging context store and tracks page navigation.
 * Provides session/page/modal context for API calls and interaction logging.
 */
import { useLoggingContextStore } from '~/stores/loggingContext'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const runtimeConfig = useRuntimeConfig()

  nuxtApp.hook('app:created', () => {
    const ctx = useLoggingContextStore()
    ctx.init(runtimeConfig)
  })

  // Track page navigation.
  router.afterEach((to) => {
    const ctx = useLoggingContextStore()
    ctx.startPage(to)
  })
})
