<template>
  <b-form-textarea
    ref="ta"
    v-model="currentValue"
    :size="size"
    :rows="currentRows"
    :maxlength="maxlength"
    :spellcheck="spellcheck"
    :placeholder="placeholder"
    :autocapitalize="autocapitalize"
    @focus="focused"
  />
</template>
<script setup>
// b-form-area doesn't yet support max-rows, so we roll our own component that monitors the textarea's scrollHeight.
// If we're showing a scrollbar, then increase the number of rows.
//
// We don't shrink.  If you're reading this, why not code it?
import { storeToRefs } from 'pinia'
import { ref, watch, onBeforeUnmount } from '#imports'
import { useMiscStore } from '~/stores/misc'

const props = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: null,
  },
  size: {
    type: [Number, String],
    default: null,
  },
  rows: {
    type: [Number, String],
    default: 2,
  },
  maxRows: {
    type: [Number, String],
    default: 6,
  },
  maxlength: {
    type: [Number, String],
    default: null,
  },
  spellcheck: {
    type: [Boolean, String],
    default: false,
  },
  placeholder: {
    type: String,
    default: null,
  },
  autocapitalize: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'focus'])
const ta = ref(null)
const currentValue = ref(props.modelValue)
const currentRows = ref(props.rows)
const timer = ref(null)

const miscStore = useMiscStore()
const { lastTyping } = storeToRefs(miscStore)

const focused = () => {
  emit('focus')
}

const checkRows = () => {
  if (ta.value) {
    const hasScroll = ta.value.$el.scrollHeight > ta.value.$el.clientHeight
    if (hasScroll && currentRows.value < props.maxRows) {
      currentRows.value++
    }
  }

  timer.value = setTimeout(checkRows, 100)
}

watch(
  () => props.modelValue,
  (newVal) => {
    currentValue.value = newVal
  }
)

watch(currentValue, (newVal) => {
  lastTyping.value = Date.now()

  if (newVal && !timer.value) {
    // Starting the timer here avoids having the timer run for empty textareas, which happen a lot in ChitChat.
    checkRows()
  } else if (!newVal && timer.value) {
    // No longer need to check.
    clearTimeout(timer.value)
    timer.value = null
  }

  emit('update:modelValue', newVal)
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
})
</script>
