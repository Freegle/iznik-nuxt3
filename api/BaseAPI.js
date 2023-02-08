import * as Sentry from '@sentry/browser'
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '~/stores/mobile'

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
    this.$axios = axios
    this.ourConfig = config
  }

  async $request(method, path, config, logError = true) {
    let status = null
    let data = null

    try {
      const headers = config.headers ? config.headers : {}

      const authStore = useAuthStore()
      const mobileStore = useMobileStore()

      if (authStore.auth.persistent) {
        // Use the persistent token (a kind of JWT) to authenticate the request.
        headers.Authorization =
          'Iznik ' + JSON.stringify(authStore.auth.persistent)
      }

      if (method !== 'POST') {
        if (!config.params) {
          config.params = {}
        }

        config.params.modtools = false
        config.params.app = mobileStore.isApp
      } else {
        if (!config.data) {
          config.data = {}
        }

        config.data.modtools = false
        config.data.app = mobileStore.isApp
      }

      const ret = await this.$axios.request({
        ...config,
        method,
        headers,
        url: this.ourConfig.public.APIv1 + path,
      })
      ;({ status, data } = ret)
    } catch (e) {
      if (e.message.match(/.*aborted.*/i)) {
        // We've seen requests get aborted immediately after beforeunload().  Makes sense to abort the requests
        // when you're leaving a page.  No point in rippling those errors up to result in Sentry errors.
        // Swallow these by returning a problem that never resolves.  Possible memory leak but it's a rare case.
        console.log('Aborted - ignore')
        return new Promise(function (resolve) {})
      }
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
    return this.$request('POST', path, { data }, logError)
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

  async $requestv2(method, path, config, logError = true) {
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

      const ret = await this.$axios.request({
        ...config,
        method,
        headers,
        url: this.ourConfig.public.APIv2 + path,
      })
      ;({ status, data } = ret)
    } catch (e) {
      console.log('Axios error', path, e?.message)
      if (e.message.match(/.*aborted.*/i)) {
        // We've seen requests get aborted immediately after beforeunload().  Makes sense to abort the requests
        // when you're leaving a page.  No point in rippling those errors up to result in Sentry errors.
        // Swallow these by returning a problem that never resolves.  Possible memory leak but it's a rare case.
        console.log('Aborted - ignore')
        return new Promise(function (resolve) {})
      }
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
