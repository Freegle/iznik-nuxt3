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
                @update:modelValue="changeGroup"
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
<script>
import { mapWritableState } from 'pinia'
import GlobalWarning from '../../components/GlobalWarning'
import { buildHead } from '../../composables/useBuildHead'
import { useVolunteeringStore } from '../../stores/volunteering'
import { useGroupStore } from '../../stores/group'
import { useAuthStore } from '../../stores/auth'
import { useRoute, useRouter } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
const GroupSelect = () => import('~/components/GroupSelect')
const VolunteerOpportunity = () =>
  import('~/components/VolunteerOpportunity.vue')
const VolunteerOpportunityModal = () =>
  import('~/components/VolunteerOpportunityModal')

export default {
  components: {
    GlobalWarning,
    InfiniteLoading,
    GroupSelect,
    VolunteerOpportunity,
    VolunteerOpportunityModal,
  },
  mixins: [buildHead],
  async setup() {
    const volunteeringStore = useVolunteeringStore()
    const groupStore = useGroupStore()

    const route = useRoute()
    const groupid = parseInt(route.params.groupid)

    await volunteeringStore.fetchList()

    let name
    let image

    if (groupid) {
      const group = await groupStore.fetch(groupid)

      name = 'Volunteer Opportunities for ' + group.namedisplay
      image = group?.profile
    } else {
      name = 'Volunteer Opportunities'
      image = null
    }

    useHead(
      buildHead(
        route,
        name,
        'Are you a charity or good cause that needs volunteers? Ask our lovely community of freeglers to help.',
        image,
        {
          class: 'overflow-y-scroll',
        }
      )
    )

    return {
      volunteeringStore,
      groupStore,
      groupid,
    }
  },
  data() {
    return {
      toShow: 0,
      infiniteId: +new Date(),
    }
  },
  computed: {
    ...mapWritableState(useAuthStore, ['forceLogin']),
    forUser() {
      return this.volunteeringStore.forUser
    },
    volunteerings() {
      return this.forUser.slice(0, this.toShow)
    },
  },
  methods: {
    changeGroup(newval) {
      const router = useRouter()
      router.push(newval ? '/volunteerings/' + newval : '/volunteerings')
    },
    loadMore($state) {
      if (this.toShow < this.forUser.length) {
        this.toShow++
        $state.loaded()
      } else {
        $state.complete()
      }
    },
    showVolunteerModal() {
      if (this.me) {
        this.$refs.volunteermodal.show()
      } else {
        this.forceLogin = true
      }
    },
  },
}
</script>
