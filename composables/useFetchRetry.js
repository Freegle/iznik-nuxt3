// Originally based on https://github.com/jonbern/fetch-retry, but reworked for our purposes.
import { useMiscStore } from '~/stores/misc'

export function fetchRetry(fetch) {
  const retryDelay = function (attempt, error, response) {
    // Slowly back off for longer each time.
    return attempt * 1000
  }

  const retryOn = async (attempt, error, response) => {
    // No point retrying until we know we are back online.
    const miscStore = useMiscStore()
    await miscStore.waitForOnline()

    console.log('Consider retry', attempt, error, response)

    if (attempt > 10) {
      console.log('Too many retries - give up')
      return [false, false]
    }

    if (miscStore?.unloading) {
      // Don't retry if we're unloading.
      console.log("Unloading - don't retry")
      return [false, false]
    }

    // Some browsers don't return much info from fetch(), deliberately, and just say "Load failed".  So retry those.
    // https://stackoverflow.com/questions/71280168/javascript-typeerror-load-failed-error-when-calling-fetch-on-ios
    if (response?.statusText.toLowerCase().includes('load failed')) {
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
        const data = response.json()

        if (!data) {
          // We've seen 200 responses with no data, which is never valid for us, so retry.
          console.log('Success but no data - retry')
          return [true, false]
        } else {
          // 200 response with valid JSON.  This is the rule not the exception.
          return [false, true]
        }
      } catch (e) {
        // JSON parse failed.  That shouldn't happen, so retry.
        return [true, false]
      }
    }
  }

  return function (input, init) {
    return new Promise(function (resolve, reject) {
      const wrappedFetch = async function (attempt) {
        // As of node 18, this is no longer needed since node comes with native support for fetch:
        /* istanbul ignore next */
        const _input =
          typeof Request !== 'undefined' && input instanceof Request
            ? input.clone()
            : input

        try {
          const response = await fetch(_input, init)

          try {
            return Promise.resolve(retryOn(attempt, null, response))
              .then(function (retryOnResponse) {
                if (retryOnResponse) {
                  retry(attempt, null, response)
                } else {
                  resolve(response)
                }
              })
              .catch(reject)
          } catch (error) {
            reject(error)
          }
        } catch (error) {
          try {
            Promise.resolve(retryOn(attempt, error, null))
              .then(function (retryOnResponse) {
                if (retryOnResponse) {
                  retry(attempt, error, null)
                } else {
                  reject(error)
                }
              })
              .catch(function (error) {
                reject(error)
              })
          } catch (error) {
            reject(error)
          }
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
