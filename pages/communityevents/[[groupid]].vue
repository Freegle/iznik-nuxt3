<template>
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
              @update:modelValue="changeGroup"
            />
            <b-button
              variant="primary"
              class="float-right"
              @click="showEventModal"
            >
              <v-icon icon="plus" /> Add a community event
            </b-button>
          </div>
        </div>
        <h2 class="sr-only">List of community events</h2>
        <div v-for="id in events" :key="'event-' + id" class="mt-2">
          <CommunityEvent :id="id" :filter-group="groupid" :summary="false" />
        </div>
        <client-only>
          <infinite-loading
            :key="'infinite-' + groupid"
            :identifier="infiniteId"
            force-use-infinite-wrapper="body"
            :distance="1000"
            @infinite="loadMore"
          />
        </client-only>
      </b-col>
      <b-col cols="0" md="3" class="d-none d-md-block" />
    </b-row>
    <CommunityEventModal ref="eventmodal" :start-edit="true" />
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import GlobalWarning from '../../components/GlobalWarning'
import { buildHead } from '../../composables/useBuildHead'
import { useCommunityEventStore } from '../../stores/communityevent'
import { useGroupStore } from '../../stores/group'
import { useRouter } from '#imports'
import InfiniteLoading from '~/components/InfiniteLoading'
const GroupSelect = () => import('~/components/GroupSelect')
const CommunityEvent = () => import('~/components/CommunityEvent.vue')
const CommunityEventModal = () => import('~/components/CommunityEventModal')

export default {
  components: {
    GlobalWarning,
    InfiniteLoading,
    GroupSelect,
    CommunityEvent,
    CommunityEventModal,
  },
  mixins: [buildHead],
  async setup() {
    const communityEventStore = useCommunityEventStore()
    const groupStore = useGroupStore()

    const route = useRoute()
    const groupid = parseInt(route.params.groupid)

    await communityEventStore.fetchList()

    let name
    let image

    if (groupid) {
      const group = await groupStore.fetch(groupid)

      name = 'Community Events for ' + group.namedisplay
      image = group?.profile
    } else {
      name = 'Community Events'
      image = null
    }

    useHead(
      buildHead(
        name,
        'These are local events, posted by other freeglers like you.',
        image,
        {
          class: 'overflow-y-scroll',
        }
      )
    )

    return {
      communityEventStore,
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
    forUser() {
      return this.communityEventStore.forUser
    },
    events() {
      return this.forUser.slice(0, this.toShow)
    },
  },
  methods: {
    changeGroup(newval) {
      const router = useRouter()
      router.push(newval ? '/communityevents/' + newval : '/communityevents')
    },
    loadMore($state) {
      if (this.toShow < this.forUser.length) {
        this.toShow++
        $state.loaded()
      } else {
        $state.complete()
      }
    },
    showEventModal() {
      if (this.me) {
        this.$refs.eventmodal.show()
      } else {
        this.$store.dispatch('auth/forceLogin', true)
      }
    },
  },
}
</script>
