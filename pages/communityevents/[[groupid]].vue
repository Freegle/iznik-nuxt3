<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0 mt-1" offset-lg="3">
          <div>
            <h1>Community Events</h1>
            <GlobalWarning />
            <p>These are local events, posted by other freeglers like you.</p>
            <div class="d-flex justify-content-between mb-3">
              <GroupSelect
                v-if="me"
                v-model="groupid"
                class="pr-2"
                all
                :value="groupid"
                @update:model-value="changeGroup"
              />
              <b-button
                variant="primary"
                class="float-right"
                @click="openEventModal"
              >
                <v-icon icon="plus" /> Add a community event
              </b-button>
            </div>
          </div>
          <h2 class="visually-hidden">List of community events</h2>
          <div v-if="forUser?.length">
            <div v-for="id in events" :key="'event-' + id" class="mt-2">
              <CommunityEvent
                :id="id"
                :filter-group="groupid"
                :summary="false"
              />
            </div>
            <infinite-loading
              :key="'infinite-' + groupid"
              :identifier="infiniteId"
              force-use-infinite-wrapper="body"
              :distance="1000"
              @infinite="loadMore"
            />
          </div>
          <div v-else>
            <NoticeMessage>No events at the moment.</NoticeMessage>
          </div>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
      <CommunityEventModal
        v-if="showEventModal"
        ref="eventmodal"
        :start-edit="true"
      />
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '../../composables/useBuildHead'
import { useCommunityEventStore } from '../../stores/communityevent'
import { useGroupStore } from '../../stores/group'
import { useAuthStore } from '../../stores/auth'
import NoticeMessage from '../../components/NoticeMessage'
import { waitForRef } from '~/composables/useWaitForRef'
import GlobalWarning from '~/components/GlobalWarning'
import { ref, computed, useRouter } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
import CommunityEventModal from '~/components/CommunityEventModal'
import GroupSelect from '~/components/GroupSelect'
import CommunityEvent from '~/components/CommunityEvent.vue'

const runtimeConfig = useRuntimeConfig()
const communityEventStore = useCommunityEventStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const route = useRoute()
const groupid = parseInt(route.params.groupid)

let name
let image

if (groupid) {
  const group = await groupStore.fetch(groupid)
  name = 'Community Events for ' + group.namedisplay
  image = group?.profile
} else {
  if (authStore.user) {
    // We are logged in, so we can fetch the events for our groups.
    await communityEventStore.fetchList()
  }

  name = 'Community Events'
  image = null
}

useHead(
  buildHead(
    route,
    runtimeConfig,
    name,
    'These are local events, posted by other freeglers like you.',
    image,
    {
      class: 'overflow-y-scroll',
    }
  )
)

const toShow = ref(0)
const infiniteId = ref(new Date().toString())

const forUser = computed(() => {
  return communityEventStore.forUser
})

const events = computed(() => {
  return forUser.value.slice(0, toShow.value)
})

const changeGroup = function (newval) {
  const router = useRouter()
  router.push(newval ? '/communityevents/' + newval : '/communityevents')
}
const loadMore = function ($state) {
  if (toShow.value < forUser.value.length) {
    toShow.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}

const eventmodal = ref(null)
const showEventModal = ref(false)

const openEventModal = async () => {
  showEventModal.value = true
  await waitForRef(eventmodal)
  eventmodal.value.show()
}
</script>
