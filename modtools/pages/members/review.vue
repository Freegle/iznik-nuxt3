<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpMemberReview />
      <ModPostcodeTester />

      <ModMembers />
      <infinite-loading direction="top" force-use-infinite-wrapper="true" :distance="distance" @infinite="loadMore" :identifier="bump">
        <template #no-results>
          <p class="p-2">There are no members to review at the moment.</p>
        </template>
        <template #no-more>
          <p class="p-2">There are no members to review at the moment.</p>
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
  async setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const miscStore = useMiscStore()
    const modMembers = setupModMembers()
    modMembers.collection.value = 'Spam'
    return {
      groupStore,
      memberStore,
      miscStore,
      ...modMembers // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, members, visibleMembers, work, loadMore
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
  }
}
</script>
