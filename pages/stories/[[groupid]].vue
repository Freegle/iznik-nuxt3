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
                  :value="groupid"
                  class="float-left"
                  all
                  :restrict="false"
                  @update:modelValue="changeGroup"
                />
              </b-col>
              <b-col>
                <b-button
                  variant="primary"
                  class="float-right"
                  @click="showAddModal"
                >
                  <v-icon icon="book-open" /> Tell us your story!
                </b-button>
              </b-col>
            </b-row>
          </div>
          <div
            v-for="story in sortedStories"
            :key="'story-' + story.id"
            class="mt-2"
          >
            <StoryOne :id="story.id" />
          </div>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
      <StoryAddModal ref="addmodal" />
    </div>
  </client-only>
</template>
<script setup>
import { useStoryStore } from '../../stores/stories'
import { buildHead } from '../../composables/useBuildHead'
import { useGroupStore } from '../../stores/group'
import GroupSelect from '~/components/GroupSelect'
import StoryOne from '~/components/StoryOne'
import StoryAddModal from '~/components/StoryAddModal'
import { ref, computed, useRoute, useRouter } from '#imports'

const LIMIT = 20

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const storyStore = useStoryStore()
const groupStore = useGroupStore()

const groupid = parseInt(route.params.groupid) || 0
const limit = parseInt(route.query.limit) || LIMIT

const stories = await storyStore.fetchByGroup(groupid, limit)
const group = await groupStore.fetch(groupid)

const groupname = computed(() => {
  if (groupid?.value) {
    const group = groupStore.get(groupid.value)
    return group?.namedisplay
  }

  return 'Freegle'
})

useHead(
  buildHead(
    route,
    runtimeConfig,
    group?.namedisplay
      ? 'Stories for ' + group?.namedisplay
      : 'Stories from freeglers',
    'Real stories from real freeglers.'
  )
)

const sortedStories = computed(() => {
  if (stories?.length) {
    const stories2 = stories
    return stories2.sort(function (a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }

  return []
})

const addmodal = ref(null)

const showAddModal = function () {
  addmodal.show()
}

const changeGroup = function (newval) {
  storyStore.list = {}
  const router = useRouter()
  router.push(newval ? '/stories/' + newval : '/stories')
}
</script>
