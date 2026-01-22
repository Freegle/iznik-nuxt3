<template>
  <div>
    <div
      v-for="volunteering in volunteerings"
      :key="'volunteeringlist-' + volunteering.id"
      class="p-0 mt-2"
    >
      <ModVolunteerOpportunity
        :id="volunteering.id"
        :volunteering="volunteering"
      />
    </div>

    <infinite-loading
      :distance="distance"
      :identifier="bump"
      @infinite="loadMore"
    >
      <template #spinner />
      <template #complete>
        <notice-message v-if="!volunteerings?.length">
          There are no volunteer opportunities to review at the moment. This
          will refresh automatically.
        </notice-message>
      </template>
    </infinite-loading>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useVolunteeringStore } from '@/stores/volunteering'

const authStore = useAuthStore()
const volunteeringStore = useVolunteeringStore()

const distance = ref(1000)
const limit = ref(2)
const show = ref(0)
const bump = ref(0)
const busy = ref(false)

const volunteerings = computed(() => {
  return Object.values(volunteeringStore.list)
})

const volwork = computed(() => {
  console.log('TODO volunteering volwork', authStore.work?.pendingvolunteering)
  return authStore.work ? authStore.work.pendingvolunteering : 0
})

watch(volwork, (newVal, oldVal) => {
  console.log('volunteering watch volwork', newVal, oldVal)
  if (newVal && oldVal && newVal > oldVal) {
    // There's new stuff to do. Reload.
    volunteeringStore.clear()
    bump.value++
  }
})

onMounted(() => {
  // We don't want to pick up any approved volunteerings.
  volunteeringStore.clear()
})

async function loadMore($state) {
  busy.value = true

  if (show.value < volunteerings.value.length) {
    // This means that we will gradually add the volunteerings that we have fetched from the server into the DOM.
    // Doing that means that we will complete our initial render more rapidly and thus appear faster.
    show.value++
    $state.loaded()
  } else {
    const currentCount = volunteerings.value.length
    busy.value = false

    await volunteeringStore.fetchMT({
      limit: limit.value,
      pending: true,
    })

    if (currentCount === volunteerings.value.length) {
      $state.complete()
    } else {
      $state.loaded()
      show.value++
    }
    busy.value = false
  }
}

// Expose for template and tests
defineExpose({
  volunteerings,
  volwork,
  busy,
  distance,
  limit,
  show,
  bump,
  loadMore,
})
</script>
<style scoped lang="scss">
//@import 'color-vars';
</style>
