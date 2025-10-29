<template>
  <div>
    <NoticeMessage v-if="!id" variant="warning">
      No chat id given
    </NoticeMessage>
    <div v-else-if="supportOrAdmin">
      <NoticeMessage v-if="notfound" variant="warning">
        Chat {{ id }} not found
      </NoticeMessage>
      <ModChatModal v-if="chat" :id="id" ref="modChatModal" :pov="pov" />
    </div>
    <NoticeMessage v-else variant="warning">
      You don't have access to Support Tools.
    </NoticeMessage>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import { useChatStore } from '~/stores/chat'
import { useMessageStore } from '~/stores/message'
import { useMe } from '~/composables/useMe'

export default {
  setup() {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    const { supportOrAdmin } = useMe()
    return { chatStore, messageStore, supportOrAdmin }
  },
  data() {
    return {
      id: null,
      notfound: false,
      chat: null,
      pov: null,
    }
  },
  computed: {},
  created() {
    const route = useRoute()
    this.id = 'id' in route.params ? parseInt(route.params.id) : 0
  },
  async mounted() {
    await this.messageStore.clear()
    await this.chatStore.clear()
    if (!this.id) {
      return
    }
    await this.chatStore.fetchChat(this.id)

    this.chat = this.chatStore.byChatId(this.id)

    if (this.chat) {
      this.pov = this.chat.user1.id
    } else {
      this.notfound = true
    }
  },
  methods: {},
}
</script>
