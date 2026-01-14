<template>
  <div>
    <h2 v-if="group && showGroupHeader" class="visually-hidden">
      Community Information
    </h2>
    <GroupHeader
      v-if="group && showGroupHeader"
      :group="group"
      show-join
      :show-give-find="showGiveFind"
    />
    <h2 class="visually-hidden">List of wanteds and offers</h2>
    <div id="visobserver" v-observe-visibility="visibilityChanged" />

    <div v-if="!loading && selectedSort === 'Unseen' && showCountsUnseen && me">
      <MessageListCounts
        v-if="browseCount && !search"
        :count="browseCount"
        @mark-seen="markSeen"
      />
    </div>

    <!-- Split view: unseen messages, divider, seen messages -->
    <template
      v-if="!loading && selectedSort === 'Unseen' && showCountsUnseen && me"
    >
      <!-- Unseen messages grid -->
      <ScrollGrid
        v-if="unseenMessages.length"
        :items="unseenMessages"
        key-field="id"
        :loading="loading"
        :distance="distance"
        :initial-count="MIN_TO_SHOW"
        @load-more="handleLoadMore"
      >
        <template #item="{ item: m, index: ix }">
          <div
            :id="'messagewrapper-' + m.id"
            :ref="'messagewrapper-' + m.id"
            class="messagewrapper"
          >
            <Suspense>
              <OurMessage
                :id="m.id"
                :matchedon="m.matchedon"
                :preload="ix < 6"
                record-view
                @not-found="messageNotFound(m.id)"
              />
              <template #fallback>
                <MessageSkeleton />
              </template>
            </Suspense>
          </div>
        </template>
      </ScrollGrid>

      <!-- Divider between unseen and seen -->
      <MessageListUpToDate v-if="seenMessages.length" />

      <!-- Seen messages grid -->
      <ScrollGrid
        v-if="seenMessages.length"
        :items="seenMessages"
        key-field="id"
        :loading="loading"
        :distance="distance"
        :initial-count="MIN_TO_SHOW"
        @load-more="handleLoadMore"
      >
        <template #item="{ item: m, index: ix }">
          <div
            :id="'messagewrapper-' + m.id"
            :ref="'messagewrapper-' + m.id"
            class="messagewrapper"
          >
            <Suspense>
              <OurMessage
                :id="m.id"
                :matchedon="m.matchedon"
                :preload="ix < 6"
                record-view
                @not-found="messageNotFound(m.id)"
              />
              <template #fallback>
                <MessageSkeleton />
              </template>
            </Suspense>
          </div>
        </template>
      </ScrollGrid>
    </template>

    <!-- Standard single grid view (not in Unseen sort mode) -->
    <ScrollGrid
      v-else
      :items="deDuplicatedMessages"
      key-field="id"
      :loading="loading"
      :distance="distance"
      :initial-count="MIN_TO_SHOW"
      @load-more="handleLoadMore"
    >
      <template #item="{ item: m, index: ix }">
        <div
          :id="'messagewrapper-' + m.id"
          :ref="'messagewrapper-' + m.id"
          class="messagewrapper"
        >
          <Suspense>
            <OurMessage
              :id="m.id"
              :matchedon="m.matchedon"
              :preload="ix < 6"
              record-view
              @not-found="messageNotFound(m.id)"
            />
            <template #fallback>
              <MessageSkeleton />
            </template>
          </Suspense>
        </div>
      </template>
    </ScrollGrid>
  </div>
</template>
<script setup>
import {
  ref,
  computed,
  watch,
  defineAsyncComponent,
  onBeforeUnmount,
} from 'vue'
import dayjs from 'dayjs'
import MessageListUpToDate from './MessageListUpToDate'
import ScrollGrid from '~/components/ScrollGrid'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'
import { throttleFetches } from '~/composables/useThrottle'
import { useMe } from '~/composables/useMe'

