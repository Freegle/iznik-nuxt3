<template>
  <div class="d-inline-block">
    <b-button
      :variant="variant"
      :disabled="disabled"
      :size="size"
      :class="[buttonClass, transparent && 'transbord']"
      :tabindex="tabindex"
      :title="buttonTitle"
      @click="click"
    >
      <span v-if="iconlast && (label || $slots.default)">
        <slot>
          {{ label }}
        </slot>
      </span>
      <span>
        <span v-if="name || spinnerOnly">
          <v-icon
            v-if="spinnerVisible"
            icon="sync"
            :class="['fa-spin', iconClass, spinclass]"
          />
          <v-icon v-else-if="done" :icon="doneIcon" :class="[spinclass, iconClass]" />
          <v-icon v-else-if="!spinnerOnly" :class="iconClass" :icon="name" />&nbsp;
        </span>
        <span v-if="!iconlast && (label || $slots.default)" class="ml-1">
          <slot>{{ label }}</slot>
        </span>
      </span>
    </b-button>
    <ConfirmModal
      v-if="confirm && showConfirm"
      @confirm="doIt"
      @hidden="showConfirm = false"
    />
  </div>
</template>
<script setup>
import { ref, defineAsyncComponent } from '#imports'
import { computed } from 'vue';

const ConfirmModal = defineAsyncComponent(() => import('./ConfirmModal'))

const props = defineProps({
  variant: {
    type: String,
    required: true,
  },
  name: {
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
  buttonClass: {
    type: String,
    required: false,
    default: null,
  },
  showSpinner: {
    type: Boolean,
    default: false,
    required: false,
  },
  spinnerOnly: {
    type: Boolean,
    default: false,
    required: false,
  },
  tabindex: {
    type: Number,
    default: 0,
  },
  transparent: {
    type: Boolean,
    default: false,
    required: false,
  },
  doneIcon: {
    type: String,
    default: 'check',
  },
  buttonTitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['handle'])

const doing = ref(false)
const done = ref(false)
const showConfirm = ref(false)

const spinnerVisible = computed(() => props.showSpinner || doing.value)
const click = () => {
  if (props.confirm) {
    showConfirm.value = true
  } else {
    doIt()
  }
}

const doIt = async () => {
  if (!doing.value) {
    done.value = false
    doing.value = true

    await emit('handle', props.handlerData)

    doing.value = false
    done.value = true
    setTimeout(() => {
      done.value = false
    }, props.timeout)
  }
}
</script>

<style scoped lang="scss">
.transbord {
  border-color: transparent !important;
}

.tweakHeight {
  line-height: 1.7em;
}
</style>