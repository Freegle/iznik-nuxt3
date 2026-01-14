<template>
  <div class="my-posts-list">
    <!-- Active posts count header -->
    <div v-if="!loading && activePosts.length > 0" class="active-posts-header">
      <v-icon icon="gift" class="me-2" />
      {{ formattedActivePostsCount }}
    </div>

    <!-- Old posts toggle button -->
    <div v-if="!loading && oldPosts.length > 0" class="old-posts-toggle">
      <button class="toggle-btn" @click="toggleShowOldPosts">
        <v-icon :icon="showOldPosts ? 'eye-slash' : 'eye'" class="me-2" />
        {{ showOldPosts ? 'Hide' : 'Show' }} {{ formattedOldPostsCount }}
      </button>
    </div>

    <!-- Upcoming collections -->
    <div v-if="!loading && upcomingTrysts.length > 0" class="collections-card">
      <h3 class="collections-title">
        <v-icon icon="calendar-check" class="me-2" />Your upcoming collections
      </h3>
      <div
        v-for="tryst in upcomingTrysts"
        :key="'tryst-' + tryst.id"
        class="collection-item"
      >
        <v-icon icon="calendar-alt" class="collection-icon" />
        <div class="collection-info">
          <span class="collection-date">{{ tryst.trystdate }}</span>
          <span class="collection-details">
            {{ tryst.name }} collecting <em>{{ tryst.subject }}</em>
          </span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <b-img lazy src="/loader.gif" alt="Loading..." width="60px" />
    </div>

    <!-- Posts list -->
    <div v-else-if="visiblePosts.length > 0" class="posts-container">
      <div v-for="post in visiblePosts" :key="'post-' + post.id">
        <Suspense>
          <MyMessage
            :id="post.id"
            :show-old="showOldPosts"
            :expand="defaultExpanded"
          />
          <template #fallback>
            <div class="loading-placeholder">
              <b-img lazy src="/loader.gif" alt="Loading" width="80px" />
            </div>
          </template>
        </Suspense>
      </div>
      <InfiniteLoading
        :distance="scrollboxHeight"
        @infinite="(event) => emit('load-more', event)"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <v-icon icon="folder-open" class="empty-icon" />
      <p class="empty-text">You have no active posts.</p>
      <div class="empty-actions">
        <template v-if="props.type === 'Offer'">
          <nuxt-link to="/give" class="mobile-btn mobile-btn--give">
            <v-icon icon="gift" class="me-2" />Give stuff
          </nuxt-link>
        </template>
        <template v-else-if="props.type === 'Wanted'">
          <nuxt-link to="/find" class="mobile-btn mobile-btn--find">
            <v-icon icon="search" class="me-2" />Find stuff
          </nuxt-link>
        </template>
        <template v-else>
          <nuxt-link to="/give" class="mobile-btn mobile-btn--give">
            <v-icon icon="gift" class="me-2" />Give stuff
          </nuxt-link>
          <nuxt-link to="/find" class="mobile-btn mobile-btn--find">
            <v-icon icon="search" class="me-2" />Find stuff
          </nuxt-link>
        </template>
      </div>
    </div>
  </div>
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
  postIds: { type: Array, required: false, default: () => [] },
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

// Posts are now passed directly as props
const posts = computed(() => {
  return props.posts || []
})

// old posts are those with an outcome
const oldPosts = computed(() => {
  return posts.value.filter((post) => post.hasoutcome)
})

const formattedOldPostsCount = computed(() => {
  return pluralize(`old post`, oldPosts.value.length, true)
})

const formattedActivePostsCount = computed(() => {
  return pluralize(`active post`, activePosts.value.length, true)
})

const activePosts = computed(() => {
  return posts.value.filter((post) => !post.hasoutcome)
})

const postIds = computed(() => {
  return props.posts.map((post) => post.id)
})

watch(postIds, (newIds, oldIds) => {
  // Fetch new messages when postIds change
  if (oldIds && newIds.length !== oldIds.length) {
    const newPostIds = newIds.filter((id) => !oldIds.includes(id))
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
  let visiblePostList = showOldPosts.value ? posts.value : activePosts.value
  visiblePostList = visiblePostList || []

  const result = visiblePostList
    .toSorted((a, b) => {
      // promised items first, then by most recently
      if (!showOldPosts.value && a.promised && !b.promised) {
        return -1
      } else if (!showOldPosts.value && b.promised && !a.promised) {
        return 1
      } else {
        return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
      }
    })
    .slice(0, props.show)

  return result
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
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.my-posts-list {
  padding: 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: 0;
  animation: fadeIn 0.2s ease-in forwards;
  animation-delay: 0.3s;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.active-posts-header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: white;
  border: 1px solid $color-gray--light;
  color: $colour-success;
  font-weight: 500;
  font-size: 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.old-posts-toggle {
  margin-bottom: 12px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 16px;
  background: white;
  border: 1px solid $color-gray--light;
  color: $color-gray--dark;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  &:hover {
    background: $color-gray--lighter;
    border-color: $color-gray--base;
  }
}

.collections-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid $color-blue--bright;
}

.collections-title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: $color-gray--darker;
  margin: 0 0 12px 0;
}

.collection-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid $color-gray--lighter;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.collection-icon {
  color: $color-blue--bright;
  font-size: 1rem;
  margin-top: 2px;
}

.collection-info {
  flex: 1;
}

.collection-date {
  display: block;
  font-weight: 600;
  color: $color-black;
  margin-bottom: 2px;
}

.collection-details {
  font-size: 0.9rem;
  color: $color-gray--dark;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.loading-placeholder {
  background: white;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-placeholder::before {
  content: '';
  display: block;
  width: 100%;
  padding-bottom: 50%;
  background: $color-gray--light;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 3rem;
  color: $color-gray--base;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 1.1rem;
  color: $color-gray--dark;
  margin-bottom: 20px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.mobile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  &--give {
    background: $colour-success;
    color: $color-white;

    &:hover {
      background: darken($colour-success, 5%);
      color: $color-white;
    }
  }

  &--find {
    background: $colour-secondary;
    color: $color-white;

    &:hover {
      background: darken($colour-secondary, 5%);
      color: $color-white;
    }
  }
}

.minheight {
  min-height: 200px;
}
</style>
