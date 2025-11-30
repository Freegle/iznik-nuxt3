<template>
  <div
    v-if="chat"
    class="chat-entry"
    :class="{ unread: chat.unseen }"
    @mouseenter="fetch"
  >
    <ChatAvatar
      :icon="chat.icon"
      :name="chat.name"
      :supporter="chat.supporter"
      :unread-count="chat.unseen"
    />
    <div class="chat-content">
      <div class="chat-header">
        <span class="chat-name">{{ chat.name }}</span>
        <span class="chat-time">{{ lastdateago }}</span>
      </div>
      <div class="chat-preview">
        <b-badge v-if="chat.replyexpected" variant="danger" class="rsvp-badge">
          RSVP
        </b-badge>
        <span
          v-else-if="chat.snippet && chat.snippet !== 'false'"
          class="snippet"
          >{{ esnippet }}</span
        >
        <span v-else class="snippet empty">No messages yet</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from '#imports'
import { twem } from '~/composables/useTwem'
import { useChatStore } from '~/stores/chat'
import { timeago } from '~/composables/useTimeFormat'
import ChatAvatar from '~/components/ChatAvatar'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const chatStore = useChatStore()
const fetched = ref(false)

const chat = computed(() => {
  return chatStore.byChatId(props.id)
})

const esnippet = computed(() => {
  if (chat.value?.snippet === 'null') {
    return '...'
  }

  let ret = twem(chat.value?.snippet)
  ret = ret.replace(/\\*$/, '')
  return ret
})

const lastdateago = computed(() => {
  if (chat.value?.lastdate) {
    return timeago(chat.value.lastdate)
  }

  return null
})

const fetch = async () => {
  fetched.value = true
  await chatStore.fetchMessages(props.id)
}

onMounted(() => {
  if (props.active) {
    const cb = () => {
      const element = document.querySelector('.chat-entry')
      if (element) {
        if (element.scrollIntoViewIfNeeded) {
          element.scrollIntoViewIfNeeded({
            behavior: 'instant',
            block: 'start',
            inline: 'nearest',
          })
        } else {
          element.scrollIntoView({
            behavior: 'instant',
            block: 'start',
            inline: 'nearest',
          })
        }
      }
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb)
    } else {
      setTimeout(cb, 100)
    }
  }
})
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.chat-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &.unread {
    background-color: rgba($color-green-background, 0.05);
  }
}

.chat-avatar {
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
}

// Make ProfileImage component render at correct size
:deep(.avatar-image) {
  width: 56px !important;
  height: 56px !important;
  min-width: 56px !important;
  min-height: 56px !important;
  border-radius: 50%;

  img {
    width: 56px !important;
    height: 56px !important;
    object-fit: cover;
    border-radius: 50%;
  }
}

.generated-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef5350;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.chat-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.chat-name {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.chat-time {
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
}

.chat-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.snippet {
  font-size: 0.875rem;
  color: #666;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  flex: 1;
  min-width: 0;

  &.empty {
    color: #999;
    font-style: italic;
  }
}

.rsvp-badge {
  font-size: 0.65rem;
  padding: 2px 6px;
  flex-shrink: 0;
}

.supporter-info {
  margin-top: 2px;
}

// Unread state styling
.chat-entry.unread {
  .chat-name {
    color: #000;
  }

  .snippet {
    color: #333;
    font-weight: 500;
  }
}
</style>
