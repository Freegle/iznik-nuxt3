<template>
  <client-only>
    <div class="volunteerings-page">
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <div class="page-header">
            <p class="page-description">
              Are you a charity or good cause? Ask our lovely freeglers to help.
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
                @click="openVolunteerModal"
              >
                <v-icon icon="plus" /> Add opportunity
              </b-button>
              <NoticeMessage v-else variant="info" class="sign-in-notice">
                Please sign in and join a community to add an opportunity.
              </NoticeMessage>
            </div>
          </div>
          <h2 class="visually-hidden">List of volunteer opportunities</h2>
          <div v-if="allOfEm?.length" class="volunteerings-list">
            <div
              v-for="id in volunteerings"
              :key="'volunteering-' + id"
              class="volunteering-item"
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
          <div v-else class="empty-state">
            <v-icon icon="hand-holding-heart" class="empty-icon" />
            <p>No opportunities at the moment.</p>
            <b-button
              v-if="me"
              variant="primary"
              size="sm"
              @click="openVolunteerModal"
            >
              <v-icon icon="plus" /> Add the first opportunity
            </b-button>
          </div>
        </b-col>
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
import NoticeMessage from '~/components/NoticeMessage'
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

const me = computed(() => authStore.user)

function openVolunteerModal() {
  showVolunteerModal.value = true
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.volunteerings-page {
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

.volunteerings-list {
  padding: 0 0.5rem;
}

.volunteering-item {
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
