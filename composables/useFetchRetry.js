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

    // Retry on pretty much any error except those which can legitimately be returned by the API server.  These are
    // the low 400s.
    if (error !== null || response?.status > 404) {
      console.log('Error - retry', error, response?.status)
      return [true, false]
    }

    if (response?.status === 200) {
      try {
        const data = await response.json()

        if (!data) {
          // We've seen 200 responses with no data, which is never valid for us, so retry.
          console.log('Success but no data - retry')
          return [true, false]
        } else {
          // 200 response with valid JSON.  This is the rule not the exception.
          return [false, true, data]
        }
      } catch (e) {
        // JSON parse failed.  That shouldn't happen, so retry.
        return [true, false]
      }
    } else {
      // Some error that we aren't supposed to retry.
      if (!error) {
        error = new FetchError(
          'Request failed with ' + response?.status,
          response
        )
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
