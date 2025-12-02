<template>
  <div>
    <h2 v-if="group" class="visually-hidden">Community Information</h2>
    <GroupHeader
      v-if="group"
      :group="group"
      show-join
      :show-give-find="showGiveFind"
    />
    <h2 class="visually-hidden">List of wanteds and offers</h2>
    <div id="visobserver" v-observe-visibility="visibilityChanged" />
    <div v-if="deDuplicatedMessages?.length" id="messageList">
      <div
        v-if="!loading && selectedSort === 'Unseen' && showCountsUnseen && me"
      >
        <MessageListCounts
          v-if="browseCount && !search"
          :count="browseCount"
          @mark-seen="markSeen"
        />
      </div>
      <VisibleWhen :at="['xs', 'sm']">
        <div
          v-for="(m, ix) in deDuplicatedMessages"
          :key="'messagelist-' + m.id"
        >
          <div v-if="ix % 2 === 0">
            <MessageListUpToDate
              v-if="
                (!loading &&
                  selectedSort === 'Unseen' &&
                  showCountsUnseen &&
                  deDuplicatedMessages[ix]?.id === firstSeenMessage) ||
                deDuplicatedMessages[ix + 1]?.id === firstSeenMessage
              "
            />
            <div class="twocolumn">
              <div
                :id="'messagewrapper-' + m.id"
                :ref="'messagewrapper-' + m.id"
                class="onecolumn"
              >
                <OurMessage
                  :id="m.id"
                  :matchedon="m.matchedon"
                  :preload="ix < 6"
                  record-view
                  @not-found="messageNotFound(m.id)"
                />
              </div>
              <div
                v-if="ix + 1 < deDuplicatedMessages.length"
                :id="'messagewrapper-' + deDuplicatedMessages[ix + 1].id"
                :ref="'messagewrapper-' + deDuplicatedMessages[ix + 1].id"
                class="onecolumn"
              >
                <OurMessage
                  :id="deDuplicatedMessages[ix + 1].id"
                  :matchedon="deDuplicatedMessages[ix + 1].matchedon"
                  :preload="ix + 1 < 6"
                  record-view
                  @not-found="messageNotFound(deDuplicatedMessages[ix + 1].id)"
                />
              </div>
            </div>
          </div>
        </div>
      </VisibleWhen>
      <VisibleWhen :not="['xs', 'sm']">
        <div
          v-for="message in deDuplicatedMessages"
          :key="'messagelist-' + message.id"
        >
          <MessageListUpToDate
            v-if="
              !loading &&
              selectedSort === 'Unseen' &&
              showCountsUnseen &&
              message.id === firstSeenMessage
            "
          />
          <div
            :id="'messagewrapper-' + message.id"
            :ref="'messagewrapper-' + message.id"
            class=""
          >
            <OurMessage
              :id="message.id"
              :matchedon="message.matchedon"
              record-view
              @not-found="messageNotFound(message.id)"
            />
          </div>
        </div>
      </VisibleWhen>
    </div>
    <infinite-loading
      v-if="messagesForList?.length"
      :identifier="infiniteId"
      :distance="distance"
      @infinite="loadMore"
    >
      <template #error>&nbsp;</template>
      <template #complete>&nbsp;</template>
      <template #spinner>
        <div class="text-center">
          <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
        </div>
      </template>
    </infinite-loading>
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
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'
import { throttleFetches } from '~/composables/useThrottle'
import InfiniteLoading from '~/components/InfiniteLoading'
import VisibleWhen from '~/components/VisibleWhen'
import { useMe } from '~/composables/useMe'

