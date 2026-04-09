<template>
  <div class="my-posts-list">
    <!-- Single toolbar row: counts + old-posts toggle + search -->
    <div v-if="!loading && posts.length > 0" class="posts-toolbar">
      <span v-if="activePosts.length > 0" class="toolbar-count">
        <v-icon icon="gift" class="me-1" />
        <span class="count-full">{{ formattedActivePostsCount }}</span>
        <span class="count-short">{{ activePosts.length }} active</span>
      </span>
      <button
        v-if="oldPosts.length > 0"
        class="toolbar-toggle"
        @click="toggleShowOldPosts"
      >
        <v-icon :icon="showOldPosts ? 'eye-slash' : 'eye'" class="me-1" />
        <span class="count-full"
          >{{ showOldPosts ? 'Hide' : 'Show' }}
          {{ formattedOldPostsCount }}</span
        >
        <span class="count-short">{{ oldPosts.length }} old</span>
      </button>
      <div class="toolbar-search">
        <v-icon icon="search" class="search-icon" />
        <input
          v-model="filterText"
          type="text"
          class="search-input"
          placeholder="Filter posts…"
        />
        <button v-if="filterText" class="search-clear" @click="filterText = ''">
          <v-icon icon="times" />
        </button>
      </div>
    </div>

    <!-- Upcoming collections -->
    <div v-if="!loading && upcomingTrysts.length > 0" class="collections-card">
      <h3 class="collections-title">
        <v-icon icon="calendar-check" class="me-2" />Your upcoming collections
      </h3>
      <div
        v-for="group in visibleCollectionGroups"
        :key="group.trystdate"
        class="collection-group"
      >
        <div class="collection-time">
          <v-icon icon="calendar-alt" class="collection-icon" />
          {{ group.trystdate }}
        </div>
        <div
          v-for="item in group.items"
          :key="'item-' + item.id"
          class="collection-item"
        >
          <em>{{ item.subject }}</em
          ><span class="collection-who"> — {{ item.name }}</span>
        </div>
      </div>
      <div
        v-if="upcomingTrysts.length > COLLECTIONS_INITIAL"
        class="collections-more"
      >
        <b-button
          variant="link"
          size="sm"
          class="p-0"
          @click="showAllCollections = !showAllCollections"
        >
          {{
            showAllCollections
              ? 'Show fewer'
              : `Show ${upcomingTrysts.length - COLLECTIONS_INITIAL} more`
          }}
        </b-button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <Spinner :size="30" />
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
              <Spinner :size="40" />
            </div>
          </template>
        </Suspense>
      </div>
      <InfiniteLoading
        :key="infiniteKey"
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
import { useAuthStore } from '~/stores/auth'

const messageStore = useMessageStore()
const userStore = useUserStore()
const trystStore = useTrystStore()
const authStore = useAuthStore()
const myid = computed(() => authStore.user?.id)

const props = defineProps({
  posts: { type: Array, required: true },
  postIds: { type: Array, required: false, default: () => [] },
  loading: { type: Boolean, required: true },
  defaultExpanded: { type: Boolean, required: true },
  show: { type: Number, required: true },
})

const emit = defineEmits(['load-more', 'toggle-old'])

const scrollboxHeight = ref(1000)

const showOldPosts = ref(false)
const filterText = ref('')
const infiniteKey = ref(0)

function toggleShowOldPosts() {
  showOldPosts.value = !showOldPosts.value
  infiniteKey.value++
  emit('toggle-old')
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

  const filter = filterText.value.trim().toLowerCase()
  if (filter) {
    visiblePostList = visiblePostList.filter((post) => {
      const msg = messageStore.byId(post.id)
      if (!msg) return true /* not loaded yet — keep visible */
      const subject = (msg.subject || '').toLowerCase()
      const body = (msg.textbody || msg.body || '').toLowerCase()
      return subject.includes(filter) || body.includes(filter)
    })
  }

  const sorted = visiblePostList.toSorted((a, b) => {
    /* promised items first, then by most recently */
    if (!showOldPosts.value && a.promised && !b.promised) {
      return -1
    } else if (!showOldPosts.value && b.promised && !a.promised) {
      return 1
    } else {
      return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
    }
  })

  /* Active posts are few — show all immediately.
     Only paginate when showing old posts (can be hundreds). */
  return showOldPosts.value ? sorted.slice(0, props.show) : sorted
})

