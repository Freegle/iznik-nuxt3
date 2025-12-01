import { computed, watch } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useMe } from '~/composables/useMe'
import { timeagoShort, dateonlyNoYear } from '~/composables/useTimeFormat'
import { milesAway } from '~/composables/useDistance'

/**
 * Shared composable for message display logic used by both
 * MessageExpandedMobile and MessageSummaryMobile
 */
export function useMessageDisplay(messageId) {
  const messageStore = useMessageStore()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const { me } = useMe()

  const message = computed(() =>
    messageStore?.byId(messageId.value || messageId)
  )

  // Fetch poster info when message changes
  watch(
    () => message.value?.fromuser,
    (userId) => {
      if (userId) {
        userStore.fetch(userId)
      }
    },
    { immediate: true }
  )

  const poster = computed(() => {
    return message.value?.fromuser
      ? userStore?.byId(message.value?.fromuser)
      : null
  })

  const posterName = computed(() => {
    if (!poster.value) return null
    // Use first name only for compact display
    const displayname = poster.value.displayname || ''
    return displayname.split(' ')[0] || displayname
  })

  const posterProfileUrl = computed(() => {
    return poster.value ? `/profile/${poster.value.id}` : null
  })

  const strippedSubject = computed(() => {
    const subject = message.value?.subject || ''
    // Strip "OFFER: ", "OFFERED: ", or "WANTED: " prefix
    return subject.replace(/^(OFFERED|OFFER|WANTED):\s*/i, '')
  })

  const fromme = computed(() => {
    return message.value?.fromuser === authStore.user?.id
  })

  const gotAttachments = computed(() => {
    return message.value?.attachments?.length > 0
  })

  const sampleImage = computed(() => {
    // Sample image from similar posts, returned by v2 API when message has no photos
    return message.value?.sampleimage || null
  })

  const attachmentCount = computed(() => {
    return message.value?.attachments?.length || 0
  })

  const timeAgo = computed(() => {
    // Use group arrival time (like MessageHistory does) for accurate autopost times
    const timestamp =
      message.value?.groups?.[0]?.arrival ||
      message.value?.arrival ||
      message.value?.date
    if (!timestamp) return ''
    return timeagoShort(timestamp)
  })

  const distanceText = computed(() => {
    if (!me.value?.lat || !message.value?.lat) {
      return message.value?.area || 'Unknown'
    }
    const miles = milesAway(
      me.value.lat,
      me.value.lng,
      message.value.lat,
      message.value.lng
    )
    if (miles < 1) {
      return '< 1 mi'
    }
    return `${Math.round(miles)} mi`
  })

  const replyCount = computed(() => {
    return message.value?.replies?.length || 0
  })

  const isOffer = computed(() => {
    return message.value?.type === 'Offer'
  })

  const isWanted = computed(() => {
    return message.value?.type === 'Wanted'
  })

  const formattedDeadline = computed(() => {
    if (!message.value?.deadline) return ''
    return dateonlyNoYear(message.value.deadline)
  })

  const deadlineTooltip = computed(() => {
    return isOffer.value
      ? 'Only available until this date'
      : 'Only needed before this date'
  })

  const successfulText = computed(() => {
    return isOffer.value ? 'Taken' : 'Received'
  })

  const placeholderClass = computed(() => {
    return message.value?.type === 'Offer'
      ? 'offer-gradient'
      : 'wanted-gradient'
  })

  const categoryIcon = computed(() => {
    // Map item categories to icons - simplified for now
    const type = message.value?.type
    if (type === 'Offer') return 'gift'
    if (type === 'Wanted') return 'search'
    return 'gift'
  })

  return {
    message,
    strippedSubject,
    fromme,
    gotAttachments,
    sampleImage,
    attachmentCount,
    timeAgo,
    distanceText,
    replyCount,
    isOffer,
    isWanted,
    formattedDeadline,
    deadlineTooltip,
    successfulText,
    placeholderClass,
    categoryIcon,
    poster,
    posterName,
    posterProfileUrl,
  }
}
