<template>
  <b-modal
    :id="'storyShareModal-' + story?.id"
    ref="modal"
    scrollable
    :title="'Share &quot;' + story?.headline + '&quot;'"
    size="lg"
    no-stacking
  >
    <template #default>
      <p>
        <a target="_blank" :href="story.url">{{ story.url }}</a>
      </p>
      <div>
        <p>You can share using these buttons:</p>
        <b-list-group :key="'storyshare-' + bump" horizontal class="flex-wrap">
          <b-list-group-item>
            <ShareNetwork
              network="facebook"
              :url="story.url"
              :title="'Sharing ' + story.headline"
              :description="story.story"
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
              :url="story.url"
              :title="'Sharing ' + story.headline"
              :description="story.story"
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
              :url="story.url"
              :title="'Sharing ' + story.headline"
              :description="story.story"
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
              :url="story.url"
              :title="'Sharing ' + story.headline"
              :description="story.story"
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
    </template>
    <template #footer>
      <b-button variant="secondary" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>
<script>
// There are a bunch of icons we need only rarely.  By requiring them here we avoid
// requiring them in the vue-awesome plugin.  That makes them available everywhere - but
// increases the bundle size.  Putting them here allows better bundling.
import { useStoryStore } from '../stores/stories'
import { useModal } from '~/composables/useModal'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup() {
    const storyStore = useStoryStore()

    const { modal, hide } = useModal()

    try {
      await this.storyStore.fetch(this.id, true)
    } catch (e) {
      // Must no longer exist on server.
      this.hide()
    }

    return {
      storyStore,
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
    story() {
      return this.storyStore.byId(this.id)
    },
  },
  methods: {
    async doCopy() {
      await navigator.clipboard.writeText(this.story.url)
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
