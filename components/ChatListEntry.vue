<template>
  <div v-if="chat" class="clickme noselect mb-1 mt-1" @mouseenter="fetch">
    <div class="layout">
      <ProfileImage
        v-if="chat.icon"
        :image="chat.icon"
        class="ml-1 mr-1 profile"
        is-thumbnail
        size="lg"
        border
        :badge="chat.unseen ? chat.unseen : null"
      />
      <div class="chatentry">
        <div class="d-flex justify-content-between w-100">
          <!-- eslint-disable-next-line-->
          <span class="pl-0 mb-0 chatname truncate">{{ chat.name }}</span>
          <!-- eslint-disable-next-line-->
          <SupporterInfo v-if="chat.supporter" class="mr-3 mb-1 small" />
        </div>
        <div class="small text-muted" :title="dateFormatted">
          <span v-if="chat.lastdate">
            {{ timeago(chat.lastdate) }}
          </span>
          <span v-else> &nbsp; </span>
        </div>
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
    active: {
      type: Boolean,
      required: false,
      default: false,
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
      return this.chatStore.byChatId(this.id)
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
  mounted() {
    if (this.active) {
      const cb = () => {
        if (this.$el.scrollIntoViewIfNeeded) {
          this.$el.scrollIntoViewIfNeeded({
            behavior: 'instant',
            block: 'start',
            inline: 'nearest',
          })
        } else {
          this.$el.scrollIntoView({
            behavior: 'instant',
            block: 'start',
            inline: 'nearest',
          })
        }
      }

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(cb)
      } else {
        setTimeout(cb, 100)
      }
    }
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
@import 'bootstrap/scss/_functions.scss';
@import 'bootstrap/scss/_variables.scss';
@import 'bootstrap/scss/mixins/_breakpoints.scss';
@import 'assets/css/sticky-banner.scss';

.chatname {
  color: $colour-info-fg;
  font-weight: bold;
  white-space: nowrap;
}

.layout {
  display: grid;
  grid-template-columns: min-content calc(98% - 30px);
  align-items: center;
  scroll-padding-top: 10px;

  @include media-breakpoint-up(sm) {
    grid-template-columns: min-content calc(98% - $sticky-banner-height-mobile);
  }

  @include media-breakpoint-up(md) {
    grid-template-columns: min-content calc(98% - $sticky-banner-height-desktop);
  }
}
</style>
