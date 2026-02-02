<template>
  <div>
    <client-only>
      <ModHelpChatReview />
      <div>
        <div
          v-for="message in visibleMessages"
          :key="'messagelist-' + message.id"
          class="p-0 mt-2"
        >
          <ModChatReview
            :id="message.chatid"
            :message="message"
            @reload="reload"
          />
        </div>

        <infinite-loading
          direction="top"
          force-use-infinite-wrapper="body"
          :distance="distance"
          :identifier="bump"
          @infinite="loadMore"
        >
          <template #spinner>
            <b-img lazy src="/loader.gif" alt="Loading" />
          </template>
          <template #complete>
            <notice-message v-if="!visibleMessages?.length">
              There are no chat messages to review at the moment.
            </notice-message>
          </template>
        </infinite-loading>
      </div>
      <SpinButton
        v-if="visibleMessages && visibleMessages.length > 1"
        class="mt-2"
        icon-name="trash-alt"
        label="Delete All"
        variant="white"
        @handle="deleteAll"
      />
      <ConfirmModal
        v-if="showDeleteModal"
        ref="deleteConfirm"
        title="Delete all chat messages?"
        @confirm="deleteConfirmed"
      />
    </client-only>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '~/stores/chat'

// We need an id for the store.  The null value is a special case used just for retrieving chat review messages.
const REVIEWCHAT = null

const authStore = useAuthStore()
const chatStore = useChatStore()

// Reactive state (was data())
// eslint-disable-next-line no-unused-vars
const context = ref(null)
// We fetch less stuff at once for MT.  This is because for slow devices and networks the time to fetch and
// render is significant, and each of these consumes a lot of screen space.  So by fetching and rendering less,
// we increase how fast it feels.
const distance = ref(1000)
const limit = ref(5)
const show = ref(0)
const bump = ref(0)
const showDeleteModal = ref(false)

// Computed properties
const messages = computed(() => {
  return chatStore.messagesById(REVIEWCHAT)
})

const visibleMessages = computed(() => {
  return messages.value.slice(0, show.value).filter((message) => {
    return message !== null
  })
})

const work = computed(() => {
  const workData = authStore.work
  return workData?.chatreview
})

const modalOpen = computed(() => {
  const bodyoverflow = document.body.style.overflow
  return bodyoverflow === 'hidden'
})

// Watchers
watch(work, (newVal, oldVal) => {
  // TODO: The page is always going to be visible so why might we not be?
  console.log('TODO chats review work watch', newVal, oldVal)
  if (!modalOpen.value) {
    if (newVal > oldVal) {
      clearAndLoad()
    } else {
      const visible = true
      // TODO const visible = this.$store.getters['misc/get']('visible')

      if (!visible) {
        clearAndLoad()
      }
    }
  }
})

// Methods
function loadMore($state) {
  if (show.value < messages.value.length) {
    // This means that we will gradually add the messages that we have fetched from the server into the DOM.
    // Doing that means that we will complete our initial render more rapidly and thus appear faster.
    show.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}

async function reload() {
  await clearAndLoad()
}

async function clearAndLoad() {
  console.log('review clearAndLoad')
  // There's new stuff to do.  Reload.
  // We don't want to pick up any real chat messages.
  await chatStore.clear()

  await chatStore.fetchReviewChatsMT(REVIEWCHAT, {
    limit: limit.value,
  })

  bump.value++
}

function deleteAll(callback) {
  showDeleteModal.value = true
  callback()
}

function deleteConfirmed() {
  visibleMessages.value.forEach((m) => {
    if (!m.widerchatreview) {
      // TODO: This needs to use the store properly
      // chatStore.reject({ id: m.id, chatid: null })
    }
  })
}

// Lifecycle - mounted
onMounted(async () => {
  await clearAndLoad()
})
</script>
