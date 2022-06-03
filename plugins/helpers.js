import { useGroupStore } from '../stores/group'
import { useMiscStore } from '../stores/misc'
import { useMessageStore } from '~/stores/message'
import { timeago } from '~/composables/useTimeFormat'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      timeago,
    },
    // Similarly for time formatting.
  }
})
