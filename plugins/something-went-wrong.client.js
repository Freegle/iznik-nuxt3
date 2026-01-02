import * as Sentry from '@sentry/browser'
import { APIError, MaintenanceError } from '@/api/BaseAPI'
import { useMiscStore } from '~/stores/misc'
import { useRouter } from '#imports'
import { suppressException } from '~/composables/useSuppressException'

export default defineNuxtPlugin((nuxtApp) => {
  const originalErrorHandler = nuxtApp.vueApp.config.errorHandler

  nuxtApp.vueApp.config.errorHandler = (err, vm, info, ...rest) => {
    console.log('Vue errorHandler', err?.message)
    if (!err) {
      return
    }
    if (err instanceof MaintenanceError) {
      // This is thrown in response to API return codes from the server.
      throw err
    } else if (err instanceof APIError && vm && vm.$bvToast) {
      const { request, response } = err
      try {
        // We have seen Sentry issues which look as though our console.error log here is itself causing an exception,
        // on older devices which might be less good at using console on complex objects.
        //
        // So log more carefully.
        console.log('Vue errorHandler')
        console.log('Err', err)
        console.log('Request', request)
        console.error('Response', response)
      } catch (e) {
        console.error('Error in toast logging', e)
      }

      // Trigger popup.
      const miscStore = useMiscStore()
      miscStore.setErrorDetails(err)

      Sentry.captureMessage('API error')

      return true
    } else if (suppressException(err)) {
      return true
    }

    if (originalErrorHandler) {
      return originalErrorHandler(err, vm, info, ...rest)
    }
  }

  window.addEventListener('unhandledrejection', function (event) {
    const reason = event?.reason?.message

    if (reason?.includes('Maintenance error')) {
      // The API may throw this, and it may not get caught.
      const router = useRouter()
      router.push('/maintenance')
    } else if (reason) {
      // No point alerting the user if we have no info.
      const miscStore = useMiscStore()
      const error = new Error(reason)
      miscStore.setErrorDetails(error)
      Sentry.captureMessage('Unhandled promise', reason)
    }
  })
})
