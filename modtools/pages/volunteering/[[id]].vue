<template>
  <div>
    <div
      v-for="volunteering in volunteerings"
      :key="'volunteeringlist-' + volunteering.id"
      class="p-0 mt-2"
    >
      <ModVolunteerOpportunity
        :id="volunteering.id"
        :volunteering="volunteering"
      />
    </div>
    <NoticeMessage
      v-if="!Object.keys(volunteerings).length && !busy"
      class="mt-2"
    >
      There are no volunteer opportunities to review at the moment. This will
      refresh automatically.
    </NoticeMessage>

    <infinite-loading
      :distance="distance"
      :identifier="bump"
      @infinite="loadMore"
    >
      <template #no-results> </template>
      <template #no-more />
      <template #spinner />
    </infinite-loading>
  </div>
</template>
<script>
import { useAuthStore } from '@/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import { useVolunteeringStore } from '@/stores/volunteering'

export default {
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const volunteeringStore = useVolunteeringStore()
    return {
      authStore,
      miscStore,
      volunteeringStore,
    }
  },
  data: function () {
    return {
      distance: 1000,
      limit: 2,
      show: 0,
      bump: 0,
      busy: false,
    }
  },
  computed: {
    volunteerings() {
      return Object.values(this.volunteeringStore.list)
    },
    volwork() {
      // Count for the type of work we're interested in.
      console.log(
        'TODO volunteering volwork',
        this.authStore.work?.pendingvolunteering
      )
      return this.authStore.work ? this.authStore.work.pendingvolunteering : 0
    },
  },
  watch: {
    volwork(newVal, oldVal) {
      // TODO: The page is always going to be visible so why might we not be?
      console.log('volunteering watch volwork', newVal, oldVal)
      if (newVal && oldVal && newVal > oldVal) {
        // There's new stuff to do.  Reload.
        this.volunteeringStore.clear()
        this.bump++
      } else {
        // const visible = this.miscStore.get('visible')
        // if (!visible) {
        //  this.volunteeringStore.clear()
        // }
      }
    },
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    // We don't want to pick up any approved volunteerings.
    this.volunteeringStore.clear()
  },
  methods: {
    loadMore: async function ($state) {
      this.busy = true

      if (this.show < this.volunteerings.length) {
        // This means that we will gradually add the volunteerings that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        this.show++
        $state.loaded()
      } else {
        const currentCount = this.volunteerings.length
        this.busy = false

        await this.volunteeringStore.fetchMT({
          // context: this.context,
          limit: this.limit,
          pending: true,
        })
        // console.log('volunteering loadMore got', currentCount, this.volunteerings.length)
        if (currentCount === this.volunteerings.length) {
          this.complete = true
          $state.complete()
        } else {
          $state.loaded()
          this.show++
        }
        this.busy = false
      }
    },
  },
}
</script>
<style scoped lang="scss">
//@import 'color-vars';
</style>
