<template>
  <client-only v-if="me">
    <div>
      <h1 class="visually-hidden">Chats</h1>
      <b-row class="m-0">
        <b-col
          id="chatlist"
          cols="12"
          md="4"
          xl="3"
          class="chatlist p-0 bg-white"
        >
          <VisibleWhen
            :at="
              selectedChatId
                ? ['md', 'lg', 'xl', 'xxl']
                : ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
            "
          >
            <div
              class="d-flex justify-content-between flex-wrap mb-2 mt-3 border-bottom"
            >
              <form role="search" class="mb-1 mr-1 ml-1 ml-md-0">
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
            <p v-if="!visibleChats?.length" class="ml-2">
              <span v-if="searching" class="pulsate"> Searching... </span>
              <span v-else> No chats to show. </span>
            </p>
            <div v-else>
              <div
                v-for="chat in visibleChats"
                :key="'chat-' + chat.id"
                :class="{
                  chat: true,
                  active: selectedChatId === chat?.id,
                }"
                @click="gotoChat(chat.id)"
              >
                <ChatListEntry
                  :id="chat.id"
                  :active="selectedChatId === chat?.id"
                />
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
                v-if="!search && mightBeOldChats && complete && !showingOlder"
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
            <p v-if="!visibleChats?.length" class="ml-2">
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
          <VisibleWhen :at="['xl', 'xxl']">
            <SidebarRight :show-job-opportunities="true" />
          </VisibleWhen>
        </b-col>
      </b-row>
      <ChatHideModal
        v-if="showHideAllModal"
        ref="chathideall"
        @confirm="hideAll"
      />
    </div>
  </client-only>
</template>
<script>
import dayjs from 'dayjs'

import { buildHead } from '../../composables/useBuildHead'
import { useAuthStore } from '../../stores/auth'
import { ref, useRoute, useRouter } from '#imports'
import VisibleWhen from '~/components/VisibleWhen'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useChatStore } from '~/stores/chat'
import SidebarRight from '~/components/SidebarRight'

// We can't use async on ChatListEntry else the infinite scroll kicks in and tries to load everything while we are
// still waiting for the import to complete.
import ChatListEntry from '~/components/ChatListEntry.vue'

const ChatHideModal = () => import('~/components/ChatHideModal')

definePageMeta({
  layout: 'login',
})

export default {
  components: {
    VisibleWhen,
    SidebarRight,
    ChatListEntry,
    ChatHideModal,
    InfiniteLoading,
  },
  async setup(props) {
    const route = useRoute
    const runtimeConfig = useRuntimeConfig()

    useHead(
      buildHead(
        route,
        runtimeConfig,

        'Chats',
        "See the conversations you're having with other freeglers."
      )
    )

    const chatStore = useChatStore()
    const authStore = useAuthStore()
    const myid = authStore.user?.id
    const showChats = ref(20)

    if (myid) {
      const route = useRoute()

      const id = route.params.id ? parseInt(route.params.id) : 0

      // Fetch the list of chats.
      await chatStore.fetchChats(null, true, !!id)

      // Is this chat in the list?
      let chat = chatStore.byChatId(id)

      if (!chat) {
        // Might be old.  Try fetching it specifically.
        try {
          chat = await chatStore.fetchChat(id)
        } catch (e) {
          console.log("Couldn't fetch chat", id, e)
        }
      } else {
        // We have the chat, but maybe it's not quite up to date (e.g. a new message).  So fetch, but don't wait.
        chatStore.fetchChat(id)
      }

      if (id) {
        // Find id in the list of chats.
        const index = chatStore.list.findIndex((c) => c.id === id)
        showChats.value = Math.max(showChats.value, index + 1)
        console.log('Show', showChats.value)
      }
    }

    return { chatStore, showChats }
  },
  data() {
    return {
      showHideAllModal: false,
      minShowChats: 20,
      search: null,
      searching: false,
      complete: false,
      bump: 1,
      distance: 1000,
      selectedChatId: null,
    }
  },
  computed: {
    showingOlder() {
      return this.chatStore.searchSince !== null
    },
    filteredChats() {
      let chats = this.chatStore?.list ? this.chatStore.list : []

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
    id(newVal) {
      console.log('id changed', newVal)
    },
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
    this.chatStore.searchSince = null
  },
  methods: {
    async fetchOlder() {
      this.chatStore.searchSince = '2009-09-11'
      await this.chatStore.fetchChats()
      this.bump++
    },
    async showHideAll() {
      this.showHideAllModal = true

      await this.waitForRef('chathideall')
      this.$refs.chathideall.show()
    },
    async hideAll() {
      for (let i = 0; i < this.visibleChats.length; i++) {
        await this.chatStore.hide(this.visibleChats[i].id)
      }

      const router = useRouter()
      router.push('/chats')
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
      // We just replace the route, which is quicker than navigating and re-rendering this page.
      this.selectedChatId = id
      const router = useRouter()
      router.replace(id ? '/chats/' + id : '/chats')
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
          await this.chatStore.fetchChats(this.searchSince, val2)
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
  max-height: calc(100vh - 74px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}
</style>
