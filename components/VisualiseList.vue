<template>
  <div class="d-flex justify-content-around minheight test-visualise-list">
    <MessageSummaryMobile
      v-if="msgid"
      :id="msgid"
      ref="clickSummary"
      class="w-100 mb-2 test-visualise-message"
    />
  </div>
</template>
<script setup>
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import MessageSummaryMobile from '~/components/MessageSummaryMobile'

console.log(
  '[VISUALISE_LIST_DEBUG] ========== COMPONENT SETUP START =========='
)
console.log('[VISUALISE_LIST_DEBUG] Component initializing...')

let running = true
const list = ref([])
let timer = null
const index = ref(0)

const item = computed(() => {
  const currentItem =
    index.value >= list.value?.length ? null : list.value[index.value]
  console.log(
    `[VISUALISE_LIST_DEBUG] Computed item: index=${index.value}, listLength=${
      list.value?.length
    }, item=${currentItem ? currentItem.id : 'null'}`
  )
  return currentItem
})

const msgid = computed(() => {
  const id = item.value ? item.value.id : null
  console.log(`[VISUALISE_LIST_DEBUG] Computed msgid: ${id}`)
  return id
})

const messageStore = useMessageStore()
const groupStore = useGroupStore()

console.log('[VISUALISE_LIST_DEBUG] Fetching group store...')
await groupStore.fetch()
console.log('[VISUALISE_LIST_DEBUG] Group store fetched successfully')

onMounted(() => {
  console.log(
    '[VISUALISE_LIST_DEBUG] Component mounted, setting initial timer (4000ms)'
  )
  // We used SSR so we have one rendered already.
  timer = setTimeout(doNext, 4000)
})

onBeforeUnmount(() => {
  console.log('[VISUALISE_LIST_DEBUG] Component unmounting, clearing timer')
  clearTimeout(timer)
})

// Get the messages.
console.log('[VISUALISE_LIST_DEBUG] Fetching messages in bounds...')
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

  console.log(
    `[VISUALISE_LIST_DEBUG] Fetched ${
      list.value?.length || 0
    } messages initially`
  )
  list.value = list.value.filter((item) => item.type === 'Offer')
  console.log(
    `[VISUALISE_LIST_DEBUG] After filtering for Offers: ${
      list.value?.length || 0
    } messages`
  )

  if (list.value.length) {
    console.log(
      `[VISUALISE_LIST_DEBUG] Fetching first message details for ID: ${list.value[0].id}`
    )
    // Get the first into store for render speed.
    await useMessageStore().fetch(list.value[0].id)
    console.log('[VISUALISE_LIST_DEBUG] First message fetched successfully')
  } else {
    console.log('[VISUALISE_LIST_DEBUG] No messages to fetch details for')
  }
} catch (e) {
  console.log(
    `[VISUALISE_LIST_DEBUG] ERROR: Failed to get list of messages: ${e.message}`
  )
  console.error('[VISUALISE_LIST_DEBUG] Full error:', e)
}

if (!list.value?.length) {
  console.log(
    '[VISUALISE_LIST_DEBUG] No messages available, stopping rotation (running = false)'
  )
  running = false
} else {
  console.log(
    `[VISUALISE_LIST_DEBUG] Messages available, rotation will continue (running = true, ${list.value.length} messages)`
  )
}

