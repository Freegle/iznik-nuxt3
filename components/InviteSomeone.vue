<template>
  <div>
    <b-form-textarea
      id="invitation"
      v-model="invitation"
      maxlength="160"
      rows="3"
      size="lg"
      placeholder="Tell your friends why they should get freegling!"
      class="mt-2 mb-2 border border-primary"
    />
    <b-list-group horizontal class="flex-wrap">
      <b-list-group-item>
        <ShareNetwork
          network="facebook"
          :url="url"
          :title="title"
          :description="invitation"
          hashtags="freegle,free,reuse"
          @open="chosen"
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
          :title="title"
          :description="invitation"
          hashtags="freegle,free,reuse"
          @open="chosen"
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
          :title="title"
          :description="invitation"
          hashtags="freegle,free,reuse"
          @open="chosen"
        >
          <b-button variant="secondary" class="mt-1 whatsapp">
            <v-icon :icon="['fab', 'whatsapp']" /> Whatsapp
          </b-button>
        </ShareNetwork>
      </b-list-group-item>
      <b-list-group-item>
        <ShareNetwork
          network="email"
          url=""
          :title="title"
          :description="invitation"
          hashtags="freegle,free,reuse"
          @open="chosen"
        >
          <b-button variant="secondary" class="mt-1 gmail">
            <v-icon icon="envelope" /> Email
          </b-button>
        </ShareNetwork>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>
<script>
import VueSocialSharing from 'vue-social-sharing'
import { useNuxtApp } from '#imports'

export default {
  props: {
    headingLevel: {
      type: String,
      required: false,
      default: 'h3',
    },
    trustPilot: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup() {
    // We install this plugin here rather than from the plugins folder to reduce page load side in the mainline
    // case.
    const nuxtApp = useNuxtApp()
    nuxtApp.vueApp.use(VueSocialSharing)

    const runtimeConfig = useRuntimeConfig()

    return {
      url: runtimeConfig.public.USER_SITE,
    }
  },
  data() {
    return {
      invitation:
        "Hi - I'm using Freegle to give and get things for free.  Check it out at https://www.ilovefreegle.org",
      title: 'Have you heard about Freegle?',
    }
  },
  mounted() {
    this.$api.bandit.shown({
      uid: 'Invite',
      variant: 'microvolunteering',
    })
  },
  methods: {
    chosen() {
      this.$emit('invited')

      this.$api.bandit.chosen({
        uid: 'Invite',
        variant: 'microvolunteering',
      })
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  grid-row-gap: 20px;
  grid-column-gap: 10px;

  @include media-breakpoint-up(md) {
    grid-template-columns: auto auto;
    grid-column-gap: 20px;
    grid-template-rows: auto;
    grid-row-gap: 0px;
  }
}
</style>