const upcomingTrysts = computed(() => {
  const ret = []

  activePosts.value.forEach((post) => {
    const message = messageStore.byId(post.id)
    if (post.type === 'Offer' && message?.promises?.length) {
      message.promises.forEach((p) => {
        const user = userStore?.byId(p.userid)
        const isSomeone = p.userid === myid.value

        if (isSomeone || user) {
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
              name: isSomeone ? 'Someone' : user.displayname,
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

const COLLECTIONS_INITIAL = 3
const showAllCollections = ref(false)

/* Group sorted trysts by time label, then optionally slice to the first
   COLLECTIONS_INITIAL items (across all groups) for the collapsed view. */
const groupedCollections = computed(() => {
  const groups = []
  const seen = {}
  upcomingTrysts.value.forEach((t) => {
    if (!seen[t.trystdate]) {
      seen[t.trystdate] = { trystdate: t.trystdate, items: [] }
      groups.push(seen[t.trystdate])
    }
    seen[t.trystdate].items.push(t)
  })
  return groups
})

const visibleCollectionGroups = computed(() => {
  if (showAllCollections.value) return groupedCollections.value
  /* Slice to the first COLLECTIONS_INITIAL items across all groups */
  let remaining = COLLECTIONS_INITIAL
  const result = []
  for (const group of groupedCollections.value) {
    if (remaining <= 0) break
    const items = group.items.slice(0, remaining)
    result.push({ trystdate: group.trystdate, items })
    remaining -= items.length
  }
  return result
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
  box-shadow: var(--shadow-md);
  opacity: 0;
  animation: fadeIn 0.2s ease-in forwards;
  animation-delay: 0.3s;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.posts-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: white;
  border: 1px solid $color-gray--light;
  box-shadow: var(--shadow-sm);
}

.toolbar-count {
  color: $color-success;
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.toolbar-toggle {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: none;
  border: 1px solid $color-gray--light;
  color: var(--color-gray-600);
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 4px;

  &:hover {
    background: $color-gray--lighter;
    border-color: $color-gray--base;
  }
}

/* On wider screens show full text, hide short */
.count-short {
  display: none;
}

@media (max-width: 480px) {
  .count-full {
    display: none;
  }
  .count-short {
    display: inline;
  }
  .posts-toolbar {
    padding: 6px 8px;
    gap: 6px;
  }
  .toolbar-search {
    min-width: 0;
    flex: 1;
  }
}

.toolbar-search {
  display: flex;
  align-items: center;
  margin-left: auto;
  background: $color-gray--lighter;
  border: 1px solid $color-gray--light;
  border-radius: 20px;
  padding: 4px 10px;
  gap: 6px;
  flex: 1;
  min-width: 0;
  max-width: 260px;
}

.search-icon {
  color: $color-gray--base;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.search-input {
  border: none;
  background: none;
  outline: none;
  font-size: 0.85rem;
  width: 100%;
  color: $color-gray--darker;

  &::placeholder {
    color: $color-gray--base;
  }
}

.search-clear {
  background: none;
  border: none;
  padding: 0;
  color: $color-gray--base;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    color: $color-gray--normal;
  }
}

.collections-card {
  background: white;
  border-radius: var(--radius-lg, 0.75rem);
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-md);
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

.collection-group {
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.collection-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  color: $color-gray--darker;
  margin-bottom: 4px;
}

.collection-item {
  padding: 2px 0 2px 22px;
  font-size: 0.9rem;
  line-height: 1.4;
  border-bottom: none;
}

.collection-who {
  color: var(--color-gray-600);
}

.collections-more {
  margin-top: 8px;
  padding-top: 4px;
  border-top: 1px solid $color-gray--lighter;
}

.collection-icon {
  color: $color-blue--bright;
  font-size: 1rem;
  margin-top: 2px;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.loading-placeholder {
  background: white;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
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
  padding: 3rem 1.5rem;
  background: var(--color-gray-50);
  border-radius: var(--radius-lg, 0.75rem);
  border: 1px dashed var(--color-gray-300);
  max-width: 480px;
  margin: 1rem auto;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-400);
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
  color: var(--color-gray-600);
  margin-bottom: 1.25rem;
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
    background: $color-success;
    color: $color-white;

    &:hover {
      background: darken($color-success, 5%);
      color: $color-white;
    }
  }

  &--find {
    background: $color-secondary;
    color: $color-white;

    &:hover {
      background: darken($color-secondary, 5%);
      color: $color-white;
    }
  }
}

.minheight {
  min-height: 200px;
}
</style>
