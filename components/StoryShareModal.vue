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
                <v-icon :icon="['fab', 'twitter']" /> X
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
<script setup>
// There are a bunch of icons we need only rarely.  By requiring them here we avoid
// requiring them in the vue-awesome plugin.  That makes them available everywhere - but
// increases the bundle size.  Putting them here allows better bundling.
import VueSocialSharing from 'vue-social-sharing'
import { ref, computed } from 'vue'
import { useStoryStore } from '~/stores/stories'
import { useOurModal } from '~/composables/useOurModal'
import { useNuxtApp } from '#app'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const storyStore = useStoryStore()
const { modal, hide } = useOurModal()
const copied = ref(false)
const bump = ref(0)

// We install this plugin here rather than from the plugins folder to reduce page load side in the mainline
// case.
const nuxtApp = useNuxtApp()
nuxtApp.vueApp.use(VueSocialSharing)

try {
  await storyStore.fetch(props.id, true)
} catch (e) {
  // Must no longer exist on server.
  hide()
}

const story = computed(() => {
  return storyStore.byId(props.id)
})

async function doCopy() {
  await navigator.clipboard.writeText(story.value.url)
  copied.value = true
}

function opened() {
  bump.value++
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