watch(
  msgid,
  async (newVal) => {
    console.log(
      `[VISUALISE_LIST_DEBUG] Watch msgid triggered: newVal=${newVal}`
    )
    if (newVal) {
      try {
        console.log(
          `[VISUALISE_LIST_DEBUG] Fetching message details for ID: ${newVal}`
        )
        await messageStore.fetch(newVal)
        const message = messageStore.byId(newVal)
        console.log(
          `[VISUALISE_LIST_DEBUG] Message fetched. Attachments count: ${
            message.attachments?.length || 0
          }`
        )

        if (!message.attachments?.length) {
          // We only want to show pretty items - remove this message from the list
          console.log(
            '[VISUALISE_LIST_DEBUG] No attachments, removing message from list and calling doNext()'
          )
          console.log(
            `[VISUALISE_LIST_DEBUG] Before removal: ${list.value.length} messages, current index: ${index.value}`
          )

          // Remove the current message from the list
          list.value.splice(index.value, 1)

          console.log(
            `[VISUALISE_LIST_DEBUG] After removal: ${list.value.length} messages`
          )

          // Adjust index if we removed the last item
          if (index.value >= list.value.length && list.value.length > 0) {
            console.log(
              '[VISUALISE_LIST_DEBUG] Index beyond list end, wrapping to 0'
            )
            index.value = 0
          }

          // Check if we still have messages to show
          if (list.value.length === 0) {
            console.log(
              '[VISUALISE_LIST_DEBUG] No messages left after filtering, stopping rotation'
            )
            running = false
          } else {
            console.log(
              `[VISUALISE_LIST_DEBUG] ${list.value.length} messages remaining, continuing rotation`
            )
            // Don't call doNext() here - the index change will trigger the watch again
          }
        } else {
          // Set timer for next item.
          console.log(
            '[VISUALISE_LIST_DEBUG] Message has attachments, setting 3000ms timer for next rotation'
          )
          timer = setTimeout(doNext, 3000)
        }
      } catch (e) {
        console.log(
          `[VISUALISE_LIST_DEBUG] ERROR fetching message ${newVal}: ${e.message}`
        )
        console.log('[VISUALISE_LIST_DEBUG] Removing failed message from list')
        console.log(
          `[VISUALISE_LIST_DEBUG] Before removal: ${list.value.length} messages, current index: ${index.value}`
        )

        // Remove the failed message from the list
        list.value.splice(index.value, 1)

        console.log(
          `[VISUALISE_LIST_DEBUG] After removal: ${list.value.length} messages`
        )

        // Adjust index if we removed the last item
        if (index.value >= list.value.length && list.value.length > 0) {
          console.log(
            '[VISUALISE_LIST_DEBUG] Index beyond list end, wrapping to 0'
          )
          index.value = 0
        }

        // Check if we still have messages to show
        if (list.value.length === 0) {
          console.log(
            '[VISUALISE_LIST_DEBUG] No messages left after error filtering, stopping rotation'
          )
          running = false
        } else {
          console.log(
            `[VISUALISE_LIST_DEBUG] ${list.value.length} messages remaining after error, continuing rotation`
          )
          // Don't call doNext() here - the index change will trigger the watch again
        }
      }
    } else {
      console.log(
        '[VISUALISE_LIST_DEBUG] msgid is null, skipping message fetch'
      )
    }
  },
  { immediate: true }
)

function doNext() {
  console.log(
    `[VISUALISE_LIST_DEBUG] doNext() called. Current state: running=${running}, listLength=${list.value.length}, currentIndex=${index.value}`
  )

  if (timer) {
    console.log('[VISUALISE_LIST_DEBUG] Clearing existing timer')
    clearTimeout(timer)
  }

  if (running && list.value.length > 1) {
    const oldIndex = index.value
    index.value++

    if (index.value >= list.value.length) {
      console.log(
        '[VISUALISE_LIST_DEBUG] Reached end of list, wrapping to index 0'
      )
      index.value = 0
    }

    console.log(
      `[VISUALISE_LIST_DEBUG] Index changed from ${oldIndex} to ${index.value}`
    )
  } else {
    console.log(
      `[VISUALISE_LIST_DEBUG] Not advancing: running=${running}, listLength=${list.value.length}`
    )
  }
}

console.log(
  '[VISUALISE_LIST_DEBUG] ========== COMPONENT SETUP COMPLETE =========='
)
console.log(
  `[VISUALISE_LIST_DEBUG] Final state: running=${running}, listLength=${
    list.value?.length || 0
  }, initialIndex=${index.value}`
)
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

/* Hack MessageSummaryMobile to look better in this context. */
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
