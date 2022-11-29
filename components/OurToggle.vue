<template>
  <Toggle
    v-model="currentValue"
    :style="
      'width: ' +
      width +
      'px; height: ' +
      height +
      'px;' +
      'font-size: ' +
      fontSize
    "
    :on-label="labels.checked"
    :off-label="labels.unchecked"
    :class="variant"
  />
</template>
<script>
// This is a separate component partly because the toggle we use is not SSR-safe, and by async loading this component
// we can avoid importing it until we're on the client.
import Toggle from '@vueform/toggle'

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
    height: {
      type: Number,
      required: false,
      default: 30,
    },
    width: {
      type: Number,
      required: false,
      default: 100,
    },
    fontSize: {
      type: String,
      required: false,
      default: '14',
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
  data() {
    return {
      currentValue: false,
    }
  },
  watch: {
    currentValue(newVal) {
      this.$emit('change', newVal)
    },
  },
  mounted() {
    this.currentValue = this.modelValue
  },
}
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped lang="scss">
.green {
  --toggle-bg-on: #61ae24;
  --toggle-border-on: #61ae24;
}

:deep(.toggle) {
  width: 100% !important;
}

:deep(.toggle-on) {
  padding-left: 0.25rem;
}

:deep(.toggle-off) {
  padding-right: 0.25rem;
  justify-content: flex-start !important;
  padding-left: 25px !important;
}
</style>
