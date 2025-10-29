<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpRelated />
      <ModGroupSelect
        v-model="groupid"
        all
        modonly
        systemwide
        :work="['relatedmembers']"
        remember="membersrelated"
      />

      <div
        v-for="(member, ix) in visibleMembers"
        :key="'memberlist-' + member.id"
        class="p-0 mt-2"
      >
        <ModRelatedMember :member="member" />
      </div>

      <infinite-loading
        direction="top"
        force-use-infinite-wrapper="true"
        :distance="distance"
        :identifier="bump"
        @infinite="loadMore"
      >
        <template #no-results>
          <p class="p-2">There are no related members at the moment.</p>
        </template>
        <template #no-more>
          <p class="p-2">There are no related members at the moment.</p>
        </template>
        <template #spinner>
          <b-img lazy src="/loader.gif" alt="Loading" />
        </template>
      </infinite-loading>
    </client-only>
  </div>
</template>
<script>
import { useMemberStore } from '~/stores/member'
import { setupModMembers } from '../../composables/useModMembers'
import { useGroupStore } from '@/stores/group'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  async setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const miscStore = useMiscStore()
    const { bump, collection, distance, groupid, loadMore } =
      setupModMembers(true)
    collection.value = 'Related'
    return {
      groupStore,
      memberStore,
      miscStore,
      groupid,
      bump,
      distance,
      groupid,
      loadMore,
    }
  },
  data: function () {
    return {}
  },
  computed: {
    members() {
      if (!this.memberStore) return []
      console.log('members related all list')
      return Object.values(this.memberStore.list)
    },
    visibleMembers() {
      const ret = this.members.filter((member) => {
        if (this.groupid <= 0) {
          // No group filter
          return true
        }

        let found = false
        member.memberof.forEach((group) => {
          if (parseInt(group.id) === this.groupid) {
            found = true
          }
        })

        member.relatedto.memberof.forEach((group) => {
          if (parseInt(group.id) === this.groupid) {
            found = true
          }
        })

        return found
      })

      return ret
    },
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    // reset infiniteLoading on return to page
    this.memberStore.clear()
  },
  methods: {
    active(member) {
      return member.messagehistory
    },
  },
}
</script>
