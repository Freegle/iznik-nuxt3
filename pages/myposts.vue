<template>
  <client-only v-if="me">
    <DonationAskModal
      v-if="showDonationAskModal"
      @hidden="showDonationAskModal = false"
    />

    <b-container fluid class="p-0 p-xl-2">
      <h1 class="visually-hidden">My posts</h1>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pe-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft
              ad-unit-path="/22794232631/freegle_myposts_desktop"
              ad-div-id="div-gpt-ad-1692868003771-0"
            />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <AppUpdateAvailable v-if="mobileStore.isApp" />
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
            <MyPostsDonationAsk
              v-else-if="type === 'Offer' && !donated"
              @donation-made="donationMade"
            />

            <MyPostsPostsList
              :key="infiniteScrollKey"
              :posts="posts"
              :loading="loading"
              :default-expanded="posts.length <= 5"
              :show="shownCount"
              @load-more="loadMore"
              @toggle-old="resetInfiniteScroll"
            />

            <MyPostsSearchesList v-if="loadedMore" />
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="p-0 ps-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
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
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '~/stores/mobile'
import { useMessageStore } from '~/stores/message'
import { useSearchStore } from '~/stores/search'
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
import MyPostsDonationAsk from '~/components/MyPostsDonationAsk.vue'
import NewUserInfo from '~/components/NewUserInfo.vue'
import { useDonationAskModal } from '~/composables/useDonationAskModal'
import { useTrystStore } from '~/stores/tryst'
import { useRuntimeConfig } from '#app'
import { action } from '~/composables/useClientLog'

console.log('My Posts page setup')
const DonationAskModal = defineAsyncComponent(() =>
  import('~/components/DonationAskModal')
)

const authStore = useAuthStore()
const mobileStore = useMobileStore()
const messageStore = useMessageStore()
const searchStore = useSearchStore()
const trystStore = useTrystStore()
const router = useRouter()
// Use me and myid computed properties from useMe composable for consistency
const { me, myid } = useMe()

const runtimeConfig = useRuntimeConfig()
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

      // Fetch active posts first — server filters expired messages
      await messageStore.fetchByUser(newMyid, true, true)

      // Fetch full message details for active posts and wait for them —
      // this means MyMessage components will have data in the store at mount
      // time, so they render immediately without waiting for IntersectionObserver.
      const activePosts = (messageStore.byUserList[newMyid] || [])
        .filter((p) => !p.hasoutcome)
        .slice(0, 10)
      if (activePosts.length > 0) {
        await Promise.all(activePosts.map((p) => messageStore.fetch(p.id)))
      }

      loading.value = false

      // Fetch all posts (including old) in background — don't await
      messageStore.fetchByUser(newMyid, false, false)

      // No need to wait for searches and trysts - often below the fold.
      searchStore.fetch(newMyid)
      trystStore.fetch()
    }
  },
  {
    immediate: true,
  }
)

// When the background active=false fetch updates byUserList, prefetch details
// for any active posts that weren't returned by the active=true fetch.
watch(posts, (newPosts) => {
  const toFetch = newPosts.filter(
    (p) => !p.hasoutcome && !messageStore.byId(p.id)
  )
  if (toFetch.length > 0) {
    toFetch.forEach((p) => messageStore.fetch(p.id))
  }
})

const shownCount = ref(1)
const loadedMore = ref(false)
const infiniteScrollKey = ref(0)

function resetInfiniteScroll() {
  shownCount.value = 1
  infiniteScrollKey.value++
}

function loadMore(infiniteLoaderInstance) {
  if (!me.value) {
    // Auth hasn't hydrated yet — don't call complete() as that permanently
    // stops the observer. Call loaded() and let it retry on next scroll.
    infiniteLoaderInstance.loaded()
    return
  }

  shownCount.value++

  if (shownCount.value > posts.value.length) {
    shownCount.value = posts.value.length

    if (posts.value.length === 0) {
      // Posts haven't loaded yet — don't call complete() prematurely.
      infiniteLoaderInstance.loaded()
    } else {
      infiniteLoaderInstance.complete()
    }
  } else {
    infiniteLoaderInstance.loaded()
  }

  loadedMore.value = true
}

function forceLogin() {
  authStore.forceLogin = true
}

onMounted(() => {
  type.value = window.history.state?.type || null

  if (type.value) {
    window.setTimeout(() => {
      window.history.replaceState({ ids: null, type: null }, null)
    }, 5000)

    if (type.value === 'Offer' && myid) {
      action('Myposts viewed after Offer', { messageIds: ids.value })
    }
  }

  if (window.history.state?.ids?.length) {
    ids.value = window.history.state.ids
    newUserPassword.value = window.history.state.newpassword
  }
})

function donationMade() {
  action('Donation made from myposts', { messageIds: ids.value })
  donated.value = true
}
</script>
<style scoped lang="scss">
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/sidebar-ads.scss';
</style>
