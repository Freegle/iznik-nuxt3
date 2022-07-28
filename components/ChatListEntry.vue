<template>
  <div v-if="chat" class="clickme noselect mb-1 mt-1" @mouseenter="fetch">
    <div class="ml-1 mr-1 d-flex justify-content-start w-100">
      <div class="d-flex flex-column justify-content-around">
        <ProfileImage
          v-if="chat.icon"
          :image="chat.icon"
          class="mr-1 inline"
          is-thumbnail
          size="lg"
          border
          :badge="chat.unseen ? chat.unseen : null"
        />
      </div>
      <div class="w-100">
        <!--        TODO MINOR Chat name can overflow without truncation.-->
        <!-- eslint-disable-next-line-->
        <span class="pl-0 mb-0 chatname truncate d-flex justify-content-between">{{ chat.name }} <SupporterInfo v-if="chat.supporter" class="mr-3 mt-1 small" /></span>
        <!-- eslint-disable-next-line-->
        <div class="small text-muted" :title="dateFormatted">{{ timeago(chat.lastdate) }}</div>
        <div>
          <b-badge v-if="chat.replyexpected" variant="danger">
            RSVP - please reply
          </b-badge>
          <!-- eslint-disable-next-line-->
          <div v-else-if="chat.snippet && chat.snippet !== 'false'" class="truncate">{{ esnippet }}</div>
          <div v-else>...</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SupporterInfo from '~/components/SupporterInfo'
import { twem } from '~/composables/useTwem'
import ProfileImage from '~/components/ProfileImage'
import { useChatStore } from '~/stores/chat'
import { datetime } from '~/composables/useTimeFormat'

export default {
  components: {
    SupporterInfo,
    ProfileImage,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const chatStore = useChatStore()

    return {
      chatStore,
    }
  },
  data() {
    return {
      fetched: false,
    }
  },
  computed: {
    chat() {
      return this.chatStore.byId(this.id)
    },
    dateFormatted() {
      if (this.chat) {
        return datetime(this.chat.lastdate)
      }

      return null
    },
    esnippet() {
      if (this.chat.snippet === 'null') {
        return '...'
      }

      let ret = twem(this.chat.snippet)
      // The way the snippet is constructed might lead to backslashes if we have an emoji.
      ret = ret.replace(/\\*$/, '') + '...'
      return ret
    },
  },
  methods: {
    async fetch() {
      this.fetched = true
      await this.chatStore.fetchMessages(this.id)
    },
  },
}
</script>
<style scoped lang="scss">
.chatname {
  color: $colour-info-fg;
  font-weight: bold;
  white-space: nowrap;
}
</style>
