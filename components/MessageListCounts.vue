<template>
  <div>
    <NoticeMessage
      v-if="browseCount"
      variant="info"
      class="text-center mt-3 ms-2 me-2 ms-md-0 me-md-0"
    >
      <p class="text--large font-weight-bold">{{ browseCountPlural }}.</p>
      <p>
        Posts you've not seen before show first. Posts you've seen before are
        further down.
      </p>
      <b-button class="mt-2" size="sm" variant="white" @click="markSeen">
        Mark all Seen
      </b-button>
    </NoticeMessage>
  </div>
</template>
<script setup>
import pluralize from 'pluralize'
import { useMessageStore } from '../stores/message'
import { useAuthStore } from '../stores/auth'

const messageStore = useMessageStore()

const browseCount = computed(() => {
  return Math.min(99, messageStore.count)
})

const browseCountPlural = computed(() => {
  return pluralize('unread post', messageStore.count, true)
})

function markSeen() {
  messageStore.markSeen()

  setTimeout(() => {
    // This is a backgrounded operation on the server and therefore won't happen immediately.
    messageStore.fetchCount(useAuthStore().user.settings?.browseView, false)
  }, 5000)
}
</script>
