<template>
  <b-modal id="sharemodal" v-model="showModal" title="Share a post" size="lg">
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
        <b-list-group horizontal class="flex-wrap">
          <b-list-group-item>
            <ShareNetwork
              network="facebook"
              :url="message.url"
              :title="message.subject"
              :description="message.textbody"
              hashtags="freegle,free,reuse"
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
import { ShareNetwork } from 'vue-social-sharing'
import { useMessageStore } from '../stores/message'
import NoticeMessage from './NoticeMessage'
import modal from '@/mixins/modal'

export default {
  components: { NoticeMessage, ShareNetwork },
  mixins: [modal],
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
  setup() {
    const messageStore = useMessageStore()

    return {
      messageStore,
    }
  },
  data() {
    return {
      copied: false,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
  methods: {
    async show() {
      try {
        await this.messageStore.fetch(this.id, true)
        this.showModal = true
      } catch (e) {
        // Must no longer exist on server.
        this.close()
      }
    },
    async doCopy() {
      await navigator.clipboard.writeText(this.message.url)
      this.copied = true
      this.chose()
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
