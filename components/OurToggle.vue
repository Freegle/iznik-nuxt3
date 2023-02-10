<template>
  <div>
    <Toggle
      v-model="currentValue"
      class="toggle"
      :on-label="labels.checked"
      :off-label="labels.unchecked"
      :class="variant + ' toggle-' + size"
      :width="100"
      :height="50"
    />
  </div>
</template>
<script>
// This is a separate component partly because the toggle we use is not SSR-safe, and by async loading this component
// we can avoid importing it until we're on the client.
import Toggle from '@vueform/toggle'
import { ref } from '#imports'

export default {
  components: {
    Toggle,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: String,
      required: false,
      default: 'md',
    },
    labels: {
      type: Object,
      required: false,
      default: () => ({ checked: 'On', unchecked: 'Off' }),
    },
    variant: {
      type: String,
      required: false,
      default: 'green',
    },
  },
  setup(props) {
    return {
      currentValue: ref(props.modelValue),
    }
  },
  watch: {
    modelValue(newVal) {
      this.currentValue = newVal
    },
    currentValue(newVal) {
      this.$emit('change', newVal)
    },
  },
}
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped lang="scss">
.green {
  --toggle-bg-on: #61ae24;
  --toggle-border-on: #61ae24;
}

:deep(.toggle-off) {
  padding-right: 0.25rem;
  justify-content: flex-start !important;
  padding-left: 25px !important;
}

:deep(.toggle-container) {
  border: 0px !important;
}

:deep(.toggle-container.toggle-sm .toggle) {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

:deep(.toggle-container.toggle-md .toggle) {
  padding-left: 3rem !important;
  padding-right: 3rem !important;
}

:deep(.toggle-container.toggle-lg .toggle) {
  padding-left: 5rem !important;
  padding-right: 5rem !important;
}

:deep(.toggle) {
  min-width: fit-content;
  width: fit-content;

  .toggle-label {
    min-width: fit-content;
    width: fit-content;
    padding-left: 10px;
  }
}
//  font-size: v-bind(fontSize);
//
//  .toggle-handle {
//    height: 50px; //v-bind(height) + 'px' !important;
//    width: 50px; //v-bind(width) + 'px' !important;
//  }
//}
</style>
