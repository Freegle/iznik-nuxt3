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
<script>
// b-form-area doesn't yet support max-rows, so we roll our own component that monitors the textarea's scrollHeight.
// If we're showing a scrollbar, then increase the number of rows.
//
// We don't shrink.  If you're reading this, why not code it?
import { mapWritableState } from 'pinia'
import { ref } from '#imports'
import { useMiscStore } from '~/stores/misc'

export default {
  props: {
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
  },
  setup(props) {
    return {
      currentValue: ref(props.modelValue),
      currentRows: ref(props.rows),
    }
  },
  data() {
    return {
      timer: null,
    }
  },
  computed: {
    ...mapWritableState(useMiscStore, ['lastTyping']),
  },
  watch: {
    modelValue(newVal) {
      this.currentValue = newVal
    },
    currentValue(newVal) {
      this.lastTyping = Date.now()

      if (newVal && !this.timer) {
        // Starting the timer here avoids having the timer run for empty textareas, which happen a lot in ChitChat.
        this.checkRows()
      } else if (!newVal && this.timer) {
        // No longer need to check.
        clearTimeout(this.timer)
        this.timer = null
      }

      this.$emit('update:modelValue', newVal)
    },
  },
  beforeUnmount() {
    if (this.rowTimer) {
      clearTimeout(this.rowTimer)
    }
  },
  methods: {
    focused() {
      this.$emit('focus')
    },
    checkRows() {
      const ta = this.$refs.ta

      if (ta) {
        const hasScroll = ta.$el.scrollHeight > ta.$el.clientHeight
        if (hasScroll && this.currentRows < this.maxRows) {
          this.currentRows++
        }
      }

      this.timer = setTimeout(this.checkRows, 100)
    },
  },
}
</script>
