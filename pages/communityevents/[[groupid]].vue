<template>
  <client-only>
    <div class="events-page">
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <ScrollGrid
            :items="allOfEm"
            key-field="id"
            empty-icon="calendar-times"
            empty-text="No events at the moment."
          >
            <template #header>
              <div class="page-header">
                <p class="page-description">
                  Local events posted by freeglers like you.
                </p>
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
            </template>

            <template #item="{ item: id }">
              <CommunityEvent
                :id="id"
                :filter-group="groupid"
                :summary="false"
              />
            </template>

            <template #empty>
              <v-icon icon="calendar-times" class="scroll-grid__empty-icon" />
              <p>No events at the moment.</p>
              <b-button
                v-if="me"
                variant="primary"
                size="sm"
                @click="openEventModal"
              >
                <v-icon icon="plus" /> Add the first event
              </b-button>
            </template>

            <template #footer>
              <CommunityEventModal
                v-if="showEventModal"
                :start-edit="true"
                @hidden="showEventModal = false"
              />
            </template>
          </ScrollGrid>
        </b-col>
      </b-row>
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
import GroupSelect from '~/components/GroupSelect'
import CommunityEvent from '~/components/CommunityEvent.vue'
import ScrollGrid from '~/components/ScrollGrid'

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

const changeGroup = function (newval) {
  const router = useRouter()
  router.push(newval ? '/communityevents/' + newval : '/communityevents')
}

const showEventModal = ref(false)

const me = computed(() => authStore.user)

function openEventModal() {
  showEventModal.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';
@import 'assets/css/navbar.scss';

.events-page {
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

  .sign-in-notice {
    width: 100%;
  }
}
</style>