const OurMessage = defineAsyncComponent(() =>
  import('~/components/OurMessage.vue')
)
const GroupHeader = defineAsyncComponent(() =>
  import('~/components/GroupHeader.vue')
)
const MessageSkeleton = defineAsyncComponent(() =>
  import('~/components/MessageSkeleton.vue')
)

const MIN_TO_SHOW = 10

const props = defineProps({
  messagesForList: {
    type: Array,
    required: true,
  },
  firstSeenMessage: {
    type: Number,
    required: false,
    default: null,
  },
  selectedGroup: {
    type: Number,
    required: false,
    default: null,
  },
  selectedType: {
    type: String,
    required: false,
    default: 'All',
  },
  selectedSort: {
    type: String,
    required: false,
    default: 'Unseen',
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  bump: {
    type: Number,
    required: false,
    default: 0,
  },
  exclude: {
    type: Number,
    required: false,
    default: null,
  },
  visible: {
    type: Boolean,
    required: false,
    default: true,
  },
  jobs: {
    type: Boolean,
    required: false,
    default: true,
  },
  showGiveFind: {
    type: Boolean,
    required: false,
    default: false,
  },
  showGroupHeader: {
    type: Boolean,
    required: false,
    default: true,
  },
  none: {
    type: Boolean,
    required: false,
    default: false,
  },
  showCountsUnseen: {
    type: Boolean,
    required: false,
    default: false,
  },
  search: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['update:none', 'update:visible'])

const groupStore = useGroupStore()
const messageStore = useMessageStore()
const { me, myid } = useMe()

// Get the initial messages to show in a single call.
const initialIds = props.messagesForList
  ?.slice(0, MIN_TO_SHOW)
  .map((message) => message.id)

if (initialIds?.length) {
  messageStore.fetchMultiple(initialIds)
}

// Data
const myGroups = []
const failedIds = ref(new Set())
const distance = ref(2000)
const prefetched = ref(0)
const emitted = ref(false)
let markSeenTimer = null
const markUnseenTries = ref(10)

// Computed properties
// Use the same count as the navbar - from the API via messageStore
const browseCount = computed(() => messageStore.count)

const group = computed(() => {
  let ret = null

  if (props.selectedGroup) {
    ret = groupStore?.get(props.selectedGroup)
  } else if (myGroups && myGroups.length === 1) {
    ret = groupStore?.get(myGroups[0].id)
  }

  return ret
})

const reduceSuccessful = computed(() => {
  const ret = []

  props.messagesForList.forEach((m) => {
    if (m.successful) {
      if (ret.length) {
        const lastfour = ret.slice(-4)
        let gotSuccessful = false

        lastfour.forEach((m) => {
          gotSuccessful |= m.successful
        })

        if (!gotSuccessful) {
          ret.push(m)
        }
      }
    } else {
      ret.push(m)
    }
  })

  return ret
})

const filteredMessagesToShow = computed(() => {
  const ret = []

  // ScrollGrid handles visibility limits, so we provide all filtered messages
  for (let i = 0; i < reduceSuccessful.value?.length; i++) {
    const m = reduceSuccessful.value[i]

    if (wantMessage(m)) {
      let addIt = true

      if (m.successful) {
        if (myid.value === m.fromuser) {
          addIt = true
        } else {
          const daysago = dayjs().diff(dayjs(m.arrival), 'day')

          if (props.selectedType !== 'All') {
            addIt = false
          } else if (daysago > 7) {
            addIt = false
          }
        }
      }

      if (addIt) {
        ret.push(m)
      }
    }
  }

  return ret
})

const filteredMessagesInStore = computed(() => {
  const ret = {}

  filteredMessagesToShow.value?.forEach((m) => {
    ret[m.id] = messageStore?.byId(m.id)
  })

  return ret
})

const deDuplicatedMessages = computed(() => {
  let ret = []
  const dups = []
  const ids = {}

  filteredMessagesToShow.value
    .filter((m) => !failedIds.value.has(m.id))
    .forEach((m) => {
      const message = filteredMessagesInStore.value[m.id]

      if (!message) {
        ret.push(m)
      } else if (m.id in ids) {
        // Already got this id
      } else if (m.id !== props.exclude) {
        ids[m.id] = true
        let key = message.fromuser + '|' + message.subject
        const p = message.subject.indexOf(':')

        if (p !== -1) {
          key =
            message.fromuser + '|' + message.type + message.subject.substring(p)
        }

        const already = key in dups

        if (m.id === props.firstSeenMessage) {
          if (already) {
            ret = ret.filter((m) => m.id !== dups[key])
          }
          ret.push(m)
        } else if (!already) {
          ret.push(m)
          dups[key] = m.id
        }
      }
    })

  return ret
})

const unseenMessages = computed(() => {
  return deDuplicatedMessages.value.filter((m) => m.unseen)
})

const seenMessages = computed(() => {
  return deDuplicatedMessages.value.filter((m) => !m.unseen)
})

const duplicates = computed(() => {
  const ret = []

  filteredMessagesToShow.value.forEach((m) => {
    if (!deDuplicatedMessages.value.find((d) => d.id === m.id)) {
      ret.push(m)
    }
  })

  return ret
})

const noneFound = computed(() => {
  return !props.loading && !deDuplicatedMessages.value?.length
})

// Methods
function wantMessage(m) {
  return (
    (props.selectedType === 'All' || props.selectedType === m?.type) &&
    (!props.selectedGroup ||
      parseInt(m?.groupid) === parseInt(props.selectedGroup))
  )
}

function messageNotFound(id) {
  failedIds.value = new Set([...failedIds.value, id])
}

function visibilityChanged(visible) {
  if (!visible) {
    if (!emitted.value) {
      emit('update:visible', visible)
      emitted.value = true
    }
  } else {
    emit('update:visible', visible)
  }
}

function markSeen() {
  const ids = []

  props.messagesForList.forEach((m) => {
    if (m.unseen) {
      ids.push(m.id)
    }
  })

  if (ids.length) {
    messageStore.markSeen(ids)
  }

  markSeenTimer = setTimeout(async () => {
    const count = await messageStore.fetchCount(me?.settings?.browseView, false)

    markUnseenTries.value--
    console.log('Mark unseen', count, markUnseenTries.value)

    if (markUnseenTries.value && count) {
      markSeen()
    } else {
      markUnseenTries.value = 10
    }
  }, 100)
}

async function handleLoadMore(currentIndex) {
  // Prefetch upcoming messages when scrolling.
  // ScrollGrid loads 10 items at a time, so we need to fetch at least 10 ahead.
  const batchSize = 15
  if (currentIndex + batchSize > prefetched.value) {
    const ids = []

    for (
      let i = Math.max(currentIndex, prefetched.value);
      i < reduceSuccessful.value.length && ids.length < batchSize;
      i++
    ) {
      if (wantMessage(reduceSuccessful.value[i])) {
        ids.push(reduceSuccessful.value[i].id)
      }

      prefetched.value = i + 1
    }

    if (ids.length) {
      await throttleFetches()
      await messageStore.fetchMultiple(ids)
    }
  }
}

watch(
  noneFound,
  (newVal) => {
    emit('update:none', newVal)
  },
  { immediate: true }
)

watch(
  duplicates,
  (newVal) => {
    if (me && newVal?.length) {
      const ids = []

      newVal.forEach((m) => {
        const message = filteredMessagesInStore.value[m.id]

        if (message?.unseen) {
          ids.push(m.id)
        }
      })

      if (ids.length) {
        messageStore.markSeen(ids)
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (markSeenTimer) {
    clearTimeout(markSeenTimer)
  }
})
</script>
<style scoped lang="scss">
.messagewrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
