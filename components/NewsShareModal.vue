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
            <!--            TODO Only show similar buttons to the ones in MessageShareModal-->
            <b-list-group horizontal class="flex-wrap">
              <b-list-group-item>
                <network network="facebook">
                  <b-button variant="secondary">
                    <v-icon icon="brands/facebook" /> Facebook
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="twitter">
                  <b-button variant="secondary">
                    <v-icon icon="brands/twitter" /> Twitter
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="whatsapp">
                  <b-button variant="secondary">
                    <v-icon icon="brands/whatsapp" /> Whatsapp
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="pinterest">
                  <b-button variant="secondary">
                    <v-icon icon="brands/pinterest" /> Pinterest
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="telegram">
                  <b-button variant="secondary">
                    <v-icon icon="brands/telegram" /> Telegram
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="sms">
                  <b-button variant="secondary">
                    <v-icon icon="comment" /> SMS
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="email">
                  <b-button variant="secondary">
                    <v-icon icon="envelope" /> Email
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="skype">
                  <b-button variant="secondary">
                    <v-icon icon="brands/skype" /> Skype
                  </b-button>
                </network>
              </b-list-group-item>
              <b-list-group-item>
                <network network="googleplus">
                  <b-button variant="secondary">
                    <v-icon icon="brands/google-plus" /> Google+
                  </b-button>
                </network>
              </b-list-group-item>
            </b-list-group>
          </div>
        </social-sharing>
      </template>
      <template #modal-footer slot-scope="{ cancel }">
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
