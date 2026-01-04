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
    <v-icon :icon="computedIconData.name" :class="computedIconData.class" />
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
import { useMiscStore } from '~/stores/misc'
import { ref, defineAsyncComponent, onBeforeUnmount } from '#imports'
import { action } from '~/composables/useClientLog'
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
  minimumSpinTime: {
    type: Number,
    default: 500,
  },
  handleParam: {
    type: [String, Number, Object, Array, Boolean],
    default: null,
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

const computedIconData = computed(() => {
  if (loading.value) {
    return {
      class: `fa-spin fa-fw ${spinColorClass}`,
      name: 'sync',
    }
  }
  if (done.value && props.doneIcon) {
    return {
      class: props.iconClass,
      name: props.doneIcon,
    }
  }
  return {
    class: props.iconClass,
    name: props.iconName,
  }
})

const loading = ref(false)
const done = ref(false)
const showConfirm = ref(false)
const actionConfirmed = ref(false)
let timer = null

const spinColorClass =
  props.spinColor || SPINNER_COLOR[props.variant] || 'text-success'

const cancelLoading = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      loading.value = false
      resolve()
    }, props.minimumSpinTime)
  })
}
const finishSpinner = () => {
  clearTimeout(timer)
  cancelLoading().then(() => {
    if (props.doneIcon) {
      done.value = true
      setTimeout(() => {
        done.value = false
      }, props.timeout)
    }
  })
}

const forgottenCallback = () => {
  // Callbacks validly won't fire if we're offline, as the AJAX request won't complete.
  if (useMiscStore().online) {
    finishSpinner()
    action('spinbutton_callback_forgotten', {
      variant: props.variant,
      label: props.label,
      icon_name: props.iconName,
    })
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
  if (!loading.value) {
    if (props.confirm) {
      showConfirm.value = true
    } else {
      done.value = false
      loading.value = true
      timer = setTimeout(forgottenCallback, 20 * 1000)
      emit('handle', finishSpinner, props.handleParam)
    }
  }
}

const confirmed = () => {
  actionConfirmed.value = true
  done.value = false
  loading.value = true
  emit('handle', finishSpinner, props.handleParam)
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
