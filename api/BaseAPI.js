import * as Sentry from '@sentry/browser'
import fetchRetry from 'fetch-retry'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'

// We add fetch retrying.
// Note that $fetch and useFetch cause problems on Node v18, so we don't use them.
const ourFetch = fetchRetry(fetch, {
  retries: 10,
  retryOn: (attempt, error, response) => {
    // Retry on pretty much anything except errors which can legitimately be returned by the API server.  These are
    // the low 400s.
    if (error !== null || response?.status > 404) {
      console.log('API retry', attempt, error, response)
      return true
    }
  },
  retryDelay: function (attempt, error, response) {
    return attempt * 1000
  },
})

export class APIError extends Error {
  constructor({ request, response }, message) {
    super(message)
    Object.assign(this, { request, response })
  }
}

export class MaintenanceError extends Error {
  constructor({ request, response }, message) {
    super(message)
    Object.assign(this, { request, response })
  }
}

export class LoginError extends Error {
  constructor(ret, status) {
    super(status)
    Object.assign(this, { ret, status })
  }
}

export class SignUpError extends Error {
  constructor(ret, status) {
    super(status)
    Object.assign(this, { ret, status })
  }
}

export default class BaseAPI {
  constructor(config) {
    this.config = config
  }

  async $request(method, path, config, logError = true, body = null) {
    let status = null
    let data = null

    try {
      const headers = config.headers ? config.headers : {}

      const authStore = useAuthStore()

      if (authStore.auth.persistent) {
        // Use the persistent token (a kind of JWT) to authenticate the request.
        headers.Authorization =
          'Iznik ' + JSON.stringify(authStore.auth.persistent)
      }

      if (method === 'GET' && config?.params) {
        // Remove falsey values from the params.
        config.params = Object.fromEntries(
          Object.entries(config.params).filter(([_, v]) => v)
        )

        // URL encode the parameters
        path += '?' + new URLSearchParams(config.params)
      } else if (method !== 'POST') {
        // Any parameters are passed in config.params.
        if (!config?.params) {
          config.params = {}
        }

        config.params.modtools = false

        // JSON-encode these for to pass.
        body = JSON.stringify(config.params)
      } else if (!config?.formPost) {
        // Parameters will be passed in config.data.
        if (!config.data) {
          config.data = {}
        }

        config.data.modtools = false
        body = JSON.stringify(config.data)
      }

      useMiscStore().api(1)

      const rsp = await ourFetch(this.config.public.APIv1 + path, {
        ...config,
        body,
        method,
        headers,
      })

      status = rsp.status
      data = await rsp.json()

      if (data.jwt && data.jwt !== authStore.auth.jwt && data.persistent) {
        // We've been given a new JWT.  Use it in future.  This can happen after user merge or periodically when
        // we renew the JWT.
        authStore.setAuth(data.jwt, data.persistent)
      }
    } catch (e) {
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
    // We've sometimes seen 200 response codes with no returned data (I saw this myself on a train with flaky
    // signal).  So that's an error if it happens.
    //
    // data.ret holds the server error.
    // - 1 means not logged in, and that's ok.
    // - POSTs to session can return errors we want to handle.
    // - 999 can happen if people double-click, and we should just quietly drop it because the first click will
    //   probably do the right thing.
    // - otherwise throw an exception.
    if (
      status !== 200 ||
      !data ||
      (data.ret !== 0 &&
        !(data.ret === 1 && data.status === 'Not logged in') &&
        !(path === '/session' && method === 'POST') &&
        data.ret !== 999)
    ) {
      const retstr = data && data.ret ? data.ret : 'Unknown'
      const statusstr = data && data.status ? data.status : 'Unknown'

      if (retstr === 111) {
        // Down for maintenance
        console.log('Down for maintenance')
        throw new MaintenanceError(data.ret, 'Maintenance error')
      } else {
        // Whether or not we log this error to Sentry depends.  Most errors are worth logging, because they're unexpected.
        // But some API calls are expected to fail, and throw an exception which is then handled in the code.  We don't
        // want to log those, otherwise we will spend time investigating them in Sentry.  So we have a parameter which
        // indicates whether we want to log this to Sentry - which can be a boolean or a function for more complex
        // decisions.
        const log = typeof logError === 'function' ? logError(data) : logError
        console.log('Log it?', log)

        if (log) {
          Sentry.captureException(
            'API request failed ' +
              path +
              ' returned HTTP ' +
              status +
              ' ret ' +
              retstr +
              ' status ' +
              statusstr
          )
        }

        const message = [
          'API Error',
          method,
          path,
          '->',
          `ret: ${retstr} status: ${statusstr}`,
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
    }

    return data
  }

  $get(path, params = {}, logError = true) {
    return this.$request('GET', path, { params }, logError)
  }

  $post(path, data, logError = true) {
    return this.$request(
      'POST',
      path,
      {
        data,
      },
      logError
    )
  }

  $postForm(path, data, logError = true) {
    // Don't set Content-Type - see https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
    return this.$request(
      'POST',
      path,
      {
        formPost: true,
      },
      logError,
      data
    )
  }

  $postOverride(overrideMethod, path, data, logError = true) {
    return this.$request(
      'POST',
      path,
      {
        data,
        headers: {
          'X-HTTP-Method-Override': overrideMethod,
        },
      },
      logError
    )
  }

  $put(path, data, logError = true) {
    return this.$postOverride('PUT', path, data, logError)
  }

  $patch(path, data, logError = true) {
    return this.$postOverride('PATCH', path, data, logError)
  }

  $del(path, data, config = {}, logError = true) {
    return this.$postOverride('DELETE', path, data, logError)
  }

  async $requestv2(method, path, config, logError = true, body = null) {
    let status = null
    let data = null

    try {
      const headers = config.headers ? config.headers : {}

      const authStore = useAuthStore()

      if (authStore?.auth?.jwt) {
        // Use the JWT to authenticate the request if possible.
        headers.Authorization = JSON.stringify(authStore.auth.jwt)
      }

      if (authStore?.auth?.persistent) {
        // The JWT is quick but short-lived; use the persistent token as a fallback.
        headers.Authorization2 = JSON.stringify(authStore.auth.persistent)
      }

      if (method === 'GET' && config?.params) {
        // Remove falsey values from the params.
        config.params = Object.fromEntries(
          Object.entries(config.params).filter(([_, v]) => v)
        )

        // URL encode the parameters
        path += '?' + new URLSearchParams(config.params)
      } else if (method !== 'POST') {
        // Any parameters are passed in config.params.
        if (!config?.params) {
          config.params = {}
        }

        config.params.modtools = false

        // JSON-encode these for to pass.
        body = JSON.stringify(config.params)
      } else if (!config?.formPost) {
        // Parameters will be passed in config.data.
        if (!config.data) {
          config.data = {}
        }

        config.data.modtools = false
        body = JSON.stringify(config.data)
      }

      useMiscStore().api(1)

      const rsp = await ourFetch(this.config.public.APIv2 + path, {
        ...config,
        body,
        method,
        headers,
      })

      status = rsp.status
      data = await rsp.json()
    } catch (e) {
      console.log('Fetch error', path, e?.message)
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
    // We've sometimes seen 200 response codes with no returned data (I saw this myself on a train with flaky
    // signal).  So that's an error if it happens.
    //
    // data.ret holds the server error.
    // - 1 means not logged in, and that's ok.
    // - POSTs to session can return errors we want to handle.
    // - 999 can happen if people double-click, and we should just quietly drop it because the first click will
    //   probably do the right thing.
    // - otherwise throw an exception.
    if (status !== 200 || !data) {
      const statusstr = data && data.status ? data.status : 'Unknown'

      // Whether or not we log this error to Sentry depends.  Most errors are worth logging, because they're unexpected.
      // But some API calls are expected to fail, and throw an exception which is then handled in the code.  We don't
      // want to log those, otherwise we will spend time investigating them in Sentry.  So we have a parameter which
      // indicates whether we want to log this to Sentry - which can be a boolean or a function for more complex
      // decisions.
      const log = typeof logError === 'function' ? logError(data) : logError

      if (log) {
        Sentry.captureException(
          'API request failed ' +
            path +
            ' returned HTTP ' +
            status +
            ' status ' +
            statusstr
        )
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

    return data
  }

  $getv2(path, params = {}, logError = true) {
    return this.$requestv2('GET', path, { params }, logError)
  }
}
