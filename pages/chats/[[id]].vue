<template>
  <div>
    <h1 class="sr-only">Chats</h1>
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
            class="d-flex justify-content-between flex-wrap p-3 pb-2 pt-2 border-bottom"
          >
            <form role="search" class="mb-1 mr-1">
              <label for="search-bar" class="sr-only">Search chats</label>
              <b-form-input
                id="search-bar"
                v-model="search"
                placeholder="Search chats"
                class="flex-shrink-1"
              />
            </form>
            <b-button variant="primary" class="mb-1" @click="markAllRead">
              <v-icon icon="check" /> Mark all read
            </b-button>
          </div>
          <!--            TODO Highlight unread and RSVP chats which might be below the fold.-->
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
              <ChatListEntry :id="chat.id" />
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
          <ChatPane
            v-if="selectedChatId"
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
</template>
<script>
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import VisibleWhen from '../../components/VisibleWhen'

// TODO import loginRequired from '@/mixins/loginRequired.js'
import { buildHead } from '../../composables/useBuildHead'
import { useAuthStore } from '../../stores/auth'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useChatStore } from '~/stores/chat'
import SidebarRight from '~/components/SidebarRight'

// We can't use async on ChatListEntry else the infinite scroll kicks in and tries to load everything while we are
// still waiting for the import to complete.
import ChatListEntry from '~/components/ChatListEntry.vue'

const ChatHideModal = () => import('~/components/ChatHideModal')

definePageMeta({
  layout: 'default',
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
    useHead(
      buildHead(
        'Chats',
        "See the conversations you're having with other freeglers."
      )
    )

    const chatStore = useChatStore()
    const authStore = useAuthStore()
    const myid = authStore.user?.id

    if (myid) {
      const route = useRoute()

      const id = route.params.id ? parseInt(route.params.id) : 0

      // Fetch the list of chats.
      await chatStore.fetchChats()

      // Is this chat in the list?
      let chat = chatStore.byChatId(id)

      if (!chat) {
        // Might be old.  Try fetching it specifically.
        chat = await chatStore.fetchChat(id)
      } else {
        // We have the chat, but maybe it's not quite up to date (e.g. a new message).  So fetch, but don't wait.
        chatStore.fetchChat(id)
      }
    }

    return { chatStore }
  },
  data() {
    return {
      showingOlder: false,
      showHideAllModal: false,
      minShowChats: 20,
      showChats: 20,
      search: null,
      searching: false,
      complete: false,
      bump: 1,
      distance: 1000,
      searchSince: '2009-09-11',
      selectedChatId: null,
    }
  },
  computed: {
    filteredChats() {
      let chats = this.chatStore.list ? this.chatStore.list : []

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
        this.chatStore.fetchChats(this.searchSince)
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
  methods: {
    fetchOlder() {
      this.showingOlder = true
      this.chatStore.fetchChats(this.searchSince)
    },
    showHideAll() {
      this.showHideAllModal = true

      this.waitForRef('chathideall', () => {
        this.$refs.chathideall.show()
      })
    },
    async hideAll() {
      for (let i = 0; i < this.visibleChats.length; i++) {
        await this.chatStore.hide(this.visibleChats[i].id)
      }

      this.$router.push('/chats')
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
      // TODO Minor speed up
      for (const chat of this.filteredChats) {
        if (chat.unseen) {
          await this.chatStore.markRead(chat.id)
        }
      }

      this.chatStore.fetchChats()
    },
    gotoChat(id) {
      try {
        history.pushState({}, null, '/chats/' + id)
      } catch (e) {
        // Some browsers throw exceptions if this is called too frequently.
        console.log('Ignore replaceState exception', e)
      }

      this.selectedChatId = id
    },
    async searchMore() {
      if (this.searching) {
        // Queue until we've finished.
        this.searchlast = this.search
      } else {
        this.searching = this.search

        await this.chatStore.fetchChats(this.searchSince, this.search)

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
