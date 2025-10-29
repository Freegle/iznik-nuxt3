<template>
  <GroupSelect
    v-model="selectValue"
    :all="all"
    :systemwide="systemwide"
    :size="size"
  />
</template>
<script setup>
import { computed, watch } from 'vue'
import GroupSelect from './GroupSelect'
import { useGroupStore } from '~/stores/group'

function intOrNull(val) {
  return typeof val === 'number' ? parseInt(val) : null
}

const props = defineProps({
  remember: {
    validator: (prop) => typeof prop === 'number' || typeof prop === 'string',
    required: true,
  },
  value: {
    type: Number,
    default: null,
  },
  // Whether we show "All my groups" or "Please choose a group"
  all: {
    type: Boolean,
    required: false,
    default: false,
  },
  systemwide: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
})

const emit = defineEmits(['input'])

const groupStore = useGroupStore()

const rememberedValue = computed(() => {
  return groupStore?.remembered(props.remember)
})

const selectValue = computed({
  get() {
    return props.value
  },
  set(val) {
    val = intOrNull(val)
    if (props.value !== val) {
      emit('input', val)
    }
  },
})

function updateMemory(val) {
  if (typeof val === 'number') {
    groupStore.remember(props.remember, val)
  } else {
    groupStore.forget(props.remember)
  }
}

// Watch for changes to rememberedValue
watch(
  rememberedValue,
  (val) => {
    if (val === undefined) return // no remembered value
    // we only take it if there is not already a value
    // this ensures we don't override explicitly set values from outside
    if (props.value === null) emit('input', val)
  },
  { immediate: true }
)

// Watch for changes to value
watch(
  () => props.value,
  (val) => {
    // value changed
    if (rememberedValue.value !== val) {
      updateMemory(val)
    }
  }
)
</script>
