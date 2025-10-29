<template>
  <div>
    <div
      v-for="(date, idx) in current"
      :key="date.uniqueid"
      :class="date.string && date.string.past ? 'inpast' : ''"
    >
      <StartEndDate
        v-model="current[idx]"
        :removable="!required || current.length > 1"
        :max-duration-days="maxDurationDays"
        :time="time"
        @remove="remove(date)"
      />
    </div>
    <b-button variant="secondary" class="mt-2" @click="add">
      <v-icon icon="plus" /> Add <span v-if="current.length > 0">another</span
      ><span v-else>a</span> date
    </b-button>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { uid } from '~/composables/useId'
import StartEndDate from '~/components/StartEndDate'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  maxDurationDays: {
    type: Number,
    required: false,
    default: null,
  },
  time: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const current = ref(props.modelValue)

if (props.modelValue?.length === 0 && props.required) {
  current.value = [
    {
      uniqueid: uid('date-'),
      start: null,
      end: null,
      past: false,
    },
  ]
}

function remove(item) {
  const idx = current.value.indexOf(item)
  if (idx !== -1) current.value.splice(idx, 1)
}

function add() {
  current.value.push({
    uniqueid: uid('date-'),
    start: null,
    end: null,
    starttime: null,
    endtime: null,
    past: false,
  })
}

watch(
  current,
  (newVal) => {
    console.log('Current coll', newVal)
    emit('update:modelValue', newVal)
  },
  { deep: true }
)
</script>
<style scoped lang="scss">
.inpast {
  text-decoration: line-through;
  color: $color-gray--faded;
}
</style>
