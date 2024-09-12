<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpRelated />
      <GroupSelect v-model="groupid" all modonly systemwide :work="['relatedmembers']" remember="membersrelated" />

      <div v-for="(member, ix) in visibleMembers" :key="'memberlist-' + member.id" class="p-0 mt-2">
        <ModRelatedMember :member="member" />
      </div>

      <infinite-loading direction="top" force-use-infinite-wrapper="true" :distance="distance" @infinite="loadMore" :identifier="bump">
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
import { useGroupStore } from '@/stores/group'
import { useMiscStore } from '@/stores/misc'
import { useMemberStore } from '../stores/member'
import { setupModMembers } from '../../composables/useModMembers'

export default {
  //mixins: [loginRequired, modMembersPage],
  async setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const miscStore = useMiscStore()
    const modMembers = setupModMembers()
    modMembers.collection.value = 'Related'
    return {
      groupStore,
      memberStore,
      miscStore,
      ...modMembers // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, members, visibleMembers, work,
    }
  },
  data: function () {
    return {
      bump: 0
    }
  },
  async mounted() {
    // reset infiniteLoading on return to page
    this.memberStore.clear()
    this.bump++
  },
  computed: {
    /*members() {
      return this.$store.getters['members/getAll']
    },
    visibleMembers() {
      const ret = this.members.filter(member => {
        if (this.groupid <= 0) {
          // No group filter
          return true
        }

        let found = false
        member.memberof.forEach(group => {
          if (parseInt(group.id) === this.groupid) {
            found = true
          }
        })

        member.relatedto.memberof.forEach(group => {
          if (parseInt(group.id) === this.groupid) {
            found = true
          }
        })

        return found
      })

      return ret
    }*/
  },
  methods: {
    active(member) {
      return member.messagehistory
    }
  }
}
</script>
