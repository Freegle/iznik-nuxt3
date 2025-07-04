<template>
  <div>
    <NoticeMessage variant="warning" class="mb-1">
      <p>
        <strong>{{ replies }} waiting for you to reply.</strong>
      </p>
      <p>
        Please don't leave them hanging! Let them know if you're no longer
        interested, or other people will see that you haven't replied yet.
      </p>
      <ExpectedRepliesChat
        v-for="chatid in chats"
        :id="chatid"
        :key="'expectedreply-' + chatid"
      />
    </NoticeMessage>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import pluralize from 'pluralize'
import NoticeMessage from './NoticeMessage'
import ExpectedRepliesChat from '~/components/ExpectedRepliesChat.vue'

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
  chats: {
    type: Array,
    required: true,
  },
})

const replies = computed(() => {
  pluralize.addIrregularRule('freegler is', 'freeglers are')
  return pluralize('freegler is', props.count, true)
})
</script>
