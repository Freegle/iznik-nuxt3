<template>
  <b-button
    :variant="variant"
    :disabled="disabled"
    :size="size"
    :tabindex="tabindex"
    :title="buttonTitle"
    :class="[
      'd-flex gap-1 align-items-center',
      noBorder && 'no-border',
      iconlast && 'flex-row-reverse',
    ]"
    @click="onClick"
  >
    <v-icon
      v-if="doing"
      icon="sync"
      :class="['fa-spin fa-fw', spinColorClass]"
    />
    <v-icon v-else-if="done && doneIcon" :icon="doneIcon" :class="iconClass" />
    <v-icon v-else-if="iconName" :class="iconClass" :icon="iconName" />
    <span v-if="label || $slots.default">
      <slot>{{ label }}</slot>
    </span>
  </b-button>
</template>
<script setup>
import { ref } from '#imports'
const { $sentryCaptureException } = useNuxtApp()
const props = defineProps({
  variant: {
    type: String,
    required: true,
  },
  iconName: {
    type: String,
    required: false,
    default: null,
  },
  label: {
    type: String,
    required: false,
    default: '',
  },
  timeout: {
    type: Number,
    required: false,
    default: 5000,
  },
  spinColor: {
    type: String,
    required: false,
    default: '',
  },
  disabled: Boolean,
  size: {
    type: String,
    required: false,
    default: null,
  },
  iconlast: Boolean,
  iconClass: {
    type: String,
    default: 'fa-fw',
  },
  tabindex: {
    type: Number,
    default: 0,
  },
  doneIcon: {
    type: String,
    default: 'check',
  },
  buttonTitle: {
    type: String,
    default: '',
  },
  noBorder: Boolean,
})

const emit = defineEmits(['handle'])

const SPINNER_COLOR = {
  primary: 'text-white',
  secondary: 'text-black',
  white: 'text-black',
  link: 'text-success',
  danger: 'text-white',
}

const doing = ref(false)
const done = ref(false)
let timer = null

const spinColorClass =
  props.spinColor || SPINNER_COLOR[props.variant] || 'text-success'

const finishSpinner = () => {
  clearTimeout(timer)
  doing.value = false
  if (props.doneIcon) {
    done.value = true
    setTimeout(() => {
      done.value = false
    }, props.timeout)
  }
}

const forgottenCallback = () => {
  finishSpinner()
  $sentryCaptureException('SpinButton - callback not called')
}

const onClick = () => {
  if (!doing.value) {
    done.value = false
    doing.value = true

    emit('handle', finishSpinner)
    timer = setTimeout(forgottenCallback, 20 * 1000)
  }
}

defineExpose({ handle: onClick })
</script>

<style scoped lang="scss">
.no-border {
  border-color: transparent !important;
}
</style>
