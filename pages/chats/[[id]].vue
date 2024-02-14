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
            <div class="chatlist">
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
                    <v-icon icon="check" /> Mark all read
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
                :at="['xs', 'sm', 'md', 'lg']"
                class="chatda"
              >
                <ExternalDa
                  ad-unit-path="/22794232631/freegle_chat_app"
                  :dimensions="[300, 50]"
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
              v-else-if="selectedChatId"
              :id="selectedChatId"
              :key="'chatpane-' + selectedChatId"
            />
            <p v-else class="text-center text-info font-weight-bold mt-2">
              Please click on a chat in the left pane.
            </p>
          </VisibleWhen>
        </b-col>
        <b-col cols="0" xl="3" class="p-0 pl-1">
          <VisibleWhen
            :at="['xl', 'xxl']"
            :class="[adsVisible && 'sidebar-with-ads']"
          >
            <ExternalDa
              ad-unit-path="/22794232631/freegle_chat_desktop"
              :dimensions="[300, 250]"
              div-id="div-gpt-ad-1692867596111-0"
              class="mt-2"
              @rendered="adsVisible = $event"
            />
            <SidebarRight :show-job-opportunities="true" />
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
<script>
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

// We can't use async on ChatListEntry else the infinite scroll kicks in and tries to load everything while we are
// still waiting for the import to complete.
import ChatListEntry from '~/components/ChatListEntry.vue'
const ContactDetailsAskModal = defineAsyncComponent(() =>
  import('~/components/ContactDetailsAskModal.vue')
)

const ChatHideModal = defineAsyncComponent(() =>
  import('~/components/ChatHideModal')
)

export default {
  components: {
    VisibleWhen,
    SidebarRight,
    ChatListEntry,
    ContactDetailsAskModal,
    ChatHideModal,
    InfiniteLoading,
    ChatMobileNavbar,
  },
  async setup(props) {
    definePageMeta({
      layout: 'login',
    })

    let title = 'Chats'
    let description =
      "See the conversations you're having with other freeglers."

    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    const chatStore = useChatStore()
    const authStore = useAuthStore()
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

    return {
      showContactDetailsAskModal,
      chatStore,
      showChats,
      id,
      chat,
      search,
    }
  },
  data() {
    return {
      showHideAllModal: false,
      minShowChats: 20,
      searching: false,
      complete: false,
      bump: 1,
      distance: 1000,
      selectedChatId: null,
      showClosed: false,
      adsVisible: false,
    }
  },
  computed: {
    chats() {
      return this.chatStore?.list ? this.chatStore.list : []
    },
    showingOlder() {
      return this.chatStore.searchSince !== null
    },
    closedChats() {
      return this.scanChats(true, this.chats)
    },
    closedCount() {
      let ret = 0

      for (const chat of this.closedChats) {
        if (chat.status === 'Closed') {
          ret += chat.unseen
        }
      }

      return ret
    },
    filteredChats() {
      return this.scanChats(this.showClosed, this.chats)
    },
    visibleChats() {
      const chats =
        this.bump && this.filteredChats
          ? this.filteredChats.slice(0, this.showChats)
          : []

      return chats
    },
    mightBeOldChats() {
      const now = dayjs()

      if (this.me) {
        const daysago = now.diff(dayjs(this.me.added), 'days')

        if (daysago > 31) {
          // They've been on the platform log enough that there might be old chats
          return true
        }
      }

      return false
    },
  },
  watch: {
    search(newVal, oldVal) {
      this.showChats = this.minShowChats
      this.bump++

      if (!newVal) {
        // Force a refresh to remove any old chats.
        this.chatStore.fetchChats()
      } else if (newVal.length > 2) {
        // Force a server search to pick up old chats or more subtle matches.
        this.searchMore()
      }
    },
  },
  mounted() {
    this.selectedChatId = null

    if (this.myid) {
      const route = useRoute()
      this.selectedChatId = route.params.id ? parseInt(route.params.id) : 0
    }
  },
  beforeUnmount() {
    if (this.chatStore) {
      this.chatStore.searchSince = null
    }
  },
  methods: {
    async fetchOlder() {
      this.chatStore.searchSince = '2009-09-11'
      await this.chatStore.fetchChats()
      this.bump++
    },
    showHideAll() {
      this.showHideAllModal = true
    },
    async hideAll() {
      for (let i = 0; i < this.visibleChats.length; i++) {
        await this.chatStore.hide(this.visibleChats[i].id)
      }

      const router = useRouter()
      router.push('/chats')
    },
    scanChats(closed, chats) {
      if (chats && this.search) {
        const l = this.search.toLowerCase()
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
        if (this.id && !closed && chat.id === this.id) {
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
    },
    loadMore($state) {
      // We use an infinite scroll on the list of chats because even though we have all the data in hand, the less
      // we render onscreen the faster vue is to do so.
      const chats = this.filteredChats
      this.showChats++

      if (this.showChats > chats.length) {
        this.showChats = chats.length
        $state.complete()
        this.complete = true
      } else {
        $state.loaded()
      }
    },
    async markAllRead() {
      for (const chat of this.filteredChats) {
        if (chat.unseen) {
          await this.chatStore.markRead(chat.id)
        }
      }

      this.chatStore.fetchChats()
    },
    gotoChat(id) {
      const router = useRouter()

      if (this.selectedChatId) {
        // We just replace the route, which is quicker than navigating and re-rendering this page.
        //
        // This means that history won't get updated, which means that Back will go to the top-level /chats page.
        // That is nice behaviour otherwise you have to hit Back a lot if you've viewed several chats.
        this.selectedChatId = id
        let url = id ? '/chats/' + id : '/chats'

        if (this.search) {
          url += '?search=' + this.search
        }

        router.replace(url)
      } else {
        router.push(id ? '/chats/' + id : '/chats')
      }
    },
    async searchMore() {
      if (this.searching) {
        // Queue until we've finished.
        this.searchlast = this.search
      } else {
        this.searching = this.search

        await this.chatStore.fetchChats(this.search)

        this.showChats = this.minShowChats
        this.bump++

        while (this.searchlast) {
          // We have another search queued.
          const val2 = this.searchlast
          this.searching = this.searchlast
          this.searchlast = null
          this.chatStore.searchSince = this.searchSince
          await this.chatStore.fetchChats(val2)
          this.showChats = this.minShowChats
          this.bump++
        }

        this.searching = null
      }
    },
  },
}
</script>
<style scoped lang="scss">
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
  height: calc(100vh - 75px);
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

.sidebar-with-ads .sidebar__wrapper {
  height: calc(
    100vh - var(--ads-height) - var(--ads-label-height) -
      var(--header-navbar-height)
  );
}
</style>
