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
<script setup>
import { computed } from 'vue'
import { useChatStore } from '../stores/chat'
import { useRouter } from '#app'
import { useMobileStore } from '@/stores/mobile' // APP

const props = defineProps({
  isListItem: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const router = useRouter()
const chatStore = useChatStore()
const mobileStore = useMobileStore()

const chatType = computed(() => {
  // A different component needs to be created depending on the context in which it's used
  return props.isListItem ? 'b-nav-item' : 'a'
})

const chatCount = computed(() => {
  // Don't show so many that the layout breaks.
  const chatcount = Math.min(99, chatStore?.unreadCount)
  if (mobileStore.isApp) {
    // APP
    mobileStore.setBadgeCount(chatcount)
  }
  return chatcount
})

function toChats(e) {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
  }

  router.push('/chats')
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.chatbadge {
  position: absolute;
  top: 0px;
  left: 18px;

  @include media-breakpoint-up(xl) {
    left: 22px;
  }
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
