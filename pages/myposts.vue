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
          <VisibleWhen
            :not="['xs', 'sm', 'md', 'lg']"
            class="position-fixed"
            style="width: 300px"
          >
            <ExternalDa
              ad-unit-path="/22794232631/freegle_myposts_desktop"
              :dimensions="[
                [300, 600],
                [300, 250],
              ]"
              div-id="div-gpt-ad-1692868003771-0"
              class="mt-2"
            />
          </VisibleWhen>
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft />
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
            <VisibleWhen :at="['xs', 'sm', 'md']">
              <JobsTopBar />
            </VisibleWhen>

            <NewUserInfo v-if="newUserPassword" :password="newUserPassword" />

            <MyPostsPostsList
              v-if="offers"
              type="Offer"
              :posts="offers"
              :loading="offersLoading"
              :default-expanded="posts.length <= 5"
              :show="shownOffersCount"
              @load-more="loadMoreOffers"
            />

            <MyPostsPostsList
              v-if="wanteds"
              type="Wanted"
              :posts="wanteds"
              :loading="wantedsLoading"
              :default-expanded="posts.length <= 5"
              :show="shownWantedsCount"
              @load-more="loadMoreWanteds"
            />

            <MyPostsSearchesList />
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <VisibleWhen
            :at="['xl', 'xxl']"
            :class="{
              'sidebar-with-small-ads': smallAdVisible,
              'sidebar-with-large-ads': largeAdVisible,
              'ads-wrapper': true,
            }"
          >
            <ExternalDa
              ad-unit-path="/22794232631/freegle_myposts_desktop_right"
              :dimensions="[
                [300, 600],
                [300, 250],
              ]"
              div-id="div-gpt-ad-1709056727559-0"
              class="mt-2"
              @rendered="adRendered"
            />
            <SidebarRight v-if="triedAds" :show-job-opportunities="true" />
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
import { buildHead } from '~/composables/useBuildHead'
import { useFavoritePage } from '~/composables/useFavoritePage'

import VisibleWhen from '~/components/VisibleWhen'
import SidebarLeft from '~/components/SidebarLeft'
import SidebarRight from '~/components/SidebarRight'
import ExpectedRepliesWarning from '~/components/ExpectedRepliesWarning'
import JobsTopBar from '~/components/JobsTopBar'
import MyPostsPostsList from '~/components/MyPostsPostsList.vue'
import MyPostsSearchesList from '~/components/MyPostsSearchesList.vue'
import { useDonationAskModal } from '~/composables/useDonationAskModal'
import { useTrystStore } from '~/stores/tryst'
const DonationAskModal = defineAsyncComponent(() =>
  import('~/components/DonationAskModal')
)

const authStore = useAuthStore()
const messageStore = useMessageStore()
const searchStore = useSearchStore()
const trystStore = useTrystStore()

const runtimeConfig = useRuntimeConfig()
const ids = ref([])
const type = ref(null)
const newUserPassword = ref(null)

definePageMeta({
  layout: 'login',
})

useHead(
  buildHead(
    useRouter().currentRoute.value,
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

const myid = computed(() => authStore.user?.id)

// `posts` holds both OFFERs and WANTEDs (both old and active)
const posts = computed(() => messageStore.byUserList[myid.value] || [])

const offersLoading = ref(true)
const wantedsLoading = ref(true)

watch(
  myid,
  async (newMyid) => {
    if (newMyid) {
      offersLoading.value = true
      wantedsLoading.value = true

      await messageStore.fetchByUser(newMyid, false, true)

      offersLoading.value = false
      wantedsLoading.value = false

      // No need to wait for searches - often below the fold.
      searchStore.fetch(newMyid)
    }
  },
  {
    immediate: true,
  }
)

const shownOffersCount = ref(1)
const offers = computed(() => {
  return posts.value.filter((message) => message.type === 'Offer')
})

function loadMoreOffers(infiniteLoaderInstance) {
  shownOffersCount.value++

  if (shownOffersCount.value > offers.value.length) {
    shownOffersCount.value = offers.value.length
  }

  infiniteLoaderInstance.loaded()
}

const shownWantedsCount = ref(1)
const wanteds = computed(() => {
  return posts.value.filter((message) => message.type === 'Wanted')
})

function loadMoreWanteds(infiniteLoaderInstance) {
  shownWantedsCount.value++

  if (shownWantedsCount.value > wanteds.value.length) {
    shownWantedsCount.value = wanteds.value.length
  }

  infiniteLoaderInstance.complete()
}

function forceLogin() {
  authStore.forceLogin = true
}

const largeAdVisible = ref(false)
const smallAdVisible = ref(false)
const triedAds = ref(false)

function adRendered(rendered, index, dimension) {
  if (rendered) {
    if (index === 0) {
      largeAdVisible.value = true
    } else {
      smallAdVisible.value = true
    }
  }

  triedAds.value = true
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
  }

  if (window.history.state?.ids?.length) {
    // We have just submitted.  Grab the ids and clear it out so that we don't show the modal next time.
    ids.value = window.history.state.ids
    newUserPassword.value = window.history.state.newpassword
  }

  // showDonationAskModal.value = true
})
</script>
<style scoped lang="scss">
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/sidebar-ads.scss';

.sidebar-with-small-ads .sidebar__wrapper {
  height: calc(
    100vh - $sidebar-ads-height-small - $sidebar-ads-label-height -
      var(--header-navbar-height) - $sticky-banner-height-desktop
  );
}

.sidebar-with-large-ads .sidebar__wrapper {
  height: calc(
    100vh - $sidebar-ads-height-large - $sidebar-ads-label-height -
      var(--header-navbar-height) - $sticky-banner-height-desktop
  );
}
</style>
