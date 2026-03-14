<template>
  <div>
    <b-row>
      <b-col cols="3" lg="2" class="font-weight-bold"> Date / Time </b-col>
      <b-col cols="9" lg="4" class="forcebreak font-weight-bold"> User </b-col>
      <b-col cols="12" lg="6" class="forcebreak font-weight-bold">
        Action
      </b-col>
    </b-row>

    <hr class="d-block d-md-none" />

    <ModLog v-for="log in logs" :key="'log-' + log.id" :log="log" />

    <infinite-loading :distance="distance" @infinite="loadMore">
      <template #spinner>
        <Spinner :size="50" />
      </template>
    </infinite-loading>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useLogsStore } from '~/stores/logs'

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['busy', 'idle'])

const logsStore = useLogsStore()

const distance = ref(1000)
const limit = ref(50)
const show = ref(0)
const busy = ref(false)

const logs = computed(() => {
  return logsStore.list
})

async function loadMore($state) {
  busy.value = true
  emit('busy')
  const params = logsStore.params

  if (show.value < logs.value.length) {
    show.value++
    $state.loaded()
  } else {
    const currentCount = logs.value.length
    try {
      await logsStore.fetch({
        limit: limit.value,
        groupid: props.groupid,
        logtype: params.type,
        search: params.search,
      })

      const logsList = logsStore.list

      if (currentCount === logsList.length) {
        $state.complete()
      } else {
        $state.loaded()
        show.value++
      }
    } catch (e) {
      $state.complete()
      console.log('Complete on error', e)
    }
  }

  busy.value = false
  emit('idle')
}
</script>
