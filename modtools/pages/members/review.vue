<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpMemberReview />
      <ModPostcodeTester />

      <div
        v-for="member in visibleMembers"
        :key="'memberlist-' + member.id"
        class="p-0 mt-2"
      >
        <ModMemberReview :member="member" @forcerefresh="forcerefresh" />
      </div>

      <infinite-loading
        direction="top"
        force-use-infinite-wrapper="true"
        :distance="distance"
        :identifier="bump"
        @infinite="loadMore"
      >
        <template #spinner>
          <b-img lazy src="/loader.gif" alt="Loading" />
        </template>
        <template #complete>
          <notice-message v-if="!visibleMembers?.length">
            There are no members to review at the moment.
          </notice-message>
        </template>
      </infinite-loading>
    </client-only>
  </div>
</template>
<script>
import { useMemberStore } from '../stores/member'
import { setupModMembers } from '../../composables/useModMembers'
import { useMiscStore } from '@/stores/misc'

export default {
  setup() {
    const memberStore = useMemberStore()
    const miscStore = useMiscStore()
    const modMembers = setupModMembers(true)
    modMembers.context.value = null
    modMembers.sort.value = false
    modMembers.collection.value = 'Spam'
    modMembers.groupid.value = 0
    modMembers.group.value = null
    modMembers.limit.value = 100
    return {
      memberStore,
      miscStore,
      ...modMembers, // busy, context, group, groupid, limit, show, collection, messageTerm, memberTerm, distance, summary, members, visibleMembers, loadMore
    }
  },
  data: function () {
    return {
      bump: 0,
    }
  },
  mounted() {
    // reset infiniteLoading on return to page
    this.memberStore.clear()
    this.bump++
  },
  methods: {
    forcerefresh() {
      // Does not always seem to work
      this.$nextTick(() => {
        // this.memberStore.clear()
        this.bump++
      })
    },
  },
}
</script>
