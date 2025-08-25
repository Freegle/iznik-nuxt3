<template>
  <client-only v-if="me">
    <DonationAskModal
      v-if="showDonationAskModal"
      @hidden="showDonationAskModal = false"
    />
    <DeadlineAskModal v-if="askDeadline" :ids="ids" @hide="maybeAskDelivery" />
    <DeliveryAskModal v-if="askDelivery" :ids="ids" />

    <b-container fluid class="p-0 p-xl-2">
      <h1 class="visually-hidden">My posts</h1>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft
              ad-unit-path="/22794232631/freegle_myposts_desktop"
              ad-div-id="div-gpt-ad-1692868003771-0"
            />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <AppUpdateAvailable />
          <ExpectedRepliesWarning
            v-if="me && me.expectedreplies"
            :count="me.expectedreplies"
            :chats="me.expectedchats"
          />
          <div v-if="!me" class="d-flex justify-content-center mt-4 flex-wrap">
            <b-button variant="primary" size="lg" @click="forceLogin">
              Log in to continue <v-icon icon="angle-double-right" />
            </b-button>
          </div>
          <div v-else>
            <NewUserInfo v-if="newUserPassword" :password="newUserPassword" />
            <div v-else-if="type === 'Offer' && !donated">
              <NoticeMessage
                type="info"
                class="text-center font-weight-bold text-danger"
              >
                We're a charity - free to use, but not free to run. Help us keep
                going by donating £1?
                <DonationButton
                  v-if="payPalFallback"
                  :text="'Donate £1'"
                  :value="1"
                />
                <StripeDonate
                  v-else
                  :price="1"
                  @success="donationMade"
                  @no-payment-methods="noMethods"
                />
              </NoticeMessage>
            </div>

            <MyPostsPostsList
              :posts="posts"
              :loading="loading"
              :default-expanded="posts.length <= 5"
              :show="shownCount"
              @load-more="loadMore"
            />

            <MyPostsSearchesList v-if="loadedMore" />
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <VisibleWhen :at="['xl', 'xxl']">
            <SidebarRight
              :show-job-opportunities="false"
              ad-unit-path="/22794232631/freegle_myposts_desktop_right"
              ad-div-id="div-gpt-ad-1709056727559-0"
              :jobs="false"
            />
          </VisibleWhen>
        </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script setup>
import { useAuthStore } from '../stores/auth'
import { useMessageStore } from '../stores/message'
import { useSearchStore } from '../stores/search'
import { useMe } from '~/composables/useMe'
import { buildHead } from '~/composables/useBuildHead'
import { useFavoritePage } from '~/composables/useFavoritePage'
import {
  ref,
  computed,
  watch,
  onMounted,
  defineAsyncComponent,
  useHead,
  useRouter,
} from '#imports'

import VisibleWhen from '~/components/VisibleWhen'
import SidebarLeft from '~/components/SidebarLeft'
import SidebarRight from '~/components/SidebarRight'
import ExpectedRepliesWarning from '~/components/ExpectedRepliesWarning'
import MyPostsPostsList from '~/components/MyPostsPostsList.vue'
import MyPostsSearchesList from '~/components/MyPostsSearchesList.vue'
import NoticeMessage from '~/components/NoticeMessage.vue'
import DonationButton from '~/components/DonationButton.vue'
import StripeDonate from '~/components/StripeDonate.vue'
import NewUserInfo from '~/components/NewUserInfo.vue'
import DeadlineAskModal from '~/components/DeadlineAskModal.vue'
import DeliveryAskModal from '~/components/DeliveryAskModal.vue'
import { useDonationAskModal } from '~/composables/useDonationAskModal'
import { useTrystStore } from '~/stores/tryst'
import { useRuntimeConfig } from '#app'
import Api from '~/api'

console.log('My Posts page setup')
const DonationAskModal = defineAsyncComponent(() =>
  import('~/components/DonationAskModal')
)

const authStore = useAuthStore()
const messageStore = useMessageStore()
const searchStore = useSearchStore()
const trystStore = useTrystStore()
const router = useRouter()
// Use me and myid computed properties from useMe composable for consistency
const { me, myid } = useMe()

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)
const ids = ref([])
const type = ref(null)
const newUserPassword = ref(null)
const donated = ref(false)

definePageMeta({
  layout: 'login',
})

useHead(
  buildHead(
    router.currentRoute.value,
    runtimeConfig,
    'My Posts',
    "See OFFERs/WANTEDs that you've posted, and replies to them.",
    null,
    {
      class: 'overflow-y-scroll',
    }
  )
)

useFavoritePage('myposts')

const { showDonationAskModal } = await useDonationAskModal()

// `posts` holds both OFFERs and WANTEDs (both old and active)
const posts = computed(() => messageStore.byUserList[myid.value] || [])

const loading = ref(true)

watch(
  myid,
  async (newMyid) => {
    if (newMyid) {
      loading.value = true

      await messageStore.fetchByUser(newMyid, false, true)

      loading.value = false

      // No need to wait for searches - often below the fold.
      searchStore.fetch(newMyid)
    }
  },
  {
    immediate: true,
  }
)

const shownCount = ref(1)
const loadedMore = ref(false)

function loadMore(infiniteLoaderInstance) {
  shownCount.value++

  if (shownCount.value > posts.value.length) {
    shownCount.value = posts.value.length
  }

  loadedMore.value = true
  infiniteLoaderInstance.loaded()
}

function forceLogin() {
  authStore.forceLogin = true
}

trystStore.fetch()

// If we have just submitted some posts then we will have been passed ids.
// In that case, we might want to ask if we can deliver.
const askDelivery = ref(false)
const askDeadline = ref(false)

function maybeAskDelivery() {
  if (type.value === 'Offer') {
    askDelivery.value = true
  }
}

onMounted(() => {
  type.value = window.history.state?.type || null

  if (type.value) {
    askDeadline.value = true

    window.setTimeout(() => {
      window.history.replaceState({ ids: null, type: null }, null)
    }, 5000)

    if (type.value === 'Offer' && myid) {
      api.bandit.shown({
        uid: 'donation',
        variant: 'mypostoffer',
      })
    }
  }

  if (window.history.state?.ids?.length) {
    // We have just submitted.  Grab the ids and clear it out so that we don't show the modal next time.
    ids.value = window.history.state.ids
    newUserPassword.value = window.history.state.newpassword
  }

  showDonationAskModal.value = true // debug: shows <DonationAskModal/> on My Posts
})

function donationMade() {
  api.bandit.chosen({
    uid: 'donation',
    variant: 'mypostoffer',
  })

  donated.value = true
}

const payPalFallback = ref(false)

function noMethods() {
  payPalFallback.value = true
}
</script>
<style scoped lang="scss">
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/sidebar-ads.scss';
</style>
