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
        <ModRelatedMember :member="member" @processed="bump++" />
      </div>

      <infinite-loading
        direction="top"
        force-use-infinite-wrapper="true"
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

const memberStore = useMemberStore()
const { bump, collection, distance, groupid, loadMore } = setupModMembers(true)
collection.value = 'Related'

// Computed
const members = computed(() => {
  if (!memberStore) return []
  console.log('members related all list')
  return Object.values(memberStore.list)
})

const visibleMembers = computed(() => {
  const ret = members.value.filter((member) => {
    if (groupid.value <= 0) {
      // No group filter
      return true
    }

    let found = false
    member.memberof.forEach((group) => {
      if (parseInt(group.id) === groupid.value) {
        found = true
      }
    })

    member.relatedto.memberof.forEach((group) => {
      if (parseInt(group.id) === groupid.value) {
        found = true
      }
    })

    return found
  })

  return ret
})

// Lifecycle
onMounted(() => {
  // reset infiniteLoading on return to page
  memberStore.clear()
})
</script>
