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
        <h2 class="d-inline header--size3">
          <v-icon icon="gift" scale="2" /> {{ listHeaderText }}
        </h2>

        <span v-if="oldPosts.length > 0">
          <span v-if="!showOldPosts">
            <b-button variant="secondary" @click="toggleShowOldPosts">
              +{{ formattedOldPostsCount }}
            </b-button>
          </span>
          <span v-else>
            <b-button
              variant="secondary"
              :title="`Show old ${props.type}`"
              @click="toggleShowOldPosts"
            >
              Hide {{ formattedOldPostsCount }}
            </b-button>
          </span>
        </span>
      </div>
    </template>

    <b-card-body class="p-1 p-lg-3">
      <b-card-text class="restricted-height text-center">
        <p v-if="activePosts.length > 0" class="text-muted">
          <template v-if="props.type === 'Offer'">
            Stuff you're giving away.
          </template>
          <template v-else-if="props.type === 'Wanted'">
            Stuff you're trying to find.
          </template>
        </p>
        <b-img
          v-if="props.loading"
          lazy
          src="/loader.gif"
          alt="Loading..."
          width="100px"
        />
        <div v-else-if="visiblePosts.length > 0">
          <div
            v-for="post in visiblePosts"
            :key="'post-' + post.id"
            class="p-0 text-start mt-1"
          >
            <MyMessage
              :id="post.id"
              :show-old="showOldPosts"
              :expand="oldPosts.includes(post)"
            />
          </div>
          <InfiniteLoading
            :distance="1000"
            @infinite="emit('load-more', $event)"
          />
        </div>
        <div v-else>
          <b-row>
            <b-col>
              <p>You have no active {{ props.type.toUpperCase() }}s.</p>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-center">
              <b-button to="/give" class="mt-1" size="lg" variant="primary">
                <v-icon icon="gift" />&nbsp;{{ props.type }} something
              </b-button>
            </b-col>
          </b-row>
        </div>
      </b-card-text>
    </b-card-body>
  </b-card>
</template>

<script setup>
import pluralize from 'pluralize'
import MyMessage from '~/components/MyMessage.vue'
import InfiniteLoading from '~/components/InfiniteLoading.vue'

const props = defineProps({
  type: { type: String, required: true },
  posts: { type: Array, required: true },
  loading: { type: Boolean },
})

const emit = defineEmits(['load-more'])

const listHeaderText = computed(() => {
  return `Your ${props.type.toUpperCase()}s`
})

const showOldPosts = ref(false)
function toggleShowOldPosts() {
  showOldPosts.value = !showOldPosts.value
}

// old posts are those without an outcome
const oldPosts = computed(() => {
  return props.posts.filter((post) => post.hasoutcome)
})

const formattedOldPostsCount = computed(() => {
  return pluralize(
    `old ${props.type.toUpperCase()}`,
    oldPosts.value.length,
    true
  )
})

const activePosts = computed(() => {
  return props.posts.filter((post) => !post.hasoutcome)
})

const visiblePosts = computed(() => {
  return (
    showOldPosts.value
      ? activePosts.value.concat(oldPosts.value)
      : activePosts.value
  ).toSorted((a, b) => {
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
</script>

<style scoped>
.restricted-height {
  height: 300px;
  overflow-y: auto;
}
</style>
