<template>
  <component
    :is="chatType"
    :class="{ 'text-white': !isListItem }"
    class="nav-link text-center chat-menu-item"
    href="#"
    aria-label="chats"
    @click="toChats"
  >
    <div class="position-relative">
      <v-icon icon="comments" class="fa-2x chat__icon" />
      <div class="nav-item__text d-none d-xl-block">Chats</div>
      <b-badge v-if="chatCount" variant="danger" class="chatbadge">
        {{ chatCount }}
      </b-badge>
    </div>
  </component>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { useMobileStore } from '@/stores/mobile'

export default {
  name: 'ChatMenu',
  props: {
    isListItem: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup() {
    const chatStore = useChatStore()

    return {
      chatStore,
    }
  },
  computed: {
    chatType() {
      // A different component needs to be created depending on the context in which it's used
      return this.isListItem ? 'b-nav-item' : 'a'
    },
    chatCount() {
      const mobileStore = useMobileStore()
      // Don't show so many that the layout breaks.
      const chatcount = Math.min(99, this.chatStore.unreadCount)
      mobileStore.setBadgeCount(chatcount)
      console.log('chatcount:',chatcount)
      return chatcount
    },
  },
  watch: {
    chatCount() {
      this.$emit('update:chatCount', this.chatCount)
    },
  },
  methods: {
    toChats(e) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }

      this.$router.push('/chats')
    },
  },
}
</script>
<style scoped lang="scss">
.chatbadge {
  position: absolute;
  top: 0px;
  left: 25px;
}

.chat__icon {
  height: 32px;
  width: 32px;
  margin: 0;
}

// We need to style the anchor but also override the bootstrap nav-link class
.chat-menu-item,
:deep(.nav-link) {
  color: $color-white !important;

  &:hover,
  &:focus {
    color: $color-white-opacity-75 !important;
  }
}
</style>
