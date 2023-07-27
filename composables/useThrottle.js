import dayjs from 'dayjs'
import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'
import { OWN_POSTS_AGE } from '~/constants'

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

  // Fetch all the offers
  const promises = []
  const now = dayjs()

  ours.forEach((msg) => {
    if (!msg.successful && msg.type === 'Offer') {
      const daysago = now.diff(dayjs(msg.arrival), 'days')

      if (daysago <= OWN_POSTS_AGE) {
        promises.push(messageStore.fetch(msg.id))
      }
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

  return fulloffers
}
