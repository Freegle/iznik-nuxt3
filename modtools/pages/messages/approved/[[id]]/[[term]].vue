<template>
  <client-only>
    <ScrollToTop :prepend="groupName" />
    <div class="d-flex justify-content-between flex-wrap">
      <ModGroupSelect
        v-model="chosengroupid"
        all
        modonly
        remember="approved"
        :url-override="urlOverride"
      />
      <ModFindMessagesFromMember @searched="searchedMember" />
      <ModFindMessage
        v-if="groupid"
        :groupid="groupid"
        :message-term="messageTerm"
        @searched="searchedMessage"
        @changed="changedMessageTerm"
      />
      <span v-else class="mt-2"> Select a community to search messages. </span>
      <ModtoolsViewControl misckey="modtoolsMessagesApprovedSummary" />
    </div>
    <div>
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        Nothing found. Almost always this is because the member or message
        doesn't exist (or has been very deleted).
      </NoticeMessage>
      <ModMessages :group="group" />
      <infinite-loading
        direction="top"
        force-use-infinite-wrapper="true"
        :distance="10"
        :identifier="bump"
        @infinite="loadMore"
      >
        <template #spinner>
          <b-img lazy src="/loader.gif" alt="Loading" />
        </template>
      </infinite-loading>
    </div>
  </client-only>
</template>

<script setup>
// Handles:
//  /messages/approved
//  /messages/approved/<groupid>
//  /messages/approved/<groupid>/<term>
// Once mounted:
//  - changing group changes URL - though sometimes doesn't work
//  - Email/name/id search doesn't change URL
//  - Message id/subject search changes URL <term>

import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { setupModMessages } from '@/composables/useModMessages'
import { useMe } from '~/composables/useMe'

// Stores
const messageStore = useMessageStore()

// Composables
const modMessages = setupModMessages(true)
modMessages.summarykey.value = 'modtoolsMessagesApprovedSummary'
modMessages.collection.value = 'Approved'

const { me } = useMe()

// Destructure modMessages for template access
const {
  busy,
  context,
  group,
  groupid,
  show,
  collection,
  messageTerm,
  memberTerm,
  distance,
  messages,
} = modMessages

// Local state (formerly data())
const chosengroupid = ref(0)
const bump = ref(0)
const urlOverride = ref(false)

// Computed properties
const id = computed(() => {
  const route = useRoute()
  if ('id' in route.params && route.params.id) {
    return parseInt(route.params.id)
  }
  return 0
})

const groupName = computed(() => {
  if (group.value) {
    return group.value.namedisplay
  }
  return null
})

// Watchers
watch(chosengroupid, (newVal) => {
  const router = useRouter()
  if (newVal !== id.value) {
    nextTick(() => {
      if (newVal === 0) {
        router.push('/messages/approved/')
      } else {
        groupid.value = newVal // Sometimes route change does not work so save as groupid just in case
        router.push('/messages/approved/' + newVal)
      }
    })
  }
})

// Lifecycle
onMounted(() => {
  const route = useRoute()
  groupid.value = id.value
  chosengroupid.value = id.value
  memberTerm.value = ''
  messageTerm.value = ''
  // Mark that URL explicitly set the group (even if 0 for "All").
  if ('id' in route.params && route.params.id !== undefined) {
    urlOverride.value = true
  }
  if ('term' in route.params && route.params.term) {
    messageTerm.value = route.params.term
  }
  if (messageTerm.value) {
    // Clear existing messages and reset state for fresh search.
    // Without this, the store may have old messages that get shown
    // instead of searching for the specific message from the URL.
    show.value = 0
    context.value = null
    messageStore.clear()
    bump.value++
  }
})

// Methods
function changedMessageTerm(term) {
  messageTerm.value = term.trim()
}

function searchedMessage(term) {
  const router = useRouter()
  term = term.trim()
  if (term.length > 0) {
    router.push('/messages/approved/' + groupid.value + '/' + term)
  } else if (groupid.value) {
    router.push('/messages/approved/' + groupid.value)
  } else {
    router.push('/messages/approved/')
  }
}

function searchedMember(term) {
  show.value = 0
  messageTerm.value = null
  memberTerm.value = term?.trim()
  context.value = null
  messageStore.clear()

  // Need to rerender the infinite scroll
  bump.value++
}

async function loadMore($state) {
  busy.value = true
  if (!me.value) {
    console.log('Ignore load more on MT page with no session.')
    $state.complete()
  } else if (show.value < messages.value.length) {
    // This means that we will gradually add the messages that we have fetched from the server into the DOM.
    // Doing that means that we will complete our initial render more rapidly and thus appear faster.
    show.value++
    $state.loaded()
  } else {
    const currentCount = Object.keys(messageStore.list).length // Use total messages found, not just messages as this stops too soon

    let params

    if (messageTerm.value) {
      params = {
        subaction: 'searchall',
        search: messageTerm.value,
        exactonly: true,
        groupid: groupid.value,
      }
    } else if (memberTerm.value) {
      params = {
        // TODO: Need to keep fetching as first found batch may not contain
        subaction: 'searchmemb',
        search: memberTerm.value,
        // groupid: groupid.value // TODO: First fetch without this and then second with, with context
      }
      if (context.value) {
        // To get it to work for this case, only set groupid if already got a context!
        params.groupid = groupid.value
      }
    } else {
      params = {
        groupid: groupid.value,
        collection: collection.value,
        modtools: true,
        summary: false,
      }
    }

    params.context = context.value
    params.limit = messages.value.length + distance.value

    await messageStore.fetchMessagesMT(params)
    context.value = messageStore.context

    if (currentCount === Object.keys(messageStore.list).length) {
      $state.complete()
    } else {
      $state.loaded()
      show.value++
    }
  }
  busy.value = false
}
</script>
