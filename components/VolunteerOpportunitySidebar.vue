<template>
  <aside>
    <CommunityFeature
      :items="opportunities"
      title="Volunteer Opportunities"
      link="/volunteerings"
      icon-name="hands-helping"
      add-button-label="Add volunteer opportunity"
      item-description="Are you a charity or good cause that needs volunteers?"
      no-items-message="Are you a charity or good cause that needs volunteers?  Why not add your volunteer opportunities here?"
      feature-component="VolunteerOpportunity"
      add-modal-component="VolunteerOpportunityModal"
      item-key="volunteering-"
    />
    <infinite-loading :distance="200" @infinite="loadMore" />
  </aside>
</template>
<script>
import { useRoute } from 'vue-router'
import { useGroupStore } from '../stores/group'
import { useVolunteeringStore } from '../stores/volunteering'
import CommunityFeature from './CommunityFeature'

export default {
  components: {
    CommunityFeature,
  },
  async setup() {
    const volunteeringStore = useVolunteeringStore()
    const groupStore = useGroupStore()

    const route = useRoute()
    const groupid = parseInt(route.params.groupid)

    await volunteeringStore.fetchList()

    return {
      volunteeringStore,
      groupStore,
      groupid,
    }
  },
  data() {
    return {
      toShow: 1,
    }
  },
  computed: {
    forUser() {
      return this.volunteeringStore?.forUser
    },
    opportunities() {
      return this.forUser?.slice(0, this.toShow)
    },
  },
  methods: {
    loadMore($state) {
      if (this.toShow < this.forUser.length) {
        this.toShow++
        $state.loaded()
      } else {
        $state.complete()
      }
    },
  },
}
</script>
<style scoped lang="scss">
.volunteer__link {
  color: $colour-header;
}
</style>
