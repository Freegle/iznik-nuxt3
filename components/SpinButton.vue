<template>
  <b-button
    :variant="variant"
    :disabled="disabled"
    :size="size"
    :tabindex="tabindex"
    :title="buttonTitle"
    :class="[
      'd-flex gap-1',
      noBorder && 'no-border',
      iconlast && 'flex-row-reverse',
    ]"
    @click="onClick"
  >
    <span v-if="iconName">
      <v-icon
        v-if="doing"
        icon="sync"
        :class="['fa-spin', iconClass, spinclass]"
      />
      <v-icon
        v-else-if="done"
        :icon="doneIcon"
        :class="[spinclass, iconClass]"
      />
      <v-icon v-else :class="iconClass" :icon="iconName" />
    </span>
    <span v-if="label || $slots.default">
      <slot>{{ label }}</slot>
    </span>
  </b-button>
</template>
<script setup>
import { ref } from '#imports'

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
    required: true,
  },
  timeout: {
    type: Number,
    required: false,
    default: 5000,
  },
  spinclass: {
    type: String,
    required: false,
    default: 'text-success',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: null,
  },
  iconlast: {
    type: Boolean,
    required: false,
    default: false,
  },
  iconClass: {
    type: String,
    default: 'fa-fw',
  },
  confirm: {
    type: Boolean,
    required: false,
    default: false,
  },
  handlerData: {
    type: Object,
    required: false,
    default: null,
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

const doing = ref(false)
const done = ref(false)

const finnishSpinner = () => {
  doing.value = false
  done.value = true
  setTimeout(() => {
    done.value = false
  }, props.timeout)
}

const onClick = () => {
  if (!doing.value) {
    done.value = false
    doing.value = true

    emit('handle', { data: props.handlerData, callback: finnishSpinner })
  }
}

defineExpose({ handle: onClick })
</script>

<style scoped lang="scss">
.no-border {
  border-color: transparent !important;
}
</style>
