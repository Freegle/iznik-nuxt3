import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'

// Simple throttle.  When we get more than a certain number of outstanding fetches, wait until they are all
// finished.  This stops the infinite scroll going beserk.
export function throttleFetches() {
  const messageStore = useMessageStore()

  const fetching = messageStore.fetchingCount

  if (fetching < 5) {
    return Promise.resolve()
  } else {
    return new Promise((resolve) => {
      checkThrottle(resolve)
    })
  }
}

export function checkThrottle(resolve) {
  const messageStore = useMessageStore()

  const fetching = messageStore.fetchingCount

  if (fetching === 0) {
    resolve()
  } else {
    setTimeout(checkThrottle, 100, resolve)
  }
}

export async function fetchOurOffers() {
  const messageStore = useMessageStore()
  const authStore = useAuthStore()

  // Get our offers.
  const myid = authStore.user?.id

  let ours = myid ? await messageStore.fetchByUser(myid) : []

  // Truncate to 100
  ours = ours.slice(0, 100)

  // Fetch all the offers - no age filter, if the post is still active it can be promised
  const promises = []

  ours.forEach((msg) => {
    if (!msg.successful && msg.type === 'Offer') {
      promises.push(messageStore.fetch(msg.id))
    }
  })

  await Promise.all(promises)

  const fulloffers = []
  ours.forEach((msg) => {
    if (!msg.successful && msg.type === 'Offer') {
      const m = messageStore.byId(msg.id)

      if (m) {
        fulloffers.push(m)
      }
    }
  })

  // Sort by arrival time, most recent first
  fulloffers.sort((a, b) => {
    const dateA = new Date(a.arrival || 0)
    const dateB = new Date(b.arrival || 0)
    return dateB - dateA
  })

  return fulloffers
}
