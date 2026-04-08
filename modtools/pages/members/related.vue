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
        v-for="member in visibleMembers"
        :key="'memberlist-' + member.id"
        class="p-0 mt-2"
      >
        <ModRelatedMember :memberid="member.id" @processed="bump++" />
      </div>

      <infinite-loading
        direction="top"
        :distance="distance"
        :identifier="bump"
        @infinite="loadMore"
      >
        <template #spinner>
          <Spinner :size="50" />
        </template>
        <template #complete>
          <notice-message v-if="!visibleMembers?.length">
            There are no related members at the moment.
          </notice-message>
        </template>
      </infinite-loading>
    </client-only>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { setupModMembers } from '~/composables/useModMembers'
import { useMemberStore } from '~/stores/member'
import { useUserStore } from '~/stores/user'

const memberStore = useMemberStore()
const userStore = useUserStore()
const { bump, collection, distance, groupid, loadMore } = setupModMembers(true)
collection.value = 'Related'

// Only the related pair entries (not the synthetic per-user entries).
const members = computed(() => {
  if (!memberStore) return []
  return Object.values(memberStore.list).filter(
    (m) => m.collection === 'Related' && !m._syntheticRelated
  )
})

const visibleMembers = computed(() => {
  return members.value.filter((pair) => {
    if (groupid.value <= 0) {
      return true
    }

    // Check if either user in the pair is a member of the selected group.
    const u1 = userStore.list[pair.user1]
    const u2 = userStore.list[pair.user2]

    const inGroup = (user) => {
      if (!user?.memberships) return false
      return user.memberships.some((g) => parseInt(g.id) === groupid.value)
    }

    return inGroup(u1) || inGroup(u2)
  })
})

// Lifecycle
onMounted(() => {
  // reset infiniteLoading on return to page
  memberStore.clear()
})
</script>
