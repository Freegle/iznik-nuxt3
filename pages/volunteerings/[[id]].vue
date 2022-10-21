<template>
  <div>
    <b-row class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <div>
          <h1>Volunteer Opportunities</h1>
          <GlobalWarning />
          <p>
            Are you a charity or good cause that needs volunteers? Ask our
            lovely community of freeglers to help.
          </p>
          <div class="d-flex justify-content-between mb-3">
            <groupSelect v-if="me" v-model="groupid" class="pr-2" all />
            <b-button
              variant="primary"
              class="float-right"
              @click="showEventModal"
            >
              <v-icon icon="plus" /> Add an opportunity
            </b-button>
          </div>
        </div>
        <h2 class="sr-only">List of volunteer opportunities</h2>
        <div
          v-for="volunteering in volunteerings"
          :key="'volunteering-' + volunteering.id"
          class="mt-2"
        >
          <VolunteerOpportunity
            v-if="!volunteering.pending"
            :summary="false"
            :item="volunteering"
          />
        </div>
        <client-only>
          <infinite-loading
            :key="'infinite-' + groupid"
            :identifier="infiniteId"
            force-use-infinite-wrapper="body"
            @infinite="loadMore"
          >
            <span slot="no-results">
              <notice-message v-if="!volunteerings || !volunteerings.length">
                There are no volunteer opportunities to show. Why not add one?
              </notice-message>
            </span>
            <span slot="no-more" />
            <span slot="spinner">
              <b-img lazy src="~/static/loader.gif" alt="Loading" />
            </span>
          </infinite-loading>
        </client-only>
      </b-col>
      <b-col cols="0" md="3" class="d-none d-md-block" />
    </b-row>
    <VolunteerOpportunityModal ref="volunteermodal" :start-edit="true" />
  </div>
</template>
<script>
// TODO Volunteering - check all routes after retiring createGroupRoute
// TODO This page not tested
import { useRoute } from 'vue-router'
import GlobalWarning from '../../components/GlobalWarning'
import { buildHead } from '../../composables/useBuildHead'
import { useVolunteeringStore } from '../../stores/volunteering'
import { useGroupStore } from '../../stores/group'
import InfiniteLoading from '~/components/InfiniteLoading'
const GroupSelect = () => import('~/components/GroupSelect')
const VolunteerOpportunity = () =>
  import('~/components/VolunteerOpportunity.vue')
const VolunteerOpportunityModal = () =>
  import('~/components/VolunteerOpportunityModal')
const NoticeMessage = () => import('~/components/NoticeMessage')

export default {
  components: {
    GlobalWarning,
    InfiniteLoading,
    GroupSelect,
    VolunteerOpportunity,
    VolunteerOpportunityModal,
    NoticeMessage,
  },
  mixins: [buildHead],
  async setup() {
    const volunteeringStore = useVolunteeringStore()
    const groupStore = useGroupStore()

    const route = useRoute()
    const groupid = route.params.groupid

    await volunteeringStore.fetchList()

    let name
    let image

    if (groupid) {
      const group = await groupStore.fetch()

      name = 'Volunteer Opportunities for ' + group.namedisplay
      image = group.profile
    } else {
      name = 'Volunteer Opportunities'
      image = null
    }

    buildHead(
      name,
      'Are you a charity or good cause that needs volunteers? Ask our lovely community of freeglers to help.',
      image
    )

    return {
      volunteeringStore,
      groupStore,
      groupid,
    }
  },
  data() {
    return {
      context: null,
      infiniteId: +new Date(),
      complete: false,
    }
  },
  computed: {
    volunteerings() {
      return this.volunteeringStore.sortedList.filter(
        (v) => !this.groupid || v.groupid === this.groupid
      )
    },
  },
  methods: {
    async loadMore($state) {
      let volunteerings = this.$store.getters['volunteerops/list']
      const currentCount =
        volunteerings && volunteerings.length ? volunteerings.length : 0

      this.context = this.$store.getters['volunteerops/getContext']

      await this.$store.dispatch('volunteerops/fetch', {
        groupid: this.groupid ? this.groupid : null,
        context: this.context,
      })

      volunteerings = this.$store.getters['volunteerops/list']

      const newCount =
        volunteerings && volunteerings.length ? volunteerings.length : 0
      if (currentCount === newCount) {
        this.complete = true
        $state.complete()
      } else {
        $state.loaded()
      }
    },

    showEventModal() {
      if (this.me) {
        this.$refs.volunteermodal.show()
      } else {
        this.$store.dispatch('auth/forceLogin', true)
      }
    },
  },
}
</script>
