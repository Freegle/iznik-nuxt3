<template>
  <client-only v-if="me">
    <DonationAskModal
      v-if="showDonationAskModal"
      @hidden="showDonationAskModal = false"
    />

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
              :dimensions="[300, 250]"
              div-id="div-gpt-ad-1692868003771-0"
              class="mt-2"
            />
          </VisibleWhen>
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
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
            :not="['xs', 'sm', 'md', 'lg']"
            class="position-fixed"
            style="right: 5px"
          >
            <ExternalDa
              ad-unit-path="/22794232631/freegle_myposts_desktop"
              :dimensions="[300, 250]"
              div-id="div-gpt-ad-1692868003771-1"
              class="mt-2"
              style="width: 300px"
              @rendered="adRendered2"
            />
          </VisibleWhen>
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarRight class="martop2" show-job-opportunities />
          </VisibleWhen>
        </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>

<script setup>
import { useRoute } from 'vue-router'
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
const DonationAskModal = defineAsyncComponent(() =>
  import('~/components/DonationAskModal')
)

const authStore = useAuthStore()
const messageStore = useMessageStore()
const searchStore = useSearchStore()

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

definePageMeta({
  layout: 'login',
})

useHead(
  buildHead(
    route,
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

const myid = authStore.user?.id

// `posts` holds both OFFERs and WANTEDs (both old and active)
const posts = computed(() => messageStore.byUserList[myid] || [])

const offersLoading = ref(true)
const wantedsLoading = ref(true)

if (myid) {
  offersLoading.value = true
  wantedsLoading.value = true

  await messageStore.fetchByUser(myid, false, true)

  offersLoading.value = false
  wantedsLoading.value = false

  // No need to wait for searches - often below the fold.
  searchStore.fetch(myid)
}

const shownOffersCount = ref(1)
const offers = computed(() => {
  return posts.value.filter((message) => message.type === 'Offer')
})

async function loadMoreOffers(infiniteLoaderInstance) {
  shownOffersCount.value++

  if (shownOffersCount.value > offers.value.length) {
    shownOffersCount.value = offers.value.length

    infiniteLoaderInstance.complete()
  } else {
    // only show the loading indicator when loading the active offers
    if (!offers.value[shownOffersCount.value - 1].hasoutcome)
      offersLoading.value = true

    await messageStore.fetch(offers.value[shownOffersCount.value - 1].id)

    offersLoading.value = false
    infiniteLoaderInstance.loaded()
  }
}

const shownWantedsCount = ref(1)
const wanteds = computed(() => {
  return posts.value.filter((message) => message.type === 'Wanted')
})

async function loadMoreWanteds(infiniteLoaderInstance) {
  shownWantedsCount.value++

  if (shownWantedsCount.value > wanteds.value.length) {
    shownWantedsCount.value = wanteds.value.length

    infiniteLoaderInstance.complete()
  } else {
    // only show the loading indicator when loading the active wanteds
    if (!wanteds.value[shownWantedsCount.value - 1].hasoutcome)
      wantedsLoading.value = true

    await messageStore.fetch(wanteds.value[shownWantedsCount.value - 1].id)

    wantedsLoading.value = false
    infiniteLoaderInstance.loaded()
  }
}

function forceLogin() {
  authStore.forceLogin = true
}

const martop2 = ref('285px')

function adRendered2(visible) {
  martop2.value = visible ? '285px' : '0px'
}

onMounted(() => {
  showDonationAskModal.value = true
})
</script>
<style scoped lang="scss">
.martop2 {
  margin-top: v-bind(martop2);
}
</style>
