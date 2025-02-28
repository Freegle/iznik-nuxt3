<template>
  <client-only v-if="me">
    <ContactDetailsAskModal
      v-if="showContactDetailsAskModal"
      @hidden="showContactDetailsAskModal = false"
    />
    <VisibleWhen :at="['xs', 'sm']">
      <Teleport v-if="loggedIn && id && chat" to="#navbar-mobile">
        <ChatMobileNavbar :id="id" />
      </Teleport>
    </VisibleWhen>
    <div>
      <h1 class="visually-hidden">Chats</h1>
      <b-row class="m-0">
        <b-col id="chatlist" cols="12" md="4" xl="3" class="p-0 bg-white">
          <VisibleWhen
            :at="
              selectedChatId
                ? ['md', 'lg', 'xl', 'xxl']
                : ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
            "
          >
            <div
              class="chatlist"
              :class="{
                stickyAdRendered,
              }"
            >
              <div class="notda">
                <div
                  class="d-flex justify-content-between flex-wrap mb-2 mt-3 border-bottom"
                >
                  <form
                    role="search"
                    class="mb-1 mr-1 ml-1 ml-md-0"
                    @submit.prevent
                  >
                    <label for="search-bar" class="visually-hidden"
                      >Search chats</label
                    >
                    <b-form-input
                      id="search-bar"
                      v-model="search"
                      placeholder="Search chats"
                      class="flex-shrink-1"
                    />
                  </form>
                  <b-button
                    variant="primary"
                    class="mb-1 ml-1 ml-md-0"
                    @click="markAllRead"
                  >
                    <v-icon icon="check" />
                    Mark all read
                  </b-button>
                </div>
                <p
                  v-if="!visibleChats?.length && !closedChats?.length"
                  class="ml-2"
                >
                  <span v-if="searching" class="pulsate"> Searching... </span>
                  <span v-else> No chats to show. </span>
                </p>
                <div v-else>
                  <div
                    v-if="closedChats.length"
                    class="d-flex justify-content-around"
                  >
                    <b-button
                      variant="link"
                      size="sm"
                      @click="showClosed = !showClosed"
                    >
                      <b-badge
                        v-if="closedCount"
                        variant="danger"
                        class="closedCount mr-1"
                        title="Closed chats with unread messages"
                      >
                        {{ closedCount }}
                      </b-badge>
                      <span v-if="showClosed">Hide</span>
                      <span v-else>Show </span>
                      {{ closedChats.length }} hidden/blocked chat<span
                        v-if="closedChats.length > 1"
                        >s</span
                      >
                    </b-button>
                  </div>
                  <div v-if="showClosed">
                    <div
                      v-for="c in closedChats"
                      :key="'chat-' + c.id"
                      :class="{
                        chat: true,
                        active: selectedChatId === c?.id,
                      }"
                      @click="gotoChat(c.id)"
                    >
                      <ChatListEntry
                        v-if="c.lastmsg > 0"
                        :id="c.id"
                        :active="selectedChatId === c?.id"
                      />
                    </div>
                  </div>
                  <div v-else>
                    <div
                      v-for="c in visibleChats"
                      :key="'chat-' + c.id"
                      :class="{
                        chat: true,
                        active: selectedChatId === c?.id,
                      }"
                      @click="gotoChat(c.id)"
                    >
                      <ChatListEntry
                        v-if="c.lastmsg > 0"
                        :id="c.id"
                        :active="selectedChatId === c?.id"
                      />
                    </div>
                  </div>
                  <infinite-loading
                    :identifier="bump"
                    :distance="distance"
                    @infinite="loadMore"
                  >
                    <template #error>&nbsp;</template>
                    <template #complete>&nbsp;</template>
                    <template #spinner>&nbsp;</template>
                  </infinite-loading>
                </div>
                <div class="d-flex justify-content-around">
                  <b-button
                    v-if="
                      !search && mightBeOldChats && complete && !showingOlder
                    "
                    variant="link"
                    size="sm"
                    @click="fetchOlder"
                  >
                    Show older chats
                  </b-button>
                </div>
                <div class="d-flex justify-content-around mt-2">
                  <b-button
                    v-if="complete && visibleChats && visibleChats.length"
                    variant="link"
                    size="sm"
                    @click="showHideAll"
                  >
                    Hide all chats
                  </b-button>
                </div>
              </div>
              <VisibleWhen
                v-if="!selectedChatId"
                :at="['md', 'lg']"
                class="chatda"
              >
                <ExternalDa
                  ad-unit-path="/22794232631/freegle_chat_app"
                  max-height="50px"
                  max-width="300px"
                  div-id="div-gpt-ad-1691925773522-0"
                  class="mt-2"
                />
              </VisibleWhen>
            </div>
          </VisibleWhen>
        </b-col>
        <b-col cols="12" md="8" xl="6" class="chatback p-0">
          <VisibleWhen
            :at="
              selectedChatId
                ? ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
                : ['md', 'lg', 'xl', 'xxl']
            "
          >
            <p
              v-if="!visibleChats?.length && !closedChats?.length"
              class="ml-2"
            >
              <span v-if="searching" class="pulsate"> Searching... </span>
              <span v-else> No chats to show. </span>
            </p>
            <ChatPane
              :id="selectedChatId"
              :key="'chatpane-' + selectedChatId"
            />
          </VisibleWhen>
        </b-col>
        <b-col cols="0" xl="3" class="p-0 pl-1">
          <VisibleWhen :at="['xl', 'xxl']">
            <SidebarRight
              show-job-opportunities
              ad-unit-path="/22794232631/freegle_chat_app"
              ad-div-id="div-gpt-ad-1691925773522-0"
            />
          </VisibleWhen>
        </b-col>
      </b-row>
      <ChatHideModal
        v-if="showHideAllModal"
        @confirm="hideAll"
        @hidden="showHideAllModal = false"
      />
    </div>
  </client-only>
