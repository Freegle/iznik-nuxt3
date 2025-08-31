<template>
  <div class="d-flex justify-content-around minheight test-visualise-list">
    <MessageSummary
      v-if="msgid"
      :id="msgid"
      ref="clickSummary"
      :replyable="false"
      :show-freegled="false"
      :show-promised="false"
      :show-location="false"
      class="w-100 mb-2 test-visualise-message"
      preload
      wide
      @click.prevent.self
    />
  </div>
</template>
<script setup>
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'

let running = true
const list = ref([])
let timer = null
const index = ref(0)

const item = computed(() => {
  return index.value >= list.value?.length ? null : list.value[index.value]
})

const msgid = computed(() => {
  return item.value ? item.value.id : null
})

const messageStore = useMessageStore()
const groupStore = useGroupStore()

await groupStore.fetch()

onMounted(() => {
  // We used SSR so we have one rendered already.
  timer = setTimeout(doNext, 4000)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

// Get the messages.
try {
  list.value = await useMessageStore().fetchInBounds(
    49.45,
    -9,
    61,
    2,
    null,
    50,
    true
  )

  list.value = list.value.filter((item) => item.type === 'Offer')

  if (list.value.length) {
    // Get the first into store for render speed.
    await useMessageStore().fetch(list.value[0].id)
  }
} catch (e) {
  console.log('Failed to get list of messages')
}

if (!list.value?.length) {
  running = false
}

watch(
  msgid,
  async (newVal) => {
    if (newVal) {
      try {
        await messageStore.fetch(newVal)
        const message = messageStore.byId(newVal)

        if (!message.attachments?.length) {
          // We only want to show pretty items.
          doNext()
        } else {
          // Set timer for next item.
          timer = setTimeout(doNext, 3000)
        }
      } catch (e) {
        doNext()
      }
    }
  },
  { immediate: true }
)

function doNext() {
  if (timer) {
    clearTimeout(timer)
  }

  if (running && list.value.length > 1) {
    index.value++

    if (index.value >= list.value.length) {
      index.value = 0
    }
  }
}
</script>
<style scoped lang="scss">
// We hack the display of message summaries a bit to shrink them.
:deep(.textbody) {
  -webkit-line-clamp: 1;
}

:deep(.header-history) {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.minheight {
  min-height: 320px;
}

// Hack MessageSummary to look better in this context.
:deep {
  .thumbnail img {
    width: unset !important;
  }

  .header-title {
    width: 100% !important;
  }

  .item {
    a {
      width: 100% !important;
      text-align: center;
    }
  }
}
</style>
