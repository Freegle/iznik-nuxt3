<template>
  <div v-if="story">
    <b-modal
      :id="'storyShareModal-' + story?.id"
      v-model="showModal"
      :title="'Share &quot;' + story?.headline + '&quot;'"
      size="lg"
      no-stacking
    >
      <template #default>
        <p>
          <a target="_blank" :href="story.url">{{ story.url }}</a>
        </p>
        <b-button v-if="isApp" variant="primary" size="lg" class="m-3" @click="shareApp">
          Share now
        </b-button>
        <div v-if="!isApp">
          <p>You can share using these buttons:</p>
          <b-list-group horizontal class="flex-wrap">
            <b-list-group-item>
              <ShareNetwork
                network="facebook"
                :url="story.url"
                :title="'Sharing ' + story.headline"
                :description="story.story"
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
                :url="story.url"
                :title="'Sharing ' + story.headline"
                :description="story.story"
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
                :url="story.url"
                :title="'Sharing ' + story.headline"
                :description="story.story"
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
                :url="story.url"
                :title="'Sharing ' + story.headline"
                :description="story.story"
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
      </template>
      <template #footer>
        <b-button variant="secondary" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
// There are a bunch of icons we need only rarely.  By requiring them here we avoid
// requiring them in the vue-awesome plugin.  That makes them available everywhere - but
// increases the bundle size.  Putting them here allows better bundling.
import { useStoryStore } from '../stores/stories'
import modal from '@/mixins/modal'
import { useMobileStore } from '@/stores/mobile'
import { Share } from '@capacitor/share';

export default {
  mixins: [modal],
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const storyStore = useStoryStore()

    return {
      storyStore,
    }
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
    story() {
      return this.storyStore.byId(this.id)
    },
  },
  methods: {
    async shareApp(){
      const href = this.story.url
      const subject = 'Sharing ' + this.story.headline
      await Share.share({
        title: subject,
        text: this.story.story + "\n\n",  // not supported on some apps (Facebook, Instagram)
        url: href,
        dialogTitle: 'Share now...',
      })
    },
    async show() {
      try {
        await this.storyStore.fetch(this.id, true)
        this.showModal = true
      } catch (e) {
        // Must no longer exist on server.
        this.hide()
      }
    },
    async doCopy() {
      await navigator.clipboard.writeText(this.story.url)
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
