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
      <div v-for="chat in chats" :key="'expectedreply-' + chat.id">
        <b-button variant="primary" size="lg" @click="go(chat.id)">
          Reply to {{ chat.name }} now
        </b-button>
      </div>
    </NoticeMessage>
  </div>
</template>
<script>
import pluralize from 'pluralize'
import NoticeMessage from './NoticeMessage'
import { useRouter } from '#imports'

export default {
  components: { NoticeMessage },
  props: {
    count: {
      type: Number,
      required: true,
    },
    chats: {
      type: Array,
      required: true,
    },
  },
  computed: {
    replies() {
      pluralize.addIrregularRule('freegler is', 'freeglers are')
      return pluralize('freegler is', this.count, true)
    },
  },
  methods: {
    go(id) {
      const router = useRouter()
      router.push('/chats/' + id)
    },
  },
}
</script>
