<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <div class="bg-white p-4">
            <h1>
              Stories from Freeglers<span v-if="groupname">
                on {{ groupname }}</span
              >
            </h1>
            <p>
              We love to hear why you freegle and what your experiences have
              been - and it helps show new freeglers what it's all about.
            </p>
            <p>So please tell us your story!</p>
            <b-row>
              <b-col>
                <GroupSelect
                  v-if="loggedIn"
                  v-model="groupid"
                  all
                  :restrict="false"
                  @update:model-value="changeGroup"
                />
              </b-col>
              <b-col>
                <b-button variant="primary" @click="showAddModal">
                  <v-icon icon="book-open" /> Tell us your story!
                </b-button>
              </b-col>
            </b-row>
          </div>
          <div
            v-for="story in storiesToShow"
            :key="'story-' + story"
            class="mt-2"
          >
            <StoryOne :id="story" :group-id="groupid" />
          </div>
          <infinite-loading
            :key="'infinite-' + groupid"
            force-use-infinite-wrapper="body"
            :distance="1000"
            @infinite="loadMore"
          />
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
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
import GroupSelect from '~/components/GroupSelect'
import StoryOne from '~/components/StoryOne'
import { useRoute } from '#imports'

const StoryAddModal = defineAsyncComponent(() =>
  import('~/components/StoryAddModal')
)

const LIMIT = 100

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const storyStore = useStoryStore()
const groupStore = useGroupStore()

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