</template>
<script setup>
import dayjs from 'dayjs'

import { storeToRefs } from 'pinia'
import { buildHead } from '../../composables/useBuildHead'
import { useAuthStore } from '../../stores/auth'
import { ref, useRoute, useRouter } from '#imports'
import VisibleWhen from '~/components/VisibleWhen'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useChatStore } from '~/stores/chat'
import SidebarRight from '~/components/SidebarRight'
import ChatMobileNavbar from '~/components/ChatMobileNavbar.vue'
import ExternalDa from '~/components/ExternalDa.vue'

// We can't use async on ChatListEntry else the infinite scroll kicks in and tries to load everything while we are
// still waiting for the import to complete.
import ChatListEntry from '~/components/ChatListEntry.vue'
import { useMiscStore } from '~/stores/misc'

const ContactDetailsAskModal = defineAsyncComponent(() =>
  import('~/components/ContactDetailsAskModal.vue')
)

const ChatHideModal = defineAsyncComponent(() =>
  import('~/components/ChatHideModal')
)

const chatStore = useChatStore()
const authStore = useAuthStore()
const miscStore = useMiscStore()

const stickyAdRendered = computed(() => {
  return miscStore.stickyAdRendered
})

definePageMeta({
  layout: 'login',
})

let title = 'Chats'
let description = "See the conversations you're having with other freeglers."

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const myid = authStore.user?.id
const showChats = ref(20)

// When there's a flag in the chat store to show the modal.  Don't reset the value in the store here otherwise
// reactivity will stop the modal being shown.
const showContactDetailsAskModal =
  storeToRefs(chatStore).showContactDetailsAskModal

const id = route.params.id ? parseInt(route.params.id) : 0

let chat = null

const search = ref(null)

if (route.query.search) {
  search.value = route.query.search
}

if (myid) {
  // Fetch the list of chats.
  await chatStore.fetchChats(search.value, true, id)

  // Is this chat in the list?
  chat = chatStore.byChatId(id)

  if (!chat) {
    // Might be old.  Try fetching it specifically.
    try {
      chat = await chatStore.fetchChat(id)
    } catch (e) {
      console.log("Couldn't fetch chat", id, e)
    }
  } else {
    // We have the chat, but maybe it's not quite up to date (e.g. a new message).  So fetch, but don't wait.
    title = chat.name
    description = 'Chat with ' + chat.name

    chatStore.fetchChat(id)
  }

  if (id) {
    // Find id in the list of chats.
    const index = chatStore.list.findIndex((c) => c.id === id)
    showChats.value = Math.max(showChats.value, index + 1)
  }
}

useHead(buildHead(route, runtimeConfig, title, description))

const showHideAllModal = ref(false)
const minShowChats = ref(20)
const searching = ref(false)
const searchlast = ref(null)
const complete = ref(false)
const bump = ref(1)
const distance = ref(1000)
const selectedChatId = ref(null)
const showClosed = ref(false)

const chats = computed(() => {
  return chatStore?.list ? chatStore.list : []
})
const showingOlder = computed(() => {
  return chatStore.searchSince !== null
})
const closedChats = computed(() => {
  return scanChats(true, chats.value)
})
const closedCount = computed(() => {
  let ret = 0

  for (const chat of closedChats.value) {
    if (chat.status === 'Closed') {
      ret += chat.unseen
    }
  }

  return ret
})

const filteredChats = computed(() => {
  return scanChats(showClosed.value, chats.value)
})
const visibleChats = computed(() => {
  const chats =
    bump.value && filteredChats.value
      ? filteredChats.value.slice(0, showChats.value)
      : []

  return chats
})
const mightBeOldChats = computed(() => {
  const now = dayjs()

  const me = authStore.user
  if (me) {
    const daysago = now.diff(dayjs(me.added), 'days')

    if (daysago > 31) {
      // They've been on the platform log enough that there might be old chats
      return true
    }
  }

  return false
})

