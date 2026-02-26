// Originally based on https://github.com/jonbern/fetch-retry, but reworked for our purposes.
import { useMiscStore } from '~/stores/misc'

class FetchError extends Error {
  constructor(message, response) {
    super(message)
    this.response = response
  }
}

export function fetchRetry(fetch) {
  const retryDelay = function (attempt, error, response) {
    // Slowly back off for longer each time.
    return attempt * 1000
  }

  const retryOn = async function (attempt, error, response) {
    // No point retrying until we know we are back online.
    const miscStore = useMiscStore()
    await miscStore.waitForOnline()

    if (attempt > 10) {
      return [false, false, null, new Error('Too many retries, give up')]
    }

    if (miscStore?.unloading) {
      // Don't retry if we're unloading.
      console.log("Unloading - don't retry")
      return [false, false, null, new Error('Unloading, no retry')]
    }

    // Some browsers don't return much info from fetch(), deliberately, and just say "Load failed".  So retry those.
    // When fetch() throws (e.g. network failure), the message is in error.message, not response.statusText.
    // https://stackoverflow.com/questions/71280168/javascript-typeerror-load-failed-error-when-calling-fetch-on-ios
    const blandErrors = ['load failed', 'failed to fetch']
    if (
      blandErrors.includes(response?.statusText?.toLowerCase()) ||
      blandErrors.includes(error?.message?.toLowerCase())
    ) {
      console.log('Load failed - retry')
      return [true, false]
    }

    // Retry on network errors or server errors (5xx).  Don't retry client errors (4xx) - these are legitimate
    // API responses (e.g. 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict).
    if (error !== null || response?.status >= 500) {
      console.log('Error - retry', error, response?.status)
      return [true, false]
    }

    if (response?.status >= 200 && response?.status < 300) {
      try {
        const data = await response.json()

        if (!data) {
          // We've seen 200 responses with no data, which is never valid for us, so retry.
          console.log('Success but no data - retry')
          return [true, false]
        } else {
          return [false, true, data]
        }
      } catch (e) {
        if (response?.status === 204) {
          // 204 No Content - no body expected, that's fine.
          return [false, true, null]
        }

        // JSON parse failed on a response that should have had a body.  Retry.
        return [true, false]
      }
    } else {
      // Client error (4xx) that we aren't supposed to retry.  Parse the response body if available
      // so callers can access error details.
      let responseData = null

      try {
        responseData = await response.json()
      } catch (e) {
        // No JSON body - that's OK for error responses.
      }

      if (!error) {
        const fetchError = new FetchError(
          'Request failed with ' + response?.status,
          response
        )
        fetchError.data = responseData
        error = fetchError
      }

      return [false, false, null, error]
    }
  }

  return function (input, init) {
    return new Promise(function (resolve, reject) {
      const wrappedFetch = async function (attempt) {
        let response = null
        let error = null
        let doRetry = false
        let success = false
        let data = null

        try {
          response = await fetch(input, init)
        } catch (e) {
          console.log('Error in attempt', e)
          error = e
        }

        // We might retry in a variety of circumstances, including apparent success.
        ;[doRetry, success, data, error] = await retryOn(
          attempt,
          error,
          response
        )

        if (success) {
          // We have to pass the data because .json() can only be called once.
          resolve([response.status, data])
        } else if (doRetry) {
          console.log('Retry')
          retry(attempt, null, response)
        } else {
          reject(error)
        }
      }

      function retry(attempt, error, response) {
        const delay = retryDelay(attempt, error, response)

        setTimeout(function () {
          wrappedFetch(++attempt)
        }, delay)
      }

      wrappedFetch(0)
    })
  }
}
