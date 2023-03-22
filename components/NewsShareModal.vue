<template>
  <div v-if="newsfeed">
    <b-modal
      :id="'newsShareModal-' + newsfeed.id"
      v-model="showModal"
      title="Share chitchat"
      size="lg"
      no-stacking
    >
      <template #default>
        <p>
          <a target="_blank" :href="url">{{ url }}</a>
        </p>
        <b-button v-if="isApp" variant="primary" size="lg" class="m-3" @click="shareApp">
          Share now
        </b-button>
        <div>
          <p>You can share using these buttons:</p>
          <b-list-group horizontal class="flex-wrap">
            <b-list-group-item>
              <ShareNetwork
                network="facebook"
                :url="url"
                :title="newsfeed.message"
                hashtags="freegle,free,reuse"
                :description="newsfeed.message"
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
      </template>
      <template #footer>
        <b-button variant="secondary" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import modal from '@/mixins/modal'
import { useMobileStore } from '@/stores/mobile'
import { Share } from '@capacitor/share';

export default {
  mixins: [modal],
  props: {
    newsfeed: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      copied: false,
    }
  },
  computed: {
    isApp() {
      const mobileStore = useMobileStore()
      return mobileStore.isApp
    },
    url() {
      if (this.newsfeed) {
        const runtimeConfig = useRuntimeConfig()

        return runtimeConfig.public.USER_SITE + '/chitchat/' + this.newsfeed.id
      }

      return null
    },
  },
  methods: {
    async shareApp(){
      const href = this.url
      const subject = 'Sharing Freegle chitchat'
      await Share.share({
        title: subject,
        text: this.newsfeed.message + "\n\n",  // not supported on some apps (Facebook, Instagram)
        url: href,
        dialogTitle: 'Share now...',
      })
    },
    async doCopy() {
      await navigator.clipboard.writeText(this.url)
      this.copied = true
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
