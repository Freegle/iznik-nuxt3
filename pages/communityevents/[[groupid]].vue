<template>
  <client-only>
    <div class="events-page">
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <div class="page-header">
            <div class="header-content">
              <h1 class="page-title">
                <v-icon icon="calendar-alt" class="title-icon" />
                Community Events
              </h1>
              <p class="page-description">
                Local events posted by freeglers like you.
              </p>
            </div>
            <GlobalMessage />
            <div class="filter-actions">
              <GroupSelect
                v-if="me"
                v-model="groupid"
                all
                :value="groupid"
                class="group-filter"
                @update:model-value="changeGroup"
              />
              <b-button
                v-if="me"
                variant="primary"
                size="sm"
                class="add-btn"
                @click="openEventModal"
              >
                <v-icon icon="plus" /> Add event
              </b-button>
              <NoticeMessage v-else variant="info" class="sign-in-notice">
                Please sign in and join a community to add an event.
              </NoticeMessage>
            </div>
          </div>
          <h2 class="visually-hidden">List of community events</h2>
          <div v-if="allOfEm?.length" class="events-list">
            <div v-for="id in events" :key="'event-' + id" class="event-item">
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
          <div v-else class="empty-state">
            <v-icon icon="calendar-times" class="empty-icon" />
            <p>No events at the moment.</p>
            <b-button
              v-if="me"
              variant="primary"
              size="sm"
              @click="openEventModal"
            >
              <v-icon icon="plus" /> Add the first event
            </b-button>
          </div>
        </b-col>
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

const me = computed(() => authStore.user)

function openEventModal() {
  showEventModal.value = true
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.events-page {
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

.header-content {
  margin-bottom: 0.75rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .title-icon {
    color: $color-blue--base;
  }
}

.page-description {
  font-size: 0.9rem;
  color: $color-gray--dark;
  margin: 0;
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

  .sign-in-notice {
    width: 100%;
  }
}

.events-list {
  padding: 0 0.5rem;
}

.event-item {
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
