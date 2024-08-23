<template>
  <OurToggle :value="summary" class="mt-2" :height="30" :width="150" :font-size="14" :sync="true"
    :labels="{ checked: 'Summary View', unchecked: 'Detailed View' }" color="#61AE24" @change="toggleView" />
</template>

<script setup>
import { useMiscStore } from '~/stores/misc';
const miscStore = useMiscStore()

const summary = computed(() => {
  const ret = miscStore.get('modtoolsMessagesApprovedSummary')
  return typeof ret === 'undefined' ? false : ret
})

const toggleView = (c, e) => {
  miscStore.set({ key: 'modtoolsMessagesApprovedSummary', value: c })
}

</script>