const OurMessage = defineAsyncComponent(() =>
  import('~/components/OurMessage.vue')
)
const GroupHeader = defineAsyncComponent(() =>
  import('~/components/GroupHeader.vue')
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
// There will be a delay during which we will see the loader, but it's better to fetch a screenful than have the loader sliding down
// the screen. Once we've loaded then the loader will be shown by the infinite scroll, but we will normally
// not see it because of prefetching.
const initialIds = props.messagesForList
  ?.slice(0, MIN_TO_SHOW)
  .map((message) => message.id)

if (initialIds?.length) {
  messageStore.fetchMultiple(initialIds)
}

// Data
const myGroups = []
const toShow = ref(MIN_TO_SHOW)
const failedIds = ref(new Set())
const infiniteId = ref(props.bump)
const distance = ref(2000)
const prefetched = ref(0)
const emitted = ref(false)
let markSeenTimer = null
const markUnseenTries = ref(10)

// Computed properties
const browseCount = computed(() => {
  // Count the actual unseen messages that will be displayed (after de-duplication)
  return deDuplicatedMessages.value.filter((m) => m.unseen && !m.successful)
    .length
})

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
  // Ensure no more than one successful message in every four.  Makes us look good to show some.
  const ret = []

  props.messagesForList.forEach((m) => {
    if (m.successful) {
      // Don't want the first one to be shown as freegled.
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

  // We want to filter by:
  // - Possibly a message type
  // - Possibly a group id
  // - Don't show deleted posts.  Remember the map may lag a bit as it's only updated on cron, so we
  //   may be returned some.
  for (let i = 0; i < reduceSuccessful.value?.length && i < toShow.value; i++) {
    const m = reduceSuccessful.value[i]

    if (wantMessage(m)) {
      // Pass whether the message has been freegled or promised, which is returned in the summary call.
      let addIt = true

      if (m.successful) {
        if (myid.value === m.fromuser) {
          // Always show your own messages.  We have at least one freegler for whom this is emotionally
          // important.
          addIt = true
        } else {
          const daysago = dayjs().diff(dayjs(m.arrival), 'day')

          if (props.selectedType !== 'All') {
            // Don't show freegled posts if you're already filtering.
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
      // Filter out dups by subject (for crossposting).
      const message = filteredMessagesInStore.value[m.id]

      if (!message) {
        // We haven't yet fetched it, so we don't yet know if it's a dup.  We return it, which will fetch it, and
        // then we'll come back through here.
        ret.push(m)
      } else if (m.id in ids) {
        // We have already got this id in our list
      } else if (m.id !== props.exclude) {
        // We don't want our duplicate-detection to be confused by different keywords on different groups, so strip
        // out the keyword and put in the type.
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
            // We are planning to show a message which is a duplicate of the first seen.  To make sure we show
            // the notice about having seen messages below here, show this one instead.
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
  failedIds.value.add(id)
}

function visibilityChanged(visible) {
  if (!visible) {
    if (!emitted.value) {
      // Only emit this once, to stop us thrashing.
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
    // This is a backgrounded operation on the server and therefore won't happen immediately.
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

async function loadMore($state) {
  do {
    toShow.value++
  } while (
    toShow.value < reduceSuccessful.value?.length &&
    !wantMessage(reduceSuccessful.value[toShow.value])
  )

  if (
    toShow.value <= reduceSuccessful.value?.length &&
    wantMessage(reduceSuccessful.value[toShow.value])
  ) {
    // We need another message.
    const m = reduceSuccessful.value[toShow.value - 1]

    // We always want to trigger a fetch to the store, because the store will decide whether a cached message
    // needs refreshing.
    await throttleFetches()

    await messageStore.fetch(m.id)

    $state.loaded()
  } else {
    // We're showing all the messages
    $state.complete()

    if (me.value) {
      // Kick off a fetch of the unread count - normally done when we scroll down but we might skip if we've done
      // too frequently.
      messageStore.fetchCount(me.settings?.browseView, false)
    }
  }
}

watch(
  toShow,
  async (newVal) => {
    if (newVal + 5 > prefetched.value) {
      // We want to prefetch some messages so that they are ready in store for if/when we scroll down and want to
      // add them to the DOM.
      const ids = []

      for (
        let i = Math.max(newVal + 1, prefetched.value);
        i < reduceSuccessful.value.length && ids.length < 5;
        i++
      ) {
        if (wantMessage(reduceSuccessful.value[i])) {
          ids.push(reduceSuccessful.value[i].id)
        }

        prefetched.value = i
      }

      if (ids.length) {
        await throttleFetches()
        await messageStore.fetchMultiple(ids)
      }
    }
  },
  { immediate: true }
)

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
      // Any duplicates are things we won't ever show.  If they are unseen then they will be contributing to the
      // unseen count, but we don't want them to.  So mark such messages as seen.
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
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.twocolumn {
  display: flex;
  flex-wrap: wrap !important;
  grid-template-rows: 2.5px 1fr 2.5px;
  grid-template-columns: 1fr;
  grid-column-gap: 5px;

  @media only screen and (min-width: 360px) {
    display: grid;
    grid-template-rows: 2.5px 1fr 2.5px;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 5px;
  }

  > div {
    grid-row: 2 / 3;
  }

  :deep(.header-title) {
    display: flex;
    flex-direction: column;

    .spacer {
      display: flex;
      flex-grow: 1;
    }
  }

  :deep(.header-description.noAttachments) {
    grid-row: 5 / 6;

    .textbody {
      margin-top: 50px;
      font-size: 1rem;
      height: 100px;
      display: -webkit-box;
      -webkit-line-clamp: 4;
    }

    .description {
      display: block !important;
    }
  }

  :deep(.messagecard.noAttachments) {
    .image-wrapper {
      button {
        background-color: transparent;
      }
    }
  }

  .onecolumn {
    height: 100%;

    @media only screen and (max-width: 360px) {
      width: 100%;
    }

    @media only screen and (min-width: 360px) {
      width: unset;
    }

    // Only apply height:100% to old MessageSummary, not new MessageSummaryMobile
    :deep(.messagecard) {
      height: 100%;

      div {
        height: 100%;

        div {
          height: unset;
        }
      }
    }

    :deep(.freegleg),
    :deep(.promised),
    :deep(.image-wrapper) {
      height: unset;
    }

    // MessageSummaryMobile uses its own layout
    :deep(.message-summary-mobile) {
      height: auto;
    }
  }
}
</style>
