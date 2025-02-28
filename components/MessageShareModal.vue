<template>
  <b-modal ref="modal" scrollable title="Share a post" size="lg">
    <template #default>
      <div v-if="message">
        <h3>
          {{ message.subject }}
        </h3>
        <NoticeMessage variant="info">
          <p>
            Please share - you might get a response from people you know, or a
            group you're in.
          </p>
          <p>
            And lots of people haven't heard of Freegle - so it helps get them
            freegling too!
          </p>
        </NoticeMessage>
        <p class="mt-1">You can share using these buttons:</p>
        <b-list-group
          :key="'messageshare-' + bump"
          horizontal
          class="flex-wrap"
        >
          <b-list-group-item>
            <ShareNetwork
              network="facebook"
              :url="message.url"
              :title="message.subject"
              :description="message.textbody"
              hashtags="freegle,free,reuse"
              @open="opened"
            >
              <b-button variant="secondary" class="mt-1 facebook">
                <v-icon :icon="['fab', 'facebook']" /> Facebook
              </b-button>
            </ShareNetwork>
          </b-list-group-item>
          <b-list-group-item>
            <ShareNetwork
              network="twitter"
              :url="message.url"
              :title="message.subject"
              :description="message.textbody"
              hashtags="freegle,free,reuse"
              @open="opened"
            >
              <b-button variant="secondary" class="mt-1 twitter">
                <v-icon :icon="['fab', 'twitter']" /> Twitter
              </b-button>
            </ShareNetwork>
          </b-list-group-item>
          <b-list-group-item>
            <ShareNetwork
              network="whatsapp"
              :url="message.url"
              :title="message.subject"
              :description="message.textbody"
              hashtags="freegle,free,reuse"
              @open="opened"
            >
              <b-button variant="secondary" class="mt-1 whatsapp">
                <v-icon :icon="['fab', 'whatsapp']" /> Whatsapp
              </b-button>
            </ShareNetwork>
          </b-list-group-item>
          <b-list-group-item>
            <ShareNetwork
              network="email"
              :url="message.url"
              :title="message.subject"
              :description="message.textbody"
              hashtags="freegle,free,reuse"
              @open="opened"
            >
              <b-button variant="secondary" class="mt-1 gmail">
                <v-icon icon="envelope" /> Email
              </b-button>
            </ShareNetwork>
          </b-list-group-item>
          <b-list-group-item>
            <b-button
              variant="secondary"
              size="md"
              class="mt-1 mb-1"
              @click="doCopy"
            >
              <v-icon v-if="copied" icon="check" />
              <v-icon v-else icon="clipboard" />
              Copy
            </b-button>
          </b-list-group-item>
        </b-list-group>
      </div>
      <p class="mt-3 text-center text-muted">
        You can share your own posts at any time from <em>My Posts</em>.
      </p>
    </template>
    <template #footer>
      <b-button variant="primary" @click="hide">Close</b-button>
    </template>
  </b-modal>
</template>
<script>
import VueSocialSharing from 'vue-social-sharing'
import { useMessageStore } from '../stores/message'
import NoticeMessage from './NoticeMessage'
import { useOurModal } from '~/composables/useOurModal'
import { useNuxtApp } from '#app'

export default {
  components: { NoticeMessage },
  props: {
    id: {
      type: Number,
      required: true,
    },
    maybe: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  async setup() {
    const messageStore = useMessageStore()

    const { modal, hide } = useOurModal()

    try {
      await messageStore.fetch(this.id, true)
    } catch (e) {
      // Must no longer exist on server.
      hide()
    }

    // We install this plugin here rather than from the plugins folder to reduce page load side in the mainline
    // case.
    const nuxtApp = useNuxtApp()
    nuxtApp.vueApp.use(VueSocialSharing)

    return {
      messageStore,
      modal,
      hide,
    }
  },
  data() {
    return {
      copied: false,
      bump: 0,
    }
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
  },
  methods: {
    async doCopy() {
      await navigator.clipboard.writeText(this.message.url)
      this.copied = true
    },
    opened() {
      this.bump++
    },
  },
}
</script>
<style scoped lang="scss">
:deep(.facebook) {
  background-color: $color-facebook !important;
  color: white;
}

:deep(.twitter) {
  background-color: $color-twitter !important;
  color: white;
}

:deep(.whatsapp) {
  background-color: $color-whatsapp !important;
  color: white;
}

:deep(.gmail) {
  background-color: $color-gmail !important;
  color: white;
}

:deep(.buttons button) {
  width: 145px;
}
</style>
