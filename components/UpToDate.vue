<template>
  <div>
    <NoticeMessage
      v-if="!browseCount"
      variant="info"
      class="text-center mt-3 ms-2 me-2 ms-md-0 me-md-0"
    >
      <v-icon icon="check-circle" class="text-success mt-2 text--largest" />
      <p class="text--large font-weight-bold">You're up to date.</p>
      <p>You've already seen posts below here.</p>
    </NoticeMessage>
    <NoticeMessage
      v-else
      variant="info"
      class="text-center mt-3 ms-2 me-2 ms-md-0 me-md-0 clickme"
      @click="reload"
    >
      <v-icon
        icon="exclamation-circle"
        class="text-success mt-2 text--largest"
      />
      <p class="text--large font-weight-bold">
        {{ browseCountPlural }}
      </p>
      <p>Click to refresh.</p>
    </NoticeMessage>
  </div>
</template>
<script setup>
import pluralize from 'pluralize'
import { useMessageStore } from '../stores/message'

const messageStore = useMessageStore()

const browseCount = computed(() => {
  return Math.min(99, messageStore.count)
})

const browseCountPlural = computed(() => {
  return pluralize('new post', browseCount.value, true)
})

function reload() {
  window.location.reload()
}
</script>
