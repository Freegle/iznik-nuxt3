<template>
  <client-only>
    <div class="stories-page">
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <div class="page-header">
            <p class="page-description">
              We love to hear why you freegle and what your experiences have
              been - and it helps show new freeglers what it's all about. So
              please tell us your story!
            </p>
            <div class="filter-actions">
              <GroupSelect
                v-if="loggedIn"
                v-model="groupid"
                all
                :restrict="false"
                class="group-filter"
                @update:model-value="changeGroup"
              />
              <b-button
                variant="primary"
                size="sm"
                class="add-btn"
                @click="showAddModal"
              >
                <v-icon icon="book-open" /> Tell us your story!
              </b-button>
            </div>
          </div>
          <h2 class="visually-hidden">List of stories</h2>
          <div v-if="stories?.length" class="stories-list">
            <div
              v-for="story in storiesToShow"
              :key="'story-' + story"
              class="story-item"
            >
              <StoryOne :id="story" :group-id="groupid" />
            </div>
            <infinite-loading
              :key="'infinite-' + groupid"
              force-use-infinite-wrapper="body"
              :distance="1000"
              @infinite="loadMore"
            />
          </div>
          <div v-else class="empty-state">
            <v-icon icon="book-open" class="empty-icon" />
            <p>No stories yet.</p>
            <b-button variant="primary" size="sm" @click="showAddModal">
              <v-icon icon="book-open" /> Be the first to share your story!
            </b-button>
          </div>
        </b-col>
      </b-row>
      <StoryAddModal
        v-if="showStoryAddModal"
        @hidden="showStoryAddModal = false"
      />
    </div>
  </client-only>
</template>
<script setup>
import { useStoryStore } from '~/stores/stories'
import { buildHead } from '~/composables/useBuildHead'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import GroupSelect from '~/components/GroupSelect'
import StoryOne from '~/components/StoryOne'
import { useRoute, computed } from '#imports'

const StoryAddModal = defineAsyncComponent(() =>
  import('~/components/StoryAddModal')
)

const LIMIT = 100

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const storyStore = useStoryStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const loggedIn = computed(() => authStore.user !== null)

const groupid = ref(parseInt(route.params.groupid) || 0)
const limit = parseInt(route.query.limit) || LIMIT

const p = []

if (groupid.value) {
  p.push(groupStore.fetch(groupid.value))
  p.push(storyStore.fetchByGroup(groupid.value, limit))
} else {
  p.push(storyStore.fetchRecent(limit))
}

await Promise.all(p)

const group = computed(() => {
  return groupStore.get(groupid.value)
})

const groupname = computed(() => {
  if (group.value) {
    return group.value.namedisplay
  }

  return 'Freegle'
})

useHead(
  buildHead(
    route,
    runtimeConfig,
    groupname.value
      ? 'Stories for ' + groupname.value
      : 'Stories from freeglers',
    'Real stories from real freeglers.'
  )
)

const showStoryAddModal = ref(false)

const showAddModal = function () {
  showStoryAddModal.value = true
}

const stories = computed(() => {
  return storyStore.recent
})

const toShow = ref(1)

const storiesToShow = computed(() => {
  return stories.value.slice(0, toShow.value)
})

function loadMore(infiniteLoaderInstance) {
  toShow.value++

  if (toShow.value >= stories.value.length) {
    infiniteLoaderInstance.complete()
  } else {
    infiniteLoaderInstance.loaded()
  }
}

const changeGroup = function (newval) {
  storyStore.list = {}
  const router = useRouter()
  router.push(newval ? '/stories/' + newval : '/stories')
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.stories-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.page-header {
  background: white;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.page-description {
  font-size: 0.9rem;
  color: $color-gray--dark;
  margin: 0 0 0.75rem 0;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;

  .group-filter {
    flex: 1;
    min-width: 150px;
  }

  .add-btn {
    flex-shrink: 0;
  }
}

.stories-list {
  padding: 0 0.5rem;
}

.story-item {
  margin-bottom: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  margin: 0.5rem;

  .empty-icon {
    font-size: 3rem;
    color: $color-gray--dark;
    margin-bottom: 1rem;
  }

  p {
    color: $color-gray--dark;
    margin-bottom: 1rem;
  }
}
</style>
