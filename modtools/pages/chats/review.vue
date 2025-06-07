<template>
  <div>
    <client-only>
      <ModHelpChatReview />
      <div>
        <div
          v-for="message in visibleMessages"
          :key="'messagelist-' + message.id"
          class="p-0 mt-2"
        >
          <ModChatReview
            :id="message.chatid"
            :message="message"
            @reload="reload"
          />
        </div>

        <infinite-loading
          direction="top"
          force-use-infinite-wrapper="body"
          :distance="distance"
          :identifier="bump"
          @infinite="loadMore"
        >
          <template #no-results>
            <p class="p-2">
              There are no chat messages to review at the moment.
            </p>
          </template>
          <template #no-more></template>
          <template #spinner>
            <b-img lazy src="/loader.gif" alt="Loading" />
          </template>
        </infinite-loading>
      </div>
      <SpinButton
        v-if="visibleMessages && visibleMessages.length > 1"
        class="mt-2"
        icon-name="trash-alt"
        label="Delete All"
        variant="white"
        @handle="deleteAll"
      />
      <ConfirmModal
        v-if="showDeleteModal"
        ref="deleteConfirm"
        title="Delete all chat messages?"
        @confirm="deleteConfirmed"
      />
    </client-only>
  </div>
</template>
<script>
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '~/stores/chat'
import { useModGroupStore } from '@/stores/modgroup'

// We need an id for the store.  The null value is a special case used just for retrieving chat review messages.
const REVIEWCHAT = null

export default {
  setup() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    return {
      authStore,
      chatStore,
    }
  },
  data: function () {
    return {
      context: null,
      // We fetch less stuff at once for MT.  This is because for slow devices and networks the time to fetch and
      // render is significant, and each of these consumes a lot of screen space.  So by fetching and rendering less,
      // we increase how fast it feels.
      distance: 1000,
      limit: 5,
      show: 0,
      bump: 0,
      showDeleteModal: false,
    }
  },
  computed: {
    visibleMessages() {
      // console.log('visibleMessages',this.show, this.messages.length)
      return this.messages.slice(0, this.show).filter((message) => {
        return message !== null
      })
    },
    messages() {
      return this.chatStore.messagesById(REVIEWCHAT)
    },
    work() {
      const work = this.authStore.work
      // console.log('chats review work',work?.chatreview)
      return work?.chatreview
    },
    modalOpen() {
      const bodyoverflow = document.body.style.overflow
      return bodyoverflow === 'hidden'
    },
  },
  watch: {
    work(newVal, oldVal) {
      // TODO: The page is always going to be visible so why might we not be?
      console.log('TODO chats review work watch', newVal, oldVal)
      if (!this.modalOpen) {
        if (newVal > oldVal) {
          this.clearAndLoad()
        } else {
          const visible = true
          // TODO const visible = this.$store.getters['misc/get']('visible')

          if (!visible) {
            this.clearAndLoad()
          }
        }
      }
    },
  },
  async mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    await this.clearAndLoad()
  },
  methods: {
    loadMore: function ($state) {
      // console.log('review loadMore', this.show, this.messages.length)
      if (this.show < this.messages.length) {
        // This means that we will gradually add the messages that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        this.show++
        $state.loaded()
      } else {
        const currentCount = this.messages.length
        $state.complete()

        /* this.$store
          .dispatch('chatmessages/fetch', {
            chatid: REVIEWCHAT,
            context: this.context,
            limit: this.limit
          })
          .then(() => {
            this.context = this.$store.getters['chatmessages/getContext']

            if (currentCount === this.messages.length) {
              this.complete = true
              $state.complete()
            } else {
              $state.loaded()
              this.show++
            }
          })
          .catch(e => {
            $state.complete()
            console.log('Complete on error', e)
          }) */
      }
    },
    async reload() {
      await this.clearAndLoad()
    },
    async clearAndLoad() {
      console.log('review clearAndLoad')
      // There's new stuff to do.  Reload.
      // We don't want to pick up any real chat messages.
      await this.chatStore.clear()

      await this.chatStore.fetchReviewChatsMT(REVIEWCHAT, {
        limit: this.limit,
      })

      this.bump++
    },
    deleteAll(callback) {
      this.showDeleteModal = true
      callback()
    },
    async deleteConfirmed() {
      await this.visibleMessages.forEach(async (m) => {
        if (!m.widerchatreview) {
          await this.$store.dispatch('chatmessages/reject', {
            id: m.id,
            chatid: null,
          })
        }
      })
    },
  },
}
</script>
