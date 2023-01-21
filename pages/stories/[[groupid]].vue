<template>
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
            We love to hear why you freegle and what your experiences have been
            - and it helps show new freeglers what it's all about.
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
</template>
<script>
import { useRoute } from 'vue-router'
import { useStoryStore } from '../../stores/stories'
import { buildHead } from '../../composables/useBuildHead'
import { useGroupStore } from '../../stores/group'
import StoryOne from '../../components/StoryOne'

const GroupSelect = () => import('~/components/GroupSelect')
const StoryAddModal = () => import('~/components/StoryAddModal')

const LIMIT = 20

export default {
  components: {
    GroupSelect,
    StoryAddModal,
    StoryOne,
  },
  async setup(props) {
    const route = useRoute()
    const storyStore = useStoryStore()
    const groupStore = useGroupStore()

    const groupid = route.params.groupid ? parseInt(route.params.groupid) : null
    console.log('Stories', groupid)
    const limit = parseInt(route.query.limit) || LIMIT

    const stories = await storyStore.fetchByGroup(groupid, limit)
    const group = await groupStore.fetch(groupid)

    useHead(
      buildHead(
        route,
        group?.namedisplay
          ? 'Stories for ' + group?.namedisplay
          : 'Stories from freeglers',
        'Real stories from real freeglers.'
      )
    )

    return {
      storyStore,
      groupStore,
      groupid,
      group,
      groupname: group?.namedisplay,
      stories,
    }
  },
  computed: {
    sortedStories() {
      if (this.stories?.length) {
        const stories = this.stories
        return stories.sort(function (a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      }

      return []
    },
  },
  methods: {
    showAddModal() {
      this.$refs.addmodal.show()
    },
    changeGroup(newval) {
      console.log('Change group to', newval)
      this.storyStore.list = {}
      this.$router.push(newval ? '/stories/' + newval : '/stories')
    },
  },
}
</script>
