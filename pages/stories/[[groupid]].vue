<template>
  <client-only>
    <div class="stories-page">
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <ScrollGrid
            :items="stories"
            key-field="id"
            empty-icon="book-open"
            empty-text="No stories yet."
          >
            <template #header>
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
            </template>

            <template #item="{ item: id }">
              <StoryOne :id="id" :group-id="groupid" />
            </template>

            <template #empty>
              <v-icon icon="book-open" class="scroll-grid__empty-icon" />
              <p>No stories yet.</p>
              <b-button variant="primary" size="sm" @click="showAddModal">
                <v-icon icon="book-open" /> Be the first to share your story!
              </b-button>
            </template>

            <template #footer>
              <StoryAddModal
                v-if="showStoryAddModal"
                @hidden="showStoryAddModal = false"
              />
            </template>
          </ScrollGrid>
        </b-col>
      </b-row>
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
import ScrollGrid from '~/components/ScrollGrid'
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

const changeGroup = function (newval) {
  storyStore.list = {}
  const router = useRouter()
  router.push(newval ? '/stories/' + newval : '/stories')
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';
@import 'assets/css/navbar.scss';

.stories-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding-bottom: $page-bottom-padding;
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
</style>
