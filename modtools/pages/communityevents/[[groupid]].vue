<template>
  <div>
    <div
      v-for="event in events"
      :key="'eventlist-' + event.id"
      class="p-0 mt-2"
    >
      <ModCommunityEvent :event="event" />
    </div>
    <NoticeMessage v-if="!Object.keys(events).length && !busy" class="mt-2">
      There are no community events to review at the moment. This will refresh
      automatically.
    </NoticeMessage>

    <infinite-loading
      force-use-infinite-wrapper="body"
      :distance="distance"
      @infinite="loadMore"
    >
      <template #spinner>
        <Spinner :size="50" />
      </template>
    </infinite-loading>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useAuthStore } from '@/stores/auth'

const communityEventStore = useCommunityEventStore()
const authStore = useAuthStore()

const distance = ref(1000)
const busy = ref(false)

const events = computed(() => {
  return Object.values(communityEventStore.list).filter((e) => e !== null)
})

const work = computed(() => {
  const workData = authStore.work
  if (!workData) return 0
  return workData.pendingevents
})

watch(work, (newVal, oldVal) => {
  console.log('TODO communityevents work changed', newVal, oldVal)
  if (newVal > oldVal) {
    // There's new stuff to do. Reload.
    // TODO communityEventStore.clear()
  }
})

onMounted(() => {
  // We don't want to pick up any approved events.
  communityEventStore.clear()
})

async function loadMore($state) {
  busy.value = true

  await communityEventStore.fetchPending()
  $state.complete()
  busy.value = false
}

// Expose for template and tests
defineExpose({ events, work, busy, distance, loadMore })
</script>
<style scoped lang="scss">
//@import 'color-vars';
</style>
