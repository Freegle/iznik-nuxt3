<template>
  <div>
    <b-alert v-if="notVisible" variant="warning" class="mt-2" show>
      <h3>That chat isn't for this account.</h3>
      <p>
        Please check your email in
        <!-- eslint-disable-next-line-->
        <nuxt-link to="/settings">Settings</nuxt-link>.
        If you have trouble, please contact
        <!-- eslint-disable-next-line -->
        <ExternalLink href="mailto:support@ilovefreegle.org">support@ilovefreegle.org</ExternalLink>
        who can help you merge multiple accounts.
      </p>
    </b-alert>
    <div v-else-if="me">
      <client-only>
        <div class="chatHolder">
          <ChatHeader
            v-bind="$props"
            class="chatTitle"
            :loaded.sync="headerLoaded"
          />
          <div
            v-if="chat"
            ref="chatContent"
            class="chatContent"
            infinite-wrapper
          >
            <infinite-loading
              v-if="otheruser || chat.chattype === 'User2Mod'"
              direction="top"
              force-use-infinite-wrapper="true"
              :distance="distance"
              class="w-100"
              @infinite="loadMore"
            >
              <template #error>&nbsp;</template>
              <template #complete>&nbsp;</template>
              <template #spinner>
                <div v-if="!chatmessages.length" class="col text-center w-100">
                  <b-img src="/loader.gif" alt="Loading..." />
                </div>
              </template>
            </infinite-loading>
            <div
              v-if="
                otheruser ||
                chat.chattype === 'User2Mod' ||
                chat.chattype === 'Mod2Mod'
              "
              class="pt-1 mb-1 w-100"
            >
              <ChatMessage
                v-for="(chatmessage, index) in chatmessages"
                :key="'chatmessage-' + chatmessage.id"
                :chatmessage="chatmessage"
                :chat="chat"
                :otheruser="otheruser"
                :last="
                  chatmessage.id === chatmessages[chatmessages.length - 1].id
                "
                :chatusers="chatusers"
                :prevmessage="index > 0 ? chatmessages[index - 1].id : null"
              />
            </div>
            <div v-if="chatBusy && headerLoaded" class="text-center">
              <b-img class="float-right" src="~static/loader.gif" />
            </div>
          </div>
          <ChatFooter
            v-bind="$props"
            class="chatFooter"
            @scrollbottom="scrollToBottom(true)"
          />
        </div>
      </client-only>
    </div>
  </div>
</template>
<script>
import ChatHeader from './ChatHeader'
import ChatFooter from './ChatFooter'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
import ChatMessage from '~/components/ChatMessage.vue'
import ExternalLink from '~/components/ExternalLink'

export default {
  components: {
    ExternalLink,
    ChatHeader,
    ChatFooter,
    ChatMessage,
  },
  data() {
    return {
      headerLoaded: false,
    }
  },
  watch: {
    me(newVal, oldVal) {
      if (!oldVal && newVal) {
        // TODO FEtch new messages
      }
    },
  },
}
</script>
<style scoped lang="scss">
.chatpane {
  min-height: 100vh;
}

.chatHolder {
  height: calc(100vh - 74px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chatTitle {
  order: 1;
  z-index: 1000;
}

.chatContent {
  order: 3;
  justify-content: flex-start;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.chatFooter {
  order: 4;
}
</style>
