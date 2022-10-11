<template>
  <div v-if="newsfeed">
    <b-modal
      :id="'newsShareModal-' + newsfeed.id"
      title="Share chitchat"
      size="lg"
      no-stacking
    >
      <template #default>
        <p>
          <a target="_blank" :href="url">{{ url }}</a>
        </p>
        <social-sharing
          :url="url"
          :title="'Sharing chitchat'"
          :description="newsfeed.message"
          hashtags="freegle,free,reuse"
          inline-template
        >
          <div>
            <p>You can share using these buttons:</p>
            <b-list-group horizontal class="flex-wrap">
              <b-list-group-item>
                <ShareNetwork
                  network="facebook"
                  :url="url"
                  :title="newsfeed.message"
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
                  :url="url"
                  :title="newsfeed.message"
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
                  :url="url"
                  :title="newsfeed.message"
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
                  :url="url"
                  :title="newsfeed.message"
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
        </social-sharing>
      </template>
      <template #footer slot-scope="{ cancel }">
        <b-button variant="secondary" @click="cancel"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
// There are a bunch of icons we need only rarely.  By requiring them here we avoid
// requiring them in the vue-awesome plugin.  That makes them available everywhere - but
// increases the bundle size.  Putting them here allows better bundling.
export default {
  props: {
    newsfeed: {
      type: Object,
      required: true,
    },
  },
  computed: {
    url() {
      if (this.newsfeed) {
        return process.env.USER_SITE + '/chitchat/' + this.newsfeed.id
      }

      return null
    },
  },
}
</script>
