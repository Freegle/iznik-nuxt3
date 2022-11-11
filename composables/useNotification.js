import { useUserStore } from '~/stores/user'
import { useNotificationStore } from '~/stores/notification'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { twem } from '~/composables/useTwem'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useVolunteeringStore } from '~/stores/volunteering'
import { timeago } from '~/composables/useTimeFormat'

export async function setupNotification(id) {
  const userStore = useUserStore()
  const notificationStore = useNotificationStore()
  const newsfeedStore = useNewsfeedStore()
  const notification = computed(() => notificationStore.byId(id))
  const communitEventStore = useCommunityEventStore()
  const volunteeringStore = useVolunteeringStore()

  let fromuser = null

  if (notification.value.fromuser) {
    await userStore.fetch(notification.value.fromuser)
    fromuser = computed(() => userStore.byId(notification.value.fromuser))
  }

  let newsfeed = null

  if (notification.value.newsfeedid) {
    const item = await newsfeedStore.fetch(notification.value.newsfeedid)

    if (item.eventid) {
      await communitEventStore.fetch(item.eventid)
    }

    if (item.volunteeringid) {
      await volunteeringStore.fetch(item.volunteeringid)
    }

    newsfeed = computed(() => {
      const item = newsfeedStore.byId(notification.value.newsfeedid)
      if (item) {
        if (item.eventid) {
          const event = communitEventStore.byId(item.eventid)
          item.message = twem(event?.title)
        } else if (item.volunteeringid) {
          const volunteering = volunteeringStore.byId(item.volunteeringid)
          item.message = twem(volunteering?.title)
        } else {
          item.message = twem(item.message)
        }
      }

      return item
    })
  }

  const notificationago = computed(() => timeago(notification.value.timestamp))

  return {
    notificationStore,
    userStore,
    communitEventStore,
    volunteeringStore,
    notification,
    fromuser,
    newsfeed,
    notificationago,
  }
}
