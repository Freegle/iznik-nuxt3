<template>
  <b-modal
    :id="'newsShareModal-' + newsfeed.id"
    ref="modal"
    scrollable
    title="Share chitchat"
    size="lg"
    no-stacking
  >
    <template #default>
      <p>
        <a target="_blank" :href="url">{{ url }}</a>
      </p>
      <div>
        <p>You can share using these buttons:</p>
        <b-list-group :key="'newsshare-' + bump" horizontal class="flex-wrap">
          <b-list-group-item>
            <ShareNetwork
              network="facebook"
              :url="url"
              :title="newsfeed.message"
              hashtags="freegle,free,reuse"
              :description="newsfeed.message"
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
              :url="url"
              :title="newsfeed.message"
              hashtags="freegle,free,reuse"
              :description="newsfeed.message"
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
              :url="url"
              :title="newsfeed.message"
              hashtags="freegle,free,reuse"
              :description="newsfeed.message"
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
              :url="url"
              :title="newsfeed.message"
              hashtags="freegle,free,reuse"
              :description="newsfeed.message"
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
              @open="opened"
            >
              <v-icon v-if="copied" icon="check" />
              <v-icon v-else icon="clipboard" />
              Copy
            </b-button>
          </b-list-group-item>
        </b-list-group>
      </div>
    </template>
    <template #footer>
      <b-button variant="secondary" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script>
import { useModal } from '~/composables/useModal'

export default {
  props: {
    newsfeed: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { modal, hide } = useModal()

    return { modal, hide }
  },
  data() {
    return {
      copied: false,
      bump: 0,
    }
  },
  computed: {
    url() {
      if (this.newsfeed) {
        const runtimeConfig = useRuntimeConfig()

        return runtimeConfig.public.USER_SITE + '/chitchat/' + this.newsfeed.id
      }

      return null
    },
  },
  methods: {
    async doCopy() {
      await navigator.clipboard.writeText(this.url)
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
