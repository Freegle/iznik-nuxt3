<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpMemberReview />
      <ModPostcodeTester />

      <div
        v-for="(member, ix) in visibleMembers"
        :key="'memberlist-' + member.id"
        class="p-0 mt-2"
      >
        <ModMemberReview :member="member" />
      </div>

      <infinite-loading
        direction="top"
        force-use-infinite-wrapper="true"
        :distance="distance"
        :identifier="bump"
        @infinite="loadMore"
      >
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
import { useMemberStore } from '~/stores/member'
import { setupModMembers } from '../../composables/useModMembers'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  async setup() {
    const memberStore = useMemberStore()
    const miscStore = useMiscStore()
    const modMembers = setupModMembers(true)
    modMembers.context.value = null
    modMembers.sort.value = false
    modMembers.collection.value = 'Spam'
    modMembers.groupid.value = 0
    modMembers.group.value = null
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
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    // reset infiniteLoading on return to page
    this.memberStore.clear()
    this.bump++
  },
}
</script>
