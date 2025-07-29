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
        <ChatPane
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
<script>
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
// import { pluralise } from '../composables/usePluralise'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '~/stores/chat'
// import { setupChat } from '../composables/useChat'
import { useRouter } from '#imports'

export default {
  setup() {
    const chatStore = useChatStore()
    const authStore = useAuthStore()
    /* const {
      chat,
      otheruser,
      tooSoonToNudge,
      chatStore,
      chatmessages,
      milesaway,
    } = await setupChat(props.id) */

    return {
      authStore,
      chatStore,
      // chat,
      // otheruser,
      // tooSoonToNudge,
      // miscStore,
      // messageStore,
      // addressStore,
      // chatmessages,
      // milesaway,
    }
  },
  data: function () {
    return {
      id: 0,
      // showHideAllModal: false,
      // minShowChats: 20,
      showChats: 20,
      search: null,
      searching: false,
      searchlast: null,
      loading: true,
      complete: false,
      limit: 5,
      bump: 1,
      distance: 1000,
      selectedChatId: null,
      showClosed: false,
      // adsVisible: false,
    }
  },
  computed: {
    messages() {
      return []
      // return this.chatStore.getMessages(REVIEWCHAT)
    },
    /* milesaway(){
      this.authStore.user?.lat,
      this.authStore.user?.lng,
      otheruser?.value?.lat,
      otheruser?.value?.lng
    ),
    milesstring() {
      return pluralise('mile', milesaway.value, true) + ' away'
    }, */
    chats() {
      return this.chatStore?.list ? this.chatStore.list : []
    },
    showingOlder() {
      console.log('[[id]] showingOlder')
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
  },
  watch: {
    search(newVal, oldVal) {
      this.showChats = 0
      this.bump = Date.now()

      if (!newVal) {
        // Force a refresh to remove any old chats.
        this.listChats()
      } else {
        // Force a server search to pick up old chats or more subtle matches.
        this.searchMore()
      }
    },
  },
  created() {
    const route = useRoute()
    this.id = 'id' in route.params ? parseInt(route.params.id) : 0
    if (isNaN(this.id)) this.id = 0
    if (this.id) this.selectedChatId = this.id
    console.log('[[id]] created', route.params.id, this.id)
  },
  async mounted() {
    // Do not clear chat store - all chats are got but only updated if lastdate changed
    // this.chatStore.clear()
    await this.listChats()
    this.loading = false
  },
  methods: {
    async listChats(age, search) {
      const params = {
        chattypes: ['User2Mod', 'Mod2Mod'],
      }
      if (age) {
        params.age = age
      }
      if (search) {
        params.search = search
      }

      await this.chatStore.listChatsMT(params, this.id)
      this.bump++
    },
    scanChats(closed, chats) {
      // We apply the search on names in here so that we can respond on the client rapidly while the background server search is more thorough.
      if (chats && this.search && this.searching) {
        const l = this.search.toLowerCase()
        chats = chats.filter((chat) => {
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
      if (this.id) {
        chats = chats.filter((chat) => {
          if (!chat.id || !this.id) return false
          if (this.id && !closed && chat.id === this.id) {
            return true
          }

          if (chat.status === 'Blocked' || chat.status === 'Closed') {
            return closed
          }

          return !closed
        })
      }

      // Sort to show unseen first then more recent first
      chats.sort((a, b) => {
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
      console.log('markAllRead A')
      this.loading = true
      for (const chat of this.filteredChats) {
        if (chat.unseen) {
          console.log('markAllRead B', chat.unseen, chat.lastmsg)
          await this.chatStore.markRead(chat.id)
        }
      }
      console.log('markAllRead C')

      this.chatStore.clear()
      await this.listChats()
      this.loading = false
    },
    gotoChat(id) {
      const router = useRouter()
      router.push('/chats/' + id)
    },
    async searchMore() {
      // console.log('searchMore', this.search, this.searchlast)
      if (this.searching) {
        // Queue until we've finished.
        this.searchlast = this.search
      } else {
        this.searching = this.search

        await this.listChats(null, this.search)

        while (this.searchlast) {
          // We have another search queued.
          const val2 = this.searchlast
          this.searching = this.searchlast
          this.searchlast = null
          await this.listChats(null, val2)
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
