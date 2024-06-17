<template>
  <div>
    <b-modal ref="modal" :id="'messageReportModal-' + id" size="lg" hide-header-close no-close-on-esc>
      <template #header class="w-100">
        <div>
          <NoticeMessage v-if="fetcherror" variant="warning" class="mt-2">
            <v-icon icon="info-circle" />&nbsp;Error fetching chatroom
          </NoticeMessage>
          <div v-else>
            <div v-if="user1 && pov == user1.id" class="d-flex justify-content-between">
              <div v-if="user2">
                {{ user2.displayname }}
                <span class="text-muted small">
                  <v-icon name="hashtag" class="text-muted" scale="0.8" />{{ user2.id }}
                </span>
              </div>
              <div v-if="user1">
                {{ user1.displayname }}
                <span class="text-muted small">
                  <v-icon name="hashtag" class="text-muted" scale="0.8" />{{ user1.id }}
                </span>
              </div>
              <div v-if="chat2 && chat2.group">
                {{ chat2.group.namedisplay }} Volunteers
              </div>
            </div>
            <div v-else class="d-flex justify-content-between">
              <div v-if="user1">
                {{ user1.displayname }}
                <span class="text-muted small">
                  <v-icon name="hashtag" class="text-muted" scale="0.8" />{{ user1.id }}
                </span>
              </div>
              <div v-if="user2">
                {{ user2.displayname }}
                <span class="text-muted small">
                  <v-icon name="hashtag" class="text-muted" scale="0.8" />{{ user2.id }}
                </span>
              </div>
              <div v-if="chat2 && chat2.group">
                {{ chat2.group.namedisplay }} Volunteers
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div v-if="chat2" ref="chatContent" class="m-0 chatContent" infinite-wrapper>
          <infinite-loading direction="top" force-use-infinite-wrapper="true" :distance="distance" @infinite="loadMore">
            <span slot="no-results" />
            <span slot="no-more" />
            <span slot="spinner">
              <b-img lazy src="~/static/loader.gif" alt="Loading" />
            </span>
          </infinite-loading>
          <ul v-for="chatmessage in chatmessages" :key="'chatmessage-' + chatmessage.id" class="p-0 pt-1 list-unstyled mb-1">
            <li v-if="chatmessage">
              <ChatMessage :key="'chatmessage-' + chatmessage.id" :chatmessage="chatmessage" :chat="chat2"
                :otheruser="chat2.user1 && pov === chat2.user1.id ? chat2.user2 : chat2.user1"
                :last="chatmessage.id === chatmessages[chatmessages.length - 1].id" :pov="pov" :chatusers="chatusers" />
            </li>
          </ul>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="closeit">
          Close
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useModal } from '~/composables/useModal'
import { setupChat } from '~/composables/useChat'
//import chatCollate from '@/mixins/chatCollate.js'
//import chat from '@/mixins/chat.js'
const ChatMessage = () => import('~/components/ChatMessage')

export default {
  components: { ChatMessage },
  async setup(props) {
    const { modal, hide } = useModal()

    const {
      chat,
      otheruser,
      tooSoonToNudge,
      chatStore,
      chatmessages,
      milesaway,
      milesstring,
    } = await setupChat(props.id)

    return {
      chat,
      otheruser,
      tooSoonToNudge,
      chatStore,
      chatmessages,
      milesaway,
      milesstring,
      modal, hide
    }
  },
  //mixins: [chatCollate, chat, modal],
  props: {
    id: {
      type: Number,
      required: true
    },
    pov: {
      type: Number,
      required: true
    }
  },
  data: function () {
    return {
      fetcherror: false,
      busy: true,
      chat2: null
    }
  },
  async mounted() {
    console.log("MCM mounted", this.id)
    await this.show()

  },
  computed: {
    // Depending on our p.o.v. we may need to swap user1 and user2
    user1() {
      let ret = null

      if (this.chat2) {
        if (this.chat2.user1 && this.chat2.user1.id === this.pov) {
          ret = this.chat2.user2
        } else {
          ret = this.chat2.user1
        }
      }

      return ret
    },
    user2() {
      let ret = null

      if (this.chat2) {
        if (this.chat2.user2 && this.chat2.user2.id === this.pov) {
          ret = this.chat2.user2
        } else {
          ret = this.chat2.user1
        }
      }

      return ret
    }
  },
  methods: {
    async show() {
      console.log("MCM show", this.id)
      if (!this.chatStore.byChatId(this.id)) {
        console.log("MCM show BBB")
        try {
          await this.chatStore.fetchChat(this.id)
        } catch (e) {
          console.log("MCM show XXX", e.message)
          this.fetcherror = true
        }
      }

      console.log("MCM show CCC")

      // Take a copy rather than use computed as it may not be ours and will vanish from the store.
      this.chat2 = this.chatStore.byChatId(this.id)
      console.log("MCM show EEE")
      this.modal.show()
    },
    closeit() {
      // We have loaded this chat into store, but it's probably not ours.  So update the list, otherwise next
      // time we go into chats we'll see weirdness.  No need to await though, and that makes closing chats sluggish.
      /*
      const modtools = this.$store.getters['misc/get']('modtools')
      this.$store.dispatch('chats/listChats', {
        chattypes: modtools
          ? ['User2Mod', 'Mod2Mod']
          : ['User2User', 'User2Mod']
      })
      */
      this.hide()
    }
  }
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

::v-deep h5 {
  width: 100%;
}

.chatContent {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 75vh;
  background-color: $color-yellow--light;
}
</style>
