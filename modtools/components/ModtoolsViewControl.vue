<template>
  <div>
    <OurToggle
      v-model="summary"
      class="mt-2"
      :height="30"
      :width="150"
      :font-size="14"
      :sync="true"
      :labels="{ checked: 'Summary View', unchecked: 'Detailed View' }"
      variant="modgreen"
      @change="toggleView"
    />
  </div>
</template>

<script setup>
import { useMiscStore } from '~/stores/misc'
const miscStore = useMiscStore()

const props = defineProps({
  misckey: { type: String, required: true },
})

const summary = computed({
  get: () => {
    const ret = miscStore.get(props.misckey)
    return typeof ret === 'undefined' ? false : ret
  },
  set: (newValue) => {},
})

const toggleView = (c, e) => {
  miscStore.set({ key: props.misckey, value: c })
}
</script>
