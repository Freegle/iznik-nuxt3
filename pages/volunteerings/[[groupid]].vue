<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0 mt-1" offset-lg="3">
          <div>
            <h1>Volunteer Opportunities</h1>
            <GlobalWarning />
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
              <b-button
                variant="primary"
                class="float-right"
                @click="showVolunteerModal"
              >
                <v-icon icon="plus" /> Add an opportunity
              </b-button>
            </div>
          </div>
          <h2 class="sr-only">List of volunteer opportunities</h2>
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
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
      <VolunteerOpportunityModal ref="volunteermodal" :start-edit="true" />
    </div>
  </client-only>
</template>
<script setup>
import { buildHead } from '../../composables/useBuildHead'
import { useVolunteeringStore } from '../../stores/volunteering'
import { useGroupStore } from '../../stores/group'
import { useAuthStore } from '../../stores/auth'
import GlobalWarning from '~/components/GlobalWarning'
import { ref, computed, useRoute, useRouter } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
import VolunteerOpportunityModal from '~/components/VolunteerOpportunityModal'
import GroupSelect from '~/components/GroupSelect'
import VolunteerOpportunity from '~/components/VolunteerOpportunity.vue'

const runtimeConfig = useRuntimeConfig()
const volunteeringStore = useVolunteeringStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const route = useRoute()
const groupid = parseInt(route.params.groupid)

let name
let image

if (groupid) {
  const group = await groupStore.fetch(groupid)
  name = 'Volunteer Opportunities for ' + group.namedisplay
  image = group?.profile
} else {
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

const forUser = computed(() => {
  return volunteeringStore.forUser
})

const volunteerings = computed(() => {
  return forUser.value.slice(0, toShow.value)
})

const changeGroup = function (newval) {
  const router = useRouter()
  router.push(newval ? '/volunteerings/' + newval : '/volunteerings')
}
const loadMore = function ($state) {
  if (toShow.value < forUser.value.length) {
    toShow.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}

const volunteermodal = ref(null)

const showVolunteerModal = () => {
  volunteermodal.value.show()
}
</script>
