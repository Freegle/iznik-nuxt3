import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from './stores/misc'

let fetchingPromise = null

export async function fetchMe(hitServer, components) {
  // MT ADDED components
  const authStore = useAuthStore()

  // We can be called in several ways.
  //
  // - hitServer = true.  We must query the server, and wait for the response before returning.  This is used
  //   mostly when we really care about the data being tightly in sync, and occasionally when we want to
  //   ensure that the server call has completed (e.g. in timers).  You would always call this with await.
  //
  // - hitServer = false
  //   - with await.  We must have the user info, but it's ok for them to be a little out of
  //     date.  If we have it in hand we can return but fire off a server request to make sure is is up
  //     to date soon.  If we don't, we must hit the server and wait.
  //   - without await.  We just want to trigger an update but don't much care when it happens.
  //
  // Inside this function we can't tell whether an await is used, but this comment is for the callers :-).
  //
  // Because multiple pages/components may call fetchMe to ensure that they have data they need, we
  // want to minimise the number of calls.  We have some fairly complex logic below to keep the number of parallel
  // calls down and return earlier if we happen to already be fetching what we need.

  if (!components) components = [] // MT ADDED..
  const miscStore = useMiscStore()
  if (miscStore.modtools) { // TODO Why did I add this?
  //  components.push('expectedreplies')
  //  components.push('me')
  //  components.push('work')
  }

  let needToFetch = false

  if (!hitServer) {
    // We don't have to hit the server before we return, but we might need to if we don't have the user.
    if (!authStore.user && fetchingPromise) {
      // We are already in the process of fetching the user, so we just need to wait until that completes.
      await fetchingPromise
    }

    // We always need to fetch to do the background update.
    needToFetch = true
  } else {
    // We have been asked to hit the server.
    // eslint-disable-next-line no-lonely-if
    if (fetchingPromise) {
      // We are in the process of fetching the user, so we need to wait until that completes.
      await fetchingPromise
    } else {
      needToFetch = true
    }
  }

  if (needToFetch) {
    fetchingPromise = authStore.fetchUser(components) // MT ADDED

    if (hitServer) {
      // We need to wait for the server before returning.
      await fetchingPromise
      fetchingPromise = null
    } else {
      // We can return immediately, but hit the server to keep us up to date.
      fetchingPromise.then(() => {
        fetchingPromise = null
      })
    }
  }
}
