<template>
  <b-button
    v-bind="$attrs"
    :variant="variant"
    :disabled="disabled"
    :size="size"
    :tabindex="tabindex"
    :title="buttonTitle"
    :class="[
      flex && 'd-flex gap-1 align-items-center',
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
  <ConfirmModal
    v-if="confirm && showConfirm"
    @confirm="confirmed"
    @hidden="onConfirmClosed"
  />
</template>
<script setup>
import { useMiscStore } from '../stores/misc'
import { ref, defineAsyncComponent, onBeforeUnmount } from '#imports'
const { $sentryCaptureException } = useNuxtApp()

const ConfirmModal = defineAsyncComponent(() => import('./ConfirmModal'))

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
  confirm: Boolean,
  flex: {
    type: Boolean,
    default: true,
  },
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
const showConfirm = ref(false)
const actionConfirmed = ref(false)
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
  // Callbacks validly won't fire if we're offline, as the AJAX request won't complete.
  if (useMiscStore().online) {
    finishSpinner()
    $sentryCaptureException(
      'SpinButton - callback not called, ' +
        props.variant +
        ', ' +
        props.label +
        ', ' +
        props.iconName
    )
  }
}

const onClick = () => {
  if (!doing.value) {
    if (props.confirm) {
      showConfirm.value = true
    } else {
      done.value = false
      doing.value = true
      emit('handle', finishSpinner)
      timer = setTimeout(forgottenCallback, 20 * 1000)
    }
  }
}

const confirmed = () => {
  actionConfirmed.value = true
  done.value = false
  doing.value = true
  emit('handle', finishSpinner)
  timer = setTimeout(forgottenCallback, 20 * 1000)
}

const onConfirmClosed = () => {
  showConfirm.value = false
}

onBeforeUnmount(() => clearTimeout(timer))

defineExpose({ handle: onClick })
</script>

<style scoped lang="scss">
.no-border {
  border-color: transparent !important;
}
</style>