watch(search, (newVal, oldVal) => {
  showChats.value = minShowChats.value
  bump.value++

  if (!newVal) {
    // Force a refresh to remove any old chats.
    chatStore.fetchChats()
  } else if (newVal.length > 2) {
    // Force a server search to pick up old chats or more subtle matches.
    searchMore()
  }
})

onMounted(() => {
  selectedChatId.value = null

  if (authStore.user) {
    const route = useRoute()
    selectedChatId.value = route.params.id ? parseInt(route.params.id) : 0
  }
})

onBeforeUnmount(() => {
  if (chatStore) {
    chatStore.searchSince = null
  }
})

async function fetchOlder() {
  chatStore.searchSince = '2009-09-11'
  await chatStore.fetchChats()
  bump.value++
}

function showHideAll() {
  showHideAllModal.value = true
}

async function hideAll() {
  for (let i = 0; i < visibleChats.value.length; i++) {
    await chatStore.hide(visibleChats.value[i].id)
  }

  const router = useRouter()
  router.push('/chats')
}

function scanChats(closed, chats) {
  if (chats && search.value) {
    const l = search.value.toLowerCase()
    chats = chats.filter((chat) => {
      if (
        chat.name.toLowerCase().includes(l) ||
        (chat.snippet && chat.snippet.toLowerCase().includes(l))
      ) {
        // Found in the name of the chat (which may include a user
        return true
      }

      return false
    })
  }

  chats = chats.filter((chat) => {
    if (id && !closed && chat.id === id) {
      return true
    }

    if (chat.status === 'Blocked' || chat.status === 'Closed') {
      return closed
    }

    return !closed
  })

  // Sort by last date.
  chats.sort((a, b) => {
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

  return chats
}

function loadMore($state) {
  // We use an infinite scroll on the list of chats because even though we have all the data in hand, the less
  // we render onscreen the faster vue is to do so.
  const chats = filteredChats.value
  showChats.value++

  if (showChats.value > chats.length) {
    showChats.value = chats.length
    $state.complete()
    complete.value = true
  } else {
    $state.loaded()
  }
}

async function markAllRead() {
  for (const chat of filteredChats.value) {
    if (chat.unseen) {
      await chatStore.markRead(chat.id)
    }
  }

  chatStore.fetchChats()
}

function gotoChat(id) {
  const router = useRouter()

  if (selectedChatId.value) {
    // We just replace the route, which is quicker than navigating and re-rendering this page.
    //
    // This means that history won't get updated, which means that Back will go to the top-level /chats page.
    // That is nice behaviour otherwise you have to hit Back a lot if you've viewed several chats.
    selectedChatId.value = id
    let url = id ? '/chats/' + id : '/chats'

    if (search.value) {
      url += '?search=' + search.value
    }

    router.replace(url)
  } else {
    router.push(id ? '/chats/' + id : '/chats')
  }
}

async function searchMore() {
  if (searching.value) {
    // Queue until we've finished.
    searchlast.value = search.value
  } else {
    searching.value = search.value

    await chatStore.fetchChats(search.value)

    showChats.value = minShowChats.value
    bump.value++

    while (searchlast.value) {
      // We have another search queued.
      const val2 = searchlast.value
      searching.value = searchlast.value
      searchlast.value = null
      await chatStore.fetchChats(val2)
      showChats.value = minShowChats.value
      bump.value++
    }

    searching.value = null
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/sidebar-ads.scss';

.chatback {
  background-color: $color-yellow--light;
}

.active {
  background-color: $color-gray-4 !important;
}

.chat:hover {
  background-color: $color-gray--lighter;
}

.chatlist {
  // On mobile we substitute a different height navbar on this page.
  height: calc(100vh - 58px);

  @include media-breakpoint-up(md) {
    height: calc(100vh - var(--header-navbar-height));
  }

  &.stickyAdRendered {
    height: calc(100vh - 58px - $sticky-banner-height-mobile);

    @include media-breakpoint-up(md) {
      height: calc(
        100vh - var(--header-navbar-height) - $sticky-banner-height-desktop
      );
    }
  }

  @supports (height: 100dvh) {
    height: calc(100dvh - 58px);

    @include media-breakpoint-up(md) {
      height: calc(100dvh - var(--header-navbar-height));
    }

    &.stickyAdRendered {
      height: calc(100dvh - 58px - $sticky-banner-height-mobile);

      @include media-breakpoint-up(md) {
        height: calc(
          100dvh - var(--header-navbar-height) - $sticky-banner-height-desktop
        );
      }
    }
  }

  display: flex;
  flex-direction: column;

  .notda {
    flex-shrink: 1;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-gutter: stable;
  }

  .chatda {
    display: flex;
    flex-direction: column;
  }
}

.closedCount {
  border-radius: 50%;
}
</style>
