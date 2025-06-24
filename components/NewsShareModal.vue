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
        <b-button
          v-if="isApp"
          variant="primary"
          size="lg"
          class="m-3"
          @click="shareApp"
        >
          Share now
        </b-button>
        <b-list-group
          v-else
          :key="'newsshare-' + bump"
          horizontal
          class="flex-wrap"
        >
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
                <v-icon :icon="['fab', 'twitter']" /> X
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

<script setup>
import { ref, computed } from 'vue'
import VueSocialSharing from 'vue-social-sharing'
import { Share } from '@capacitor/share'
import { useOurModal } from '~/composables/useOurModal'
import { useNuxtApp, useRuntimeConfig } from '#app'
import { useMobileStore } from '@/stores/mobile'

const mobileStore = useMobileStore()

const props = defineProps({
  newsfeed: {
    type: Object,
    required: true,
  },
})

const { modal, hide } = useOurModal()

// We install this plugin here rather than from the plugins folder to reduce page load side in the mainline
// case.
const nuxtApp = useNuxtApp()
nuxtApp.vueApp.use(VueSocialSharing)

const copied = ref(false)
const bump = ref(0)

const url = computed(() => {
  if (props.newsfeed) {
    const runtimeConfig = useRuntimeConfig()
    return runtimeConfig.public.USER_SITE + '/chitchat/' + props.newsfeed.id
  }
  return null
})

const isApp = ref(mobileStore.isApp) // APP

async function doCopy() {
  await navigator.clipboard.writeText(url.value)
  copied.value = true
}

function opened() {
  bump.value++
}

async function shareApp() {
  const href = url.value
  const subject = 'Sharing Freegle chitchat'
  try {
    await Share.share({
      title: subject,
      text: props.newsfeed.message + '\n\n', // not supported on some apps (Facebook, Instagram)
      url: href,
      dialogTitle: 'Share now...',
    })
  } catch (e) {
    console.log('Share exception', e.message)
  }
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
