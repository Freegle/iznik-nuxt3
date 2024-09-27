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
import { buildHead } from '~/composables/useBuildHead'
import { useFavoritePage } from '~/composables/useFavoritePage'

import VisibleWhen from '~/components/VisibleWhen'
import SidebarLeft from '~/components/SidebarLeft'
import SidebarRight from '~/components/SidebarRight'
import ExpectedRepliesWarning from '~/components/ExpectedRepliesWarning'
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
</style>
