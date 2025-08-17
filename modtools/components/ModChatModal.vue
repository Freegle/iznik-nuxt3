<template>
  <div>
    <b-modal
      :id="'messageReportModal-' + id"
      ref="modal"
      size="lg"
      hide-header-close
      no-close-on-esc
    >
      <template #header>
        <div
          v-if="user1 && pov == user1.id"
          class="d-flex justify-content-between w-100"
        >
          <div v-if="user2">
            {{ user2.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user2.id
              }}
            </span>
          </div>
          <div v-if="user1">
            {{ user1.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user1.id
              }}
            </span>
          </div>
          <div v-if="chat2 && chat2.group">
            {{ chat2.group.namedisplay }} Volunteers
          </div>
        </div>
        <div v-else class="d-flex justify-content-between w-100">
          <div v-if="user1">
            {{ user1.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user1.id
              }}
            </span>
          </div>
          <div v-if="user2 && user1.id != user2.id">
            {{ user2.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user2.id
              }}
            </span>
          </div>
          <div v-if="chat2 && chat2.group">
            {{ chat2.group.namedisplay }} Volunteers
          </div>
        </div>
      </template>
      <template #default>
        <div
          v-if="chat2"
          ref="chatContent"
          class="m-0 chatContent"
          infinite-wrapper
        >
          <infinite-loading
            direction="top"
            force-use-infinite-wrapper="true"
            :distance="10"
            @infinite="loadMore"
          >
            <template #spinner>
              <b-img lazy src="/loader.gif" alt="Loading" />
            </template>
          </infinite-loading>
          <div v-if="chatmessages.length === 0">No messages</div>
          <ul
            v-for="chatmessage in chatmessages"
            :key="'chatmessage-' + chatmessage.id"
            class="p-0 pt-1 list-unstyled mb-1"
          >
            <li v-if="chatmessage">
              <ChatMessage
                :id="chatmessage.id"
                :key="'chatmessage-' + chatmessage.id"
                :chatid="chatmessage.chatid"
                :last="
                  chatmessage.id === chatmessages[chatmessages.length - 1].id
                "
                :pov="pov"
                class="mb-1"
              />
            </li>
          </ul>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="closeit"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useOurModal } from '~/composables/useOurModal'
import { setupChat } from '~/composables/useChat'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    pov: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const { modal, hide } = useOurModal()

    const {
      // TODO Returns wrong chat
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
      modal,
      hide,
    }
  },
  data: function () {
    return {
      busy: true,
      chat2: null,
    }
  },
  computed: {
    // Construct basic user details by hand. u1settings and u2settings also available
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
    },
  },
  async mounted() {
    await this.show()
  },
  methods: {
    async show() {
      // await this.chatStore.listChatsMT({ chattypes: ['User2Mod', 'Mod2Mod'] }, this.id)
      await this.chatStore.fetchChat(this.id)
      await this.chatStore.fetchMessages(this.id)
      this.chat2 = this.chatStore.byChatId(this.id)
      this.modal.show()
    },
    closeit() {
      // console.log('MCM closeit', this.id)
      // We have loaded this chat into store, but it's probably not ours.  So update the list, otherwise next
      // time we go into chats we'll see weirdness.  No need to await though, and that makes closing chats sluggish.
      /* MT3: Not done yet - is it needed?
      const modtools = this.$store.getters['misc/get']('modtools')
      this.$store.dispatch('chats/listChats', {
        chattypes: modtools
          ? ['User2Mod', 'Mod2Mod']
          : ['User2User', 'User2Mod']
      })
      */
      this.hide()
    },
    loadMore($state) {
      $state.complete()
    },
  },
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

:deep(h5) {
  width: 100%;
}

.chatContent {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 75vh;
  background-color: $color-yellow--light;
}
</style>
