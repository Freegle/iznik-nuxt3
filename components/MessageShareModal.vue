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
        <div class="d-flex flex-wrap justify-content-around mt-3">
          <social-sharing
            :url="message.url"
            :title="'Sharing ' + message.subject"
            :description="message.textbody"
            hashtags="freegle,free,reuse"
            inline-template
            @open="chose"
          >
            <network network="facebook">
              <b-btn variant="secondary" size="lg" class="facebook mt-1 mb-1">
                <v-icon name="brands/facebook" />
                Facebook
              </b-btn>
            </network>
          </social-sharing>
          <social-sharing
            :url="message.url"
            :title="'Sharing ' + message.subject"
            :description="message.textbody"
            hashtags="freegle,free,reuse"
            inline-template
            @open="chose"
          >
            <network network="twitter">
              <b-btn variant="secondary" size="lg" class="twitter mt-1 mb-1">
                <v-icon name="brands/twitter" />
                Twitter
              </b-btn>
            </network>
          </social-sharing>
          <social-sharing
            :url="message.url"
            :title="'Sharing ' + message.subject"
            :description="message.textbody"
            hashtags="freegle,free,reuse"
            inline-template
            @open="chose"
          >
            <network network="email">
              <b-btn variant="primary" size="lg" class="gmail mt-1 mb-1">
                <v-icon name="envelope" />
                Email
              </b-btn>
            </network>
          </social-sharing>
          <social-sharing
            :url="message.url"
            :title="'Sharing ' + message.subject"
            :description="message.textbody"
            hashtags="freegle,free,reuse"
            inline-template
            @open="chose"
          >
            <network network="whatsapp">
              <b-btn variant="primary" size="lg" class="whatsapp mt-1 mb-1">
                <v-icon name="brands/whatsapp" />
                Whatsapp
              </b-btn>
            </network>
          </social-sharing>
          <div ref="container">
            <b-btn variant="info" size="lg" class="mt-1 mb-1" @click="doCopy">
              <v-icon v-if="copied" name="check" />
              <v-icon v-else name="copy" />
              Copy
            </b-btn>
          </div>
        </div>
      </div>
      <p class="mt-3 text-center text-muted">
        You can share your own posts at any time from <em>My Posts</em>.
      </p>
    </template>
    <template #modal-footer>
      <b-button variant="primary" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>
<script>
import { useMessageStore } from '../stores/message'
import NoticeMessage from './NoticeMessage'
import modal from '@/mixins/modal'

export default {
  components: { NoticeMessage },
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
      shared: false,
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
    chose(type) {
      this.shared = true
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
}

:deep(.gmail) {
  background-color: $color-gmail !important;
}

:deep(.buttons button) {
  width: 145px;
}
</style>
