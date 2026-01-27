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
<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { setupModMembers } from '~/composables/useModMembers'
import { useMemberStore } from '~/stores/member'
import { useMiscStore } from '@/stores/misc'

const memberStore = useMemberStore()
// eslint-disable-next-line no-unused-vars
const miscStore = useMiscStore()

// Setup mod members composable
const modMembers = setupModMembers(true)
modMembers.context.value = null
modMembers.sort.value = false
modMembers.collection.value = 'Spam'
modMembers.groupid.value = 0
modMembers.group.value = null
modMembers.limit.value = 100

// Destructure for template access
const { distance, visibleMembers, loadMore } = modMembers

// Reactive state (was data())
const bump = ref(0)

// Methods
function forcerefresh() {
  nextTick(() => {
    bump.value++
  })
}

// Lifecycle - mounted
onMounted(() => {
  // reset infiniteLoading on return to page
  memberStore.clear()
  bump.value++
})
</script>
