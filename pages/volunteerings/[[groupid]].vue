<template>
  <client-only>
    <div class="volunteerings-page">
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <ScrollGrid
            :items="allOfEm"
            key-field="id"
            empty-icon="hand-holding-heart"
            empty-text="No opportunities at the moment."
          >
            <template #header>
              <div class="page-header">
                <p class="page-description">
                  Are you a charity or good cause? Ask our lovely freeglers to
                  help.
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
            </template>

            <template #item="{ item: id }">
              <VolunteerOpportunity
                :id="id"
                :filter-group="groupid"
                :summary="false"
              />
            </template>

            <template #empty>
              <v-icon
                icon="hand-holding-heart"
                class="scroll-grid__empty-icon"
              />
              <p>No opportunities at the moment.</p>
              <b-button
                v-if="me"
                variant="primary"
                size="sm"
                @click="openVolunteerModal"
              >
                <v-icon icon="plus" /> Add the first opportunity
              </b-button>
            </template>

            <template #footer>
              <VolunteerOpportunityModal
                v-if="showVolunteerModal"
                :start-edit="true"
                @hidden="showVolunteerModal = false"
              />
            </template>
          </ScrollGrid>
        </b-col>
      </b-row>
    </div>
  </client-only>
</template>
<script setup>
import { defineAsyncComponent } from 'vue'
import { buildHead } from '~/composables/useBuildHead'
import { useVolunteeringStore } from '~/stores/volunteering'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'
import GlobalMessage from '~/components/GlobalMessage'
import NoticeMessage from '~/components/NoticeMessage'
import { ref, computed, useRoute, useRouter } from '#imports'
import GroupSelect from '~/components/GroupSelect'
import VolunteerOpportunity from '~/components/VolunteerOpportunity.vue'
import ScrollGrid from '~/components/ScrollGrid'
const VolunteerOpportunityModal = defineAsyncComponent(() =>
  import('~/components/VolunteerOpportunityModal')
)

const runtimeConfig = useRuntimeConfig()
const volunteeringStore = useVolunteeringStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()
const { me } = useMe()

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

      const settings = me.value?.settings || {}

      settings.lastVolunteerOpportunity = max
      authStore.saveAndGet({
        settings,
      })
    }
  },
  { immediate: true }
)

const changeGroup = function (newval) {
  const router = useRouter()
  router.push(newval ? '/volunteerings/' + newval : '/volunteerings')
}

const showVolunteerModal = ref(false)

function openVolunteerModal() {
  showVolunteerModal.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';
@import 'assets/css/navbar.scss';

.volunteerings-page {
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
