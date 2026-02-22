import * as Sentry from '@sentry/vue'
import {
  APIError,
  MaintenanceError,
  LoginError,
  SignUpError,
} from './APIErrors'
import { fetchRetry } from '~/composables/useFetchRetry'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useLoggingContextStore } from '~/stores/loggingContext'
import { getTraceHeaders } from '~/composables/useTrace'

// Re-export the error classes for backward compatibility
export { APIError, MaintenanceError, LoginError, SignUpError }

let requestId = 0

// let timer = 0

// We add fetch retrying.
//
// Note that $fetch and useFetch cause problems on Node v18, so we don't use them.
const ourFetch = fetchRetry(fetch)

export default class BaseAPI {
  constructor(config) {
    this.config = config
  }

  $postv2(path, data, logError = true) {
    const authStore = useAuthStore()

    return this.$requestv2(
      'POST',
      path,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Iznik ' + JSON.stringify(authStore.auth?.persistent),
        },
        data,
      },
      logError
    )
  }

  async $requestv2(method, path, config, logError = true, body = null) {
    // timer++
    // const timerLabel = path + ' api-' + timer

    // console.log('Start ', timerLabel)
    // console.time(timerLabel)

    let status = null
    let data = null
    const headers = config.headers ? config.headers : {}

    // Add trace headers for distributed tracing.
    const traceHeaders = getTraceHeaders()
    Object.assign(headers, traceHeaders)

    // Add logging context headers.
    try {
      const loggingCtx = useLoggingContextStore()
      const loggingHeaders = loggingCtx.getHeaders()
      Object.assign(headers, loggingHeaders)
    } catch (e) {
      // Store may not be initialized on server-side.
    }

    try {
      const authStore = useAuthStore()
      const miscStore = useMiscStore()

      if (authStore?.auth?.jwt) {
        // Use the JWT to authenticate the request if possible.
        headers.Authorization = JSON.stringify(authStore.auth.jwt)
      }

      if (authStore?.auth?.persistent) {
        // The JWT is quick but short-lived; use the persistent token as a fallback.
        headers.Authorization2 = JSON.stringify(authStore.auth.persistent)
      }

      const loggedInAs = authStore.user?.id

      if (loggedInAs) {
        // Add the user ID as a query parameter to the path, checking whether there already are any
        // query parameters.
        path += (path.includes('?') ? '&' : '?') + 'loggedInAs=' + loggedInAs
      }

      // Add requestId to the path, checking whether there already are any query parameters.
      path += (path.includes('?') ? '&' : '?') + 'requestid=' + requestId++

      headers['Cache-Control'] =
        'max-age=0, must-revalidate, no-cache, no-store, private'

      if (method === 'GET' && config?.params) {
        // Remove falsey values from the params, unless dontzapfalsey is set.
        // This is needed when we want to pass 0 as a value (e.g., reviewed: 0).
        const keepFalsey = config.params.dontzapfalsey
        delete config.params.dontzapfalsey

        if (!keepFalsey) {
          config.params = Object.fromEntries(
            Object.entries(config.params).filter(([_, v]) => v)
          )
        }

        // URL encode the parameters, joining arrays as comma-separated for Go API
        const urlParams = new URLSearchParams()
        for (const [key, value] of Object.entries(config.params)) {
          if (Array.isArray(value)) {
            urlParams.append(key, value.join(','))
          } else {
            urlParams.append(key, value)
          }
        }
        const urlParamsStr = urlParams.toString()

        if (urlParamsStr.length) {
          path += '&' + urlParamsStr
        }
      } else if (method !== 'POST') {
        // Any parameters are passed in config.params.
        if (!config?.params) {
          config.params = {}
        }

        config.params.modtools = miscStore.modtools

        // JSON-encode these for to pass.
        body = JSON.stringify(config.params)
      } else if (!config?.formPost) {
        // Parameters will be passed in config.data.
        if (!config.data) {
          config.data = {}
        }

        config.data.modtools = miscStore.modtools
        body = JSON.stringify(config.data)
      }

      await miscStore.waitForOnline()
      miscStore.api(1)
      ;[status, data] = await ourFetch(this.config.public.APIv2 + path, {
        ...config,
        body,
        method,
        headers,
      })

      if (data && data.jwt && data.persistent) {
        // Server returned new auth tokens.  We only update if we already have auth - this prevents stale
        // in-flight API responses from restoring auth after an intentional logout.
        if (authStore.auth.jwt && data.jwt !== authStore.auth.jwt) {
          console.log('JWT renewal: updating auth tokens from API response')
          authStore.setAuth(data.jwt, data.persistent)
        } else if (!authStore.auth.jwt) {
          console.log(
            'JWT renewal blocked: no existing auth (likely logged out), ignoring stale API response'
          )
        }
      }

      if (status === 401) {
        // Not authorised - our JWT and/or persistent token must be wrong.  Clear them.  This may force a login, or
        // not, depending on whether the page requires it.
        console.log('Not authorised - force logged out')
        authStore.setAuth(null, null)
        authStore.setUser(null)

        // For specific paths, we want to silently allow 401 errors and swallow them.
        // This can happen if a login token is invalid, and we don't want to show errors to the user.
        if (path.startsWith('/chat?includeClosed=true')) {
          console.log('Silently handling 401 for includeClosed chat request')
          return new Promise(function (resolve) {})
        }
      }
    } catch (e) {
      console.log('Fetch error', path, e?.message)
      if (e?.response?.status) {
        status = e.response.status
      }

      if (e.message.match(/.*aborted.*/i)) {
        // We've seen requests get aborted immediately after beforeunload().  Makes sense to abort the requests
        // when you're leaving a page.  No point in rippling those errors up to result in Sentry errors.
        // Swallow these by returning a problem that never resolves.  Possible memory leak but it's a rare case.
        console.log('Aborted - ignore')
        return new Promise(function (resolve) {})
      }
    } finally {
      useMiscStore().api(-1)
    }

    // HTTP errors are real errors.
    //
    // data.ret holds the server error.
    // - 1 means not logged in, and that's ok.
    // - POSTs to session can return errors we want to handle.
    // - 999 can happen if people double-click, and we should just quietly drop it because the first click will
    //   probably do the right thing.
    // - otherwise throw an exception.
    //
    // Accept all 2xx status codes as successful (200, 201, 204, etc.)
    if (status < 200 || status >= 300) {
      const statusstr = status?.toString()

      // For specific paths, we want to silently allow 401 errors and swallow them.
      // This can happen if a login token is invalid, and we don't want to show errors to the user.
      if (status === 401 && path.startsWith('/chat?includeClosed=true')) {
        console.log('Silently handling 401 for includeClosed chat request')
        return new Promise(function (resolve) {})
      }

      // Whether or not we log this error to Sentry depends.  Most errors are worth logging, because they're unexpected.
      // But some API calls are expected to fail, and throw an exception which is then handled in the code.  We don't
      // want to log those, otherwise we will spend time investigating them in Sentry.  So we have a parameter which
      // indicates whether we want to log this to Sentry - which can be a boolean or a function for more complex
      // decisions.
      const log = typeof logError === 'function' ? logError(data) : logError

      if (log && (status !== null || statusstr !== 'Unknown')) {
        // Sentry is only initialized on the client, so check before calling
        if (typeof Sentry?.captureMessage === 'function') {
          Sentry.captureMessage(
            'API2 request failed ' +
              path +
              ' returned HTTP ' +
              status +
              ' status ' +
              statusstr +
              ' data length ' +
              (data ? data.length : 0)
          )
        }
      }

      const message = [
        'API Error',
        method,
        path,
        '->',
        `status: ${statusstr}`,
      ].join(' ')

      throw new APIError(
        {
          request: {
            path,
            method,
            headers: config.headers,
            params: config.params,
            data: config.data,
          },
          response: {
            status,
            data,
          },
        },
        message
      )
    }

    // console.timeEnd(timerLabel)

    return data
  }

  $getv2(path, params = {}, logError = true) {
    return this.$requestv2('GET', path, { params }, logError)
  }

  $patchv2(path, data, logError = true) {
    return this.$requestv2(
      'PATCH',
      path,
      {
        headers: { 'Content-Type': 'application/json' },
        params: data,
      },
      logError
    )
  }

  $putv2(path, data, logError = true) {
    return this.$requestv2(
      'PUT',
      path,
      {
        headers: { 'Content-Type': 'application/json' },
        params: data,
      },
      logError
    )
  }

  $postFormv2(path, data, logError = true) {
    return this.$requestv2(
      'POST',
      path,
      {
        formPost: true,
      },
      logError,
      data
    )
  }

  $delv2(path, data, logError = true) {
    return this.$requestv2(
      'DELETE',
      path,
      {
        headers: { 'Content-Type': 'application/json' },
        params: data,
      },
      logError
    )
  }
}
