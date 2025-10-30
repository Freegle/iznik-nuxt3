<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0 mt-1" offset-lg="3">
          <div>
            <h1>Community Events</h1>
            <GlobalMessage />
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
              <b-button v-if="me" variant="primary" @click="openEventModal">
                <v-icon icon="plus" /> Add a community event
              </b-button>
              <NoticeMessage v-else variant="info">
                Please sign in and join a community to add an event.
              </NoticeMessage>
            </div>
          </div>
          <h2 class="visually-hidden">List of community events</h2>
          <div v-if="allOfEm?.length">
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
            <NoticeMessage variant="warning"
              >No events at the moment.</NoticeMessage
            >
          </div>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
      <CommunityEventModal
        v-if="showEventModal"
        :start-edit="true"
        @hidden="showEventModal = false"
      />
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import NoticeMessage from '~/components/NoticeMessage'
import GlobalMessage from '~/components/GlobalMessage'
import { ref, computed, useRouter } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
import GroupSelect from '~/components/GroupSelect'
import CommunityEvent from '~/components/CommunityEvent.vue'
const CommunityEventModal = defineAsyncComponent(() =>
  import('~/components/CommunityEventModal')
)

const runtimeConfig = useRuntimeConfig()
const communityEventStore = useCommunityEventStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const route = useRoute()
const groupid = ref(parseInt(route.params.groupid))

let name
let image

if (groupid.value) {
  const group = await groupStore.fetch(groupid.value)
  name = 'Community Events for ' + group.namedisplay
  image = group?.profile

  await communityEventStore.fetchGroup(groupid.value)
} else {
  groupid.value = 0

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

const allOfEm = computed(() => {
  if (groupid.value) {
    return communityEventStore.forGroup
  } else {
    return communityEventStore.forUser
  }
})

watch(
  allOfEm,
  (newVal) => {
    if (newVal?.length && !groupid.value) {
      // Save the max event we have seen.
      const max = newVal.reduce((a, b) => Math.max(a, b), -Infinity)

      const authStore = useAuthStore()
      const me = useAuthStore().user
      const settings = me?.settings || {}

      settings.lastCommunityEvent = max
      authStore.saveAndGet({
        settings,
      })
    }
  },
  { immediate: true }
)

const events = computed(() => {
  return allOfEm.value.slice(0, toShow.value)
})

const changeGroup = function (newval) {
  const router = useRouter()
  router.push(newval ? '/communityevents/' + newval : '/communityevents')
}
const loadMore = function ($state) {
  if (toShow.value < allOfEm.value.length) {
    toShow.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}

const showEventModal = ref(false)

function openEventModal() {
  showEventModal.value = true
}
</script>
