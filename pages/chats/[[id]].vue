<template>
  <client-only>
    <b-container fluid>
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
                ? ['md', 'lg', 'xl']
                : ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
            "
          >
            <b-card class="p-0">
              <b-card-body class="p-0">
                <div class="d-flex justify-content-between flex-wrap">
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
              </b-card-body>
            </b-card>
            <!--            TODO Highlight unread and RSVP chats which might be below the fold.-->
            <p v-if="!visibleChats?.length" class="ml-2">
              <span v-if="searching" class="pulsate"> Searching... </span>
              <span v-else> No chats to show. </span>
            </p>
            <div v-else>
              <ChatListEntry
                v-for="chat in visibleChats"
                :id="chat.id"
                :key="'chat-' + chat.id"
                :class="{
                  chat: true,
                  active:
                    chat && parseInt(selectedChatId) === parseInt(chat.id),
                }"
              />
              <infinite-loading
                :identifier="bump"
                force-use-infinite-wrapper="#chatlist"
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
                ? ['xs', 'sm', 'md', 'lg', 'xl']
                : ['md', 'lg', 'xl']
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
          <VisibleWhen :at="['xl']">
            <SidebarRight
              :show-volunteer-opportunities="false"
              :show-job-opportunities="true"
            />
          </VisibleWhen>
        </b-col>
      </b-row>
      <ChatHideModal
        v-if="showHideAllModal"
        ref="chathideall"
        @confirm="hideAll"
      />
    </b-container>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import VisibleWhen from '../../components/VisibleWhen'
// TODO import loginRequired from '@/mixins/loginRequired.js'
import { useChatStore } from '~/stores/chat'
import SidebarRight from '~/components/SidebarRight'
import { setupChat } from '~/composables/useChat'

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
  },
  setup(props) {
    const route = useRoute()
    let { selectedChatId } = setupChat()

    selectedChatId = parseInt(route.params.id)

    // Fetch the list of chats.  No need to await.
    const chatStore = useChatStore()
    chatStore.fetchChats()

    if (selectedChatId) {
      chatStore.fetchMessages(selectedChatId)
    }

    return { chatStore, selectedChatId }
  },
  data() {
    return {
      showingOlder: false,
      showHideAllModal: false,
      showChats: 20,
      search: null,
    }
  },
  // TODO Head
  // head() {
  //   return this.buildHead(
  //     'Chats',
  //     "See the conversations you're having with other freeglers."
  //   )
  // },
  computed: {
    filteredChats() {
      let chats = this.chatStore.list

      if (chats && this.search && this.searching) {
        // We apply the search on names in here so that we can respond on the client rapidly while the background server
        // search is more thorough.
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
      const chats = this.filteredChats
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
  methods: {
    fetchOlder() {
      this.showingOlder = true
      this.listChats('11 September 2009')
    },
    showHideAll() {
      this.showHideAllModal = true

      this.waitForRef('chathideall', () => {
        this.$refs.chathideall.show()
      })
    },
    async hideAll() {
      const self = this

      for (let i = 0; i < this.visibleChats.length; i++) {
        await self.$store.dispatch('chats/hide', {
          id: this.visibleChats[i].id,
        })
      }

      const modtools = this.$store.getters['misc/get']('modtools')
      this.$router.push((modtools ? '/modtools' : '') + '/chats')
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
