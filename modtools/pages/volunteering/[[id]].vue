<template>
  <div>
    <div v-for="volunteering in volunteerings" :key="'volunteeringlist-' + volunteering.id" class="p-0 mt-2">
      <ModVolunteerOpportunity :volunteering="volunteering" />
    </div>
    <NoticeMessage v-if="!Object.keys(volunteerings).length && !busy" class="mt-2">
      There are no volunteer opportunities to review at the moment. This will refresh automatically.
    </NoticeMessage>

    <infinite-loading :distance="distance" @infinite="loadMore">
      <template #no-results>
      </template>
      <template #no-more />
      <template #spinner />
    </infinite-loading>
  </div>
</template>
<script>
import { useVolunteeringStore } from '@/stores/volunteering'

export default {
  setup() {
    console.log('volunteering setup')
    const volunteeringStore = useVolunteeringStore()
    return {
      volunteeringStore,
    }
  },
  data: function () {
    return {
      distance: 1000,
      limit: 2,
      show: 0,
      busy: false
    }
  },
  computed: {
    volunteerings() {
      return []
      //this.volunteeringStore.fetchGroup()
      //return this.volunteeringStore.forGroup
    },
    volwork() {
      // Count for the type of work we're interested in.
      console.log('volunteering work', this.work)
      return 0
      //const work = this.$store.getters['auth/work']
      //return work.pendingvolunteerings
    },
    context() {
      return null
      // TODO return this.$store.getters['volunteerops/getContext']
    }
  },
  watch: {
    volwork(newVal, oldVal) {
      console.log('volunteering watch volwork', newVal, oldVal)
      /* TODO if (newVal > oldVal) {
        // There's new stuff to do.  Reload.
        this.$store.dispatch('volunteerops/clear')
      } else {
        const visible = this.$store.getters['misc/get']('visible')
  
        if (!visible) {
          this.$store.dispatch('volunteerops/clear')
        }
      }*/
    }
  },
  mounted() {
    // We don't want to pick up any approved volunteerings.
    console.log('volunteering mounted')
    this.volunteeringStore.clear()
  },
  methods: {
    loadMore: function ($state) {
      console.log('volunteering loadMore A')
      this.busy = true

      if (this.show < this.volunteerings.length) {
        // This means that we will gradually add the volunteerings that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        this.show++
        $state.loaded()
      } else {
        const currentCount = this.volunteerings.length
        console.log('volunteering loadMore', currentCount)
        $state.complete()
        this.busy = false

        /*this.$store
          .dispatch('volunteerops/fetch', {
            context: this.context,
            limit: this.limit,
            pending: true
          })
          .then(() => {
            if (currentCount === this.volunteerings.length) {
              this.complete = true
              $state.complete()
            } else {
              $state.loaded()
              this.show++
            }
          })
          .catch(e => {
            $state.complete()
            console.log('Complete on error', e)
          })
          .finally(() => {
            this.busy = false
          })*/
      }
    }
  }
}
</script>
<style scoped lang="scss">
//@import 'color-vars';</style>
