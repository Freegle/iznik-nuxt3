<template>
  <client-only>
    <b-row class="m-0">
      <b-col
        id="chatlist"
        cols="12"
        md="4"
        :class="
          'chatlist p-0 bg-white ' +
          (selectedChatId ? 'd-none d-md-block' : '') +
          ' ' +
          selectedChatId
        "
      >
        <b-card class="p-0">
          <b-card-body class="p-0">
            <div class="d-flex justify-content-between flex-wrap">
              <b-form-input
                v-model="search"
                placeholder="Search chats (e.g. 'Joe' or 'mods')"
                class="flex-shrink-1"
              />
              <b-button class="mt-1" variant="white" @click="markAllRead">
                <v-icon icon="check" /> Mark all read
              </b-button>
            </div>
          </b-card-body>
        </b-card>
        <ChatListEntry
          v-for="chat in visibleChats"
          :id="chat.id"
          :key="'chat-' + chat.id + bump"
          :class="{ active: chat && selectedChatId === parseInt(chat.id) }"
          @click="gotoChat(chat.id)"
        />
        <p v-if="!visibleChats || !visibleChats.length" class="ml-2">
          <span v-if="searching" class="pulsate"> Searching... </span>
          <span v-else-if="loading" class="pulsate"> Loading... </span>
          <span v-else> No chats to show. </span>
        </p>
        <infinite-loading
          :identifier="bump"
          force-use-infinite-wrapper="#chatlist"
          :distance="distance"
          @infinite="loadMore"
        >
          <template #no-results>
            <span />
          </template>
          <template #no-more>
            <span />
          </template>
        </infinite-loading>
        <div class="d-flex justify-content-around">
          <b-button
            v-if="search && complete"
            variant="white"
            class="mt-2"
            @click="searchMore"
          >
            <v-icon v-if="searching" icon="sync" class="text-success fa-spin" />
            <v-icon v-else icon="search" /> Search old chats
          </b-button>
        </div>
      </b-col>
      <b-col
        cols="12"
        md="8"
        :class="
          'chatback p-0 ' + (selectedChatId ? 'd-block' : 'd-none d-md-block')
        "
      >
        <ModChatPane
          v-if="selectedChatId"
          :id="selectedChatId"
          :key="'chatpane-' + selectedChatId"
        />
        <p v-else class="text-center text-muted mt-2">
          Please click on a chat in the left pane.
        </p>
      </b-col>
    </b-row>
  </client-only>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { useChatStore } from '~/stores/chat'

// Stores
const chatStore = useChatStore()

// Route
const route = useRoute()
const router = useRouter()

// Local state (formerly data())
const id = ref('id' in route.params ? parseInt(route.params.id) : 0)
if (isNaN(id.value)) id.value = 0
const showChats = ref(20)
const search = ref(null)
const searching = ref(false)
const searchlast = ref(null)
const loading = ref(true)
const complete = ref(false)
const bump = ref(1)
const distance = ref(1000)
const selectedChatId = ref(id.value ? id.value : null)
const showClosed = ref(false)

console.log('[[id]] created', route.params.id, id.value)

// Computed properties
const chats = computed(() => {
  return chatStore?.list ? chatStore.list : []
})

const filteredChats = computed(() => {
  return scanChats(showClosed.value, chats.value)
})

const visibleChats = computed(() => {
  const chatList =
    bump.value && filteredChats.value
      ? filteredChats.value.slice(0, showChats.value)
      : []
  return chatList
})

// Watchers
watch(search, (newVal, oldVal) => {
  showChats.value = 0
  bump.value = Date.now()

  if (!newVal) {
    // Force a refresh to remove any old chats.
    listChats()
  } else {
    // Force a server search to pick up old chats or more subtle matches.
    searchMore()
  }
})

// Methods
async function listChats(age, searchTerm) {
  const params = {
    chattypes: ['User2Mod', 'Mod2Mod'],
  }
  if (age) {
    params.age = age
  }
  if (searchTerm) {
    params.search = searchTerm
  }

  await chatStore.listChatsMT(params, id.value)
  bump.value++
}

function scanChats(closed, chatList) {
  // We apply the search on names in here so that we can respond on the client rapidly while the background server search is more thorough.
  let result = chatList ? [...chatList] : []

  if (result.length && search.value && searching.value) {
    const l = search.value.toLowerCase()
    result = result.filter((chat) => {
      if (
        chat.name.toLowerCase().includes(l) ||
        (chat.snippet &&
          typeof chat.snippet === 'string' &&
          chat.snippet.toLowerCase().includes(l))
      ) {
        // Found in the name of the chat (which may include a user
        return true
      }

      return false
    })
  }

  if (id.value) {
    result = result.filter((chat) => {
      if (!chat.id || !id.value) return false
      if (id.value && !closed && chat.id === id.value) {
        return true
      }

      if (chat.status === 'Blocked' || chat.status === 'Closed') {
        return closed
      }

      return !closed
    })
  }

  // Sort to show unseen first then more recent first
  result.sort((a, b) => {
    if (a.unseen === 0 && b.unseen > 0) {
      return 1
    } else if (a.unseen > 0 && b.unseen === 0) {
      return -1
    }
    if (a.lastdate && b.lastdate) {
      return dayjs(b.lastdate).diff(dayjs(a.lastdate))
    } else if (a.lastdate) {
      return -1
    } else if (b.lastdate) {
      return 1
    } else {
      return 0
    }
  })

  return result
}

function loadMore($state) {
  // We use an infinite scroll on the list of chats because even though we have all the data in hand, the less
  // we render onscreen the faster vue is to do so.
  const chatList = filteredChats.value
  showChats.value++

  if (showChats.value > chatList.length) {
    showChats.value = chatList.length
    $state.complete()
    complete.value = true
  } else {
    $state.loaded()
  }
}

async function markAllRead() {
  console.log('markAllRead A')
  loading.value = true
  for (const chat of filteredChats.value) {
    if (chat.unseen) {
      console.log('markAllRead B', chat.unseen, chat.lastmsg)
      await chatStore.markRead(chat.id)
    }
  }
  console.log('markAllRead C')

  chatStore.clear()
  await listChats()
  loading.value = false
}

function gotoChat(chatId) {
  router.push('/chats/' + chatId)
}

async function searchMore() {
  // console.log('searchMore', search.value, searchlast.value)
  if (searching.value) {
    // Queue until we've finished.
    searchlast.value = search.value
  } else {
    searching.value = search.value

    await listChats(null, search.value)

    while (searchlast.value) {
      // We have another search queued.
      const val2 = searchlast.value
      searching.value = searchlast.value
      searchlast.value = null
      await listChats(null, val2)
    }

    searching.value = null
  }
}

// Lifecycle (formerly mounted)
onMounted(async () => {
  // Do not clear chat store - all chats are got but only updated if lastdate changed
  // chatStore.clear()
  await listChats()
  loading.value = false
})
</script>

<style scoped lang="scss">
.chatback {
  background-color: $color-yellow--light;
}

.active {
  background-color: $color-gray--lighter;
}

.chatlist {
  max-height: calc(100vh - 74px);
  overflow-y: auto;
  overflow-x: hidden;
}

.greybord {
  border-color: $color-gray-4;
}
</style>
