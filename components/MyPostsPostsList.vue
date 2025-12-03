<template>
  <div class="my-posts-list">
    <!-- Old posts toggle button -->
    <div v-if="oldPosts.length > 0" class="old-posts-toggle">
      <button class="toggle-btn" @click="toggleShowOldPosts">
        <v-icon :icon="showOldPosts ? 'eye-slash' : 'eye'" class="me-2" />
        {{ showOldPosts ? 'Hide' : 'Show' }} {{ formattedOldPostsCount }}
      </button>
    </div>

    <!-- Upcoming collections -->
    <div v-if="upcomingTrysts.length > 0" class="collections-card">
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

    <!-- Posts list -->
    <div v-if="visiblePosts.length > 0" class="posts-container">
      <div v-for="post in visiblePosts" :key="'post-' + post.id">
        <!-- Mobile view -->
        <VisibleWhen :at="['xs', 'sm', 'md']">
          <Suspense>
            <MyMessageMobile
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
        </VisibleWhen>
        <!-- Desktop view -->
        <VisibleWhen :at="['lg', 'xl', 'xxl']">
          <Suspense>
            <MyMessage
              :id="post.id"
              :show-old="showOldPosts"
              :expand="defaultExpanded"
              class="minheight"
            />
            <template #fallback>
              <div class="loading-placeholder">
                <b-img lazy src="/loader.gif" alt="Loading" width="80px" />
              </div>
            </template>
          </Suspense>
        </VisibleWhen>
      </div>
      <div v-if="loading" class="loading-more">
        <b-img lazy src="/loader.gif" alt="Loading..." width="60px" />
      </div>
      <InfiniteLoading
        :distance="scrollboxHeight"
        @infinite="(event) => emit('load-more', event)"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <v-icon icon="folder-open" />
      </div>
      <p class="empty-text">You have no active posts.</p>
      <div class="empty-actions">
        <template v-if="props.type === 'Offer'">
          <nuxt-link to="/give" class="action-link action-link--primary">
            <v-icon icon="gift" class="me-2" />OFFER something
          </nuxt-link>
        </template>
        <template v-else-if="props.type === 'Wanted'">
          <nuxt-link to="/find" class="action-link action-link--primary">
            <v-icon icon="search" class="me-2" />Ask for something
          </nuxt-link>
        </template>
        <template v-else>
          <nuxt-link to="/give" class="action-link action-link--offer">
            <v-icon icon="gift" class="me-2" />OFFER
          </nuxt-link>
          <nuxt-link to="/find" class="action-link action-link--wanted">
            <v-icon icon="search" class="me-2" />WANTED
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
import MyMessageMobile from '~/components/MyMessageMobile.vue'
import InfiniteLoading from '~/components/InfiniteLoading.vue'
import VisibleWhen from '~/components/VisibleWhen'
import { useMessageStore } from '~/stores/message'
import { useUserStore } from '~/stores/user'
import { useTrystStore } from '~/stores/tryst'

const messageStore = useMessageStore()
const userStore = useUserStore()
const trystStore = useTrystStore()

const props = defineProps({
  posts: { type: Array, required: true },
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

const activePosts = computed(() => {
  const result = posts.value.filter((post) => !post.hasoutcome)
  console.log('DEBUG: activePosts computed', {
    allPostsLength: posts.value.length,
    activePostsLength: result.length,
    oldPostsLength: posts.value.filter((post) => post.hasoutcome).length,
  })
  return result
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

.old-posts-toggle {
  padding: 8px 12px;
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
  border-radius: 8px;
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
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: $color-gray--lighter;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  svg {
    font-size: 2rem;
    color: $color-gray--base;
  }
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

.action-link {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s;

  &--primary {
    background: $color-green-background;
    color: white;

    &:hover {
      background: darken($color-green-background, 10%);
      color: white;
    }
  }

  &--offer {
    background: $color-green-background;
    color: white;

    &:hover {
      background: darken($color-green-background, 10%);
      color: white;
    }
  }

  &--wanted {
    background: $color-blue--bright;
    color: white;

    &:hover {
      background: darken($color-blue--bright, 10%);
      color: white;
    }
  }
}

.minheight {
  min-height: 200px;
}
</style>
