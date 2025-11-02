<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0 mt-1" offset-lg="3">
          <div>
            <h1>Volunteer Opportunities</h1>
            <GlobalMessage />
            <p>
              Are you a charity or good cause that needs volunteers? Ask our
              lovely community of freeglers to help.
            </p>
            <div class="d-flex justify-content-between mb-3">
              <GroupSelect
                v-if="me"
                v-model="groupid"
                class="pr-2"
                all
                :value="groupid"
                @update:model-value="changeGroup"
              />
              <b-button v-if="me" variant="primary" @click="openVolunteerModal">
                <v-icon icon="plus" /> Add an opportunity
              </b-button>
              <NoticeMessage v-else variant="info">
                Please sign in and join a community to add an event.
              </NoticeMessage>
            </div>
          </div>
          <h2 class="visually-hidden">List of volunteer opportunities</h2>
          <div v-if="allOfEm?.length">
            <div
              v-for="id in volunteerings"
              :key="'volunteering-' + id"
              class="mt-2"
            >
              <VolunteerOpportunity
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
            <NoticeMessage>No opportunities at the moment.</NoticeMessage>
          </div>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
      <VolunteerOpportunityModal
        v-if="showVolunteerModal"
        :start-edit="true"
        @hidden="showVolunteerModal = false"
      />
    </div>
  </client-only>
</template>
<script setup>
import { defineAsyncComponent } from 'vue'
import { buildHead } from '~/composables/useBuildHead'
import { useVolunteeringStore } from '~/stores/volunteering'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import GlobalMessage from '~/components/GlobalMessage'
import { ref, computed, useRoute, useRouter } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
import GroupSelect from '~/components/GroupSelect'
import VolunteerOpportunity from '~/components/VolunteerOpportunity.vue'
const VolunteerOpportunityModal = defineAsyncComponent(() =>
  import('~/components/VolunteerOpportunityModal')
)

const runtimeConfig = useRuntimeConfig()
const volunteeringStore = useVolunteeringStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const route = useRoute()
const groupid = ref(parseInt(route.params.groupid))

let name
let image

if (groupid.value) {
  const group = await groupStore.fetch(groupid.value)
  name = 'Volunteer Opportunities for ' + group.namedisplay
  image = group?.profile

  await volunteeringStore.fetchGroup(groupid.value)
} else {
  groupid.value = 0

  if (authStore.user) {
    // We are logged in, so we can fetch the ops for our groups.
    await volunteeringStore.fetchList()
  }

  name = 'Volunteer Opportunities'
  image = null
}

useHead(
  buildHead(
    route,
    runtimeConfig,
    name,
    'Are you a charity or good cause that needs volunteers? Ask our lovely community of freeglers to help.',
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
    return volunteeringStore.forGroup
  } else {
    return volunteeringStore.forUser
  }
})

watch(
  allOfEm,
  (newVal) => {
    if (newVal?.length && !groupid.value) {
      // Save the max op we have seen.
      const max = newVal.reduce((a, b) => Math.max(a, b), -Infinity)

      const authStore = useAuthStore()
      const me = useAuthStore().user
      const settings = me?.settings || {}

      settings.lastVolunteerOpportunity = max
      authStore.saveAndGet({
        settings,
      })
    }
  },
  { immediate: true }
)

const volunteerings = computed(() => {
  return allOfEm.value.slice(0, toShow.value)
})

const changeGroup = function (newval) {
  const router = useRouter()
  router.push(newval ? '/volunteerings/' + newval : '/volunteerings')
}
const loadMore = function ($state) {
  if (toShow.value < allOfEm.value.length) {
    toShow.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}

const showVolunteerModal = ref(false)

function openVolunteerModal() {
  showVolunteerModal.value = true
}
</script>
