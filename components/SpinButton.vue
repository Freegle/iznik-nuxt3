<template>
  <div class="d-inline-block">
    <b-button
      :variant="variant"
      :disabled="disabled"
      :size="size"
      :class="[buttonClass, transparent && 'transbord']"
      :tabindex="tabindex"
      @click="click"
    >
      <span v-if="iconlast">
        {{ label }}
      </span>
      <span>
        <span v-if="name">
          <v-icon v-if="done" icon="check" :class="spinclass + ' fa-fw'" />
          <v-icon
            v-else-if="spinnerVisible"
            icon="sync"
            :class="'fa-fw fa-spin ' + spinclass"
          />
          <v-icon v-else-if="!spinnerOnly" class="fa-fw" :icon="name" />&nbsp;
        </span>
        <span v-if="!iconlast" class="ml-1">
          {{ label }}
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
</style>