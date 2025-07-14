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
            {{ lastdateago }}
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
<script setup>
import { ref, computed, onMounted } from '#imports'
import SupporterInfo from '~/components/SupporterInfo'
import { twem } from '~/composables/useTwem'
import ProfileImage from '~/components/ProfileImage'
import { useChatStore } from '~/stores/chat'
import { datetime, timeago } from '~/composables/useTimeFormat'

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

const dateFormatted = computed(() => {
  if (chat.value) {
    return datetime(chat.value.lastdate)
  }

  return null
})

const esnippet = computed(() => {
  if (chat.value?.snippet === 'null') {
    return '...'
  }

  let ret = twem(chat.value?.snippet)
  // The way the snippet is constructed might lead to backslashes if we have an emoji.
  ret = ret.replace(/\\*$/, '') + '...'
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
      const element = document.querySelector('.clickme.noselect.mb-1.mt-1')
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
    grid-template-columns: min-content calc(98% - 30px);
  }

  @include media-breakpoint-up(md) {
    grid-template-columns: min-content calc(98% - 50px);
  }
}
</style>
