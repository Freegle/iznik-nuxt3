<template>
  <b-card
    class="mt-2"
    border-variant="info"
    header="info"
    header-bg-variant="info"
    header-text-variant="white"
    no-body
  >
    <template #header>
      <div class="d-flex justify-content-between">
        <span v-if="oldPosts.length > 0">
          <span v-if="!showOldPosts">
            <b-button variant="secondary" @click="toggleShowOldPosts">
              Show {{ formattedOldPostsCount }}
            </b-button>
          </span>
          <span v-else>
            <b-button variant="secondary" @click="toggleShowOldPosts">
              Hide {{ formattedOldPostsCount }}
            </b-button>
          </span>
        </span>
      </div>
    </template>

    <b-card-body class="p-1 p-lg-3">
      <b-card-text class="text-center">
        <div
          v-if="upcomingTrysts.length > 0"
          class="mt-2 mb-3 border border-info p-2"
        >
          <h3 class="header--size4 text-start">Your upcoming collections:</h3>
          <div
            v-for="tryst in upcomingTrysts"
            :key="'tryst-' + tryst.id"
            variant="info"
            class="text-start"
          >
            <v-icon icon="calendar-alt" class="pt-1" />&nbsp;
            <span class="font-weight-bold">{{ tryst.trystdate }}</span>
            &nbsp;{{ tryst.name }} collecting&nbsp;<em>{{ tryst.subject }}</em>
          </div>
        </div>
        <div v-if="visiblePosts.length > 0">
          <div
            v-for="post in visiblePosts"
            :key="'post-' + post.id"
            class="p-0 text-start mt-1"
          >
            <Suspense>
              <MyMessage
                :id="post.id"
                :show-old="showOldPosts"
                :expand="defaultExpanded"
                class="minheight"
              />
              <template #fallback>
                <div class="w-100 d-flex justify-content-center text-center">
                  <client-only>
                    <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
                  </client-only>
                </div>
              </template>
            </Suspense>
          </div>
          <b-img
            v-if="loading"
            lazy
            src="/loader.gif"
            alt="Loading..."
            width="100px"
          />
          <InfiniteLoading
            :distance="scrollboxHeight"
            @infinite="emit('load-more', $event)"
          />
        </div>
        <div v-else>
          <b-row>
            <b-col>
              <p>You have no active posts.</p>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-center">
              <template v-if="props.type === 'Offer'">
                <b-button to="/give" class="mt-1" size="lg" variant="primary">
                  <v-icon icon="gift" />&nbsp;OFFER something
                </b-button>
              </template>
              <template v-else-if="props.type === 'Wanted'">
                <b-button to="/find" class="mt-1" size="lg" variant="primary">
                  <v-icon icon="shopping-cart" />&nbsp;Ask for something
                </b-button>
              </template>
            </b-col>
          </b-row>
        </div>
      </b-card-text>
    </b-card-body>
  </b-card>
</template>
<script setup>
import pluralize from 'pluralize'
import dayjs from 'dayjs'
import MyMessage from '~/components/MyMessage.vue'
import InfiniteLoading from '~/components/InfiniteLoading.vue'
import { useMessageStore } from '~/stores/message'
import { useUserStore } from '~/stores/user'
import { useTrystStore } from '~/stores/tryst'

const messageStore = useMessageStore()
const userStore = useUserStore()
const trystStore = useTrystStore()

const props = defineProps({
  posts: { type: Array, required: true },
  postIds: { type: Array, required: false },
  loading: { type: Boolean, required: true },
  defaultExpanded: { type: Boolean, required: true },
  show: { type: Number, required: true },
})

const emit = defineEmits(['load-more'])

const scrollboxHeight = ref(1000)

const showOldPosts = ref(false)
function toggleShowOldPosts() {
  showOldPosts.value = !showOldPosts.value
}

// old posts are those without an outcome
const oldPosts = computed(() => {
  return props.posts.filter((post) => post.hasoutcome)
})

const formattedOldPostsCount = computed(() => {
  return pluralize(`old post`, oldPosts.value.length, true)
})

const activePosts = computed(() => {
  return props.posts.filter((post) => !post.hasoutcome)
})

const postIds = computed(() => {
  return props.posts.map((post) => post.id)
})

watch(postIds, (newIds, oldIds) => {
  // Fetch new messages when postIds change
  if (oldIds && newIds.length !== oldIds.length) {
    const newPostIds = newIds.filter(id => !oldIds.includes(id))
    newPostIds.forEach((id) => {
      if (!messageStore.byId(id)) {
        messageStore.fetch(id)
      }
    })
  }
})

watch(activePosts, (newVal) => {
  // For messages which are promised and not successful, we need to trigger a fetch.  This is so
  // that we can correctly show the upcoming collections.
  newVal.forEach((post) => {
    if (
      post.type === 'Offer' &&
      post.promised &&
      !post.hasoutcome &&
      !messageStore.byId(post.id)
    ) {
      messageStore.fetch(post.id)
    }
  })
})

const visiblePosts = computed(() => {
  let posts = showOldPosts.value ? props.posts : activePosts.value
  posts = posts || []

  return posts.toSorted((a, b) => {
    // promised items first, then by most recently posted
    if (!showOldPosts.value && a.promised && !b.promised) {
      return -1
    } else if (!showOldPosts.value && b.promised && !a.promised) {
      return 1
    } else {
      return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
    }
  })
})

const upcomingTrysts = computed(() => {
  const ret = []

  activePosts.value.forEach((post) => {
    const message = messageStore.byId(post.id)
    if (post.type === 'Offer' && message?.promises?.length) {
      message.promises.forEach((p) => {
        const user = userStore?.byId(p.userid)

        if (user) {
          const tryst = trystStore?.getByUser(p.userid)

          // If tryst.arrangedfor is in the future or within the last hour
          if (
            tryst &&
            new Date(tryst.arrangedfor).getTime() >
              new Date().getTime() - 60 * 60 * 1000
          ) {
            const date = tryst
              ? dayjs(tryst.arrangedfor).format('dddd Do HH:mm a')
              : null

            ret.push({
              id: p.userid,
              name: user.displayname,
              tryst,
              trystdate: date,
              subject: message.subject,
            })
          }
        }
      })
    }
  })

  return ret.toSorted((a, b) => {
    return (
      new Date(a.tryst.arrangedfor).getTime() -
      new Date(b.tryst.arrangedfor).getTime()
    )
  })
})
</script>
<style scoped>
.minheight {
  min-height: 200px;
}
</style>
