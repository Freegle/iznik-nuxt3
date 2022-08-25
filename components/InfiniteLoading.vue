<template>
  <div
    ref="infiniteLoading"
    :key="bump"
    v-observe-visibility="{
      callback: visibilityChanged,
      intersection: {
        rootMargin: '0px 0px ' + distance + 'px 0px',
      },
    }"
  >
    <slot v-if="state == 'loading'" name="spinner"></slot>
    <slot v-if="state == 'complete'" name="complete"></slot>
    <slot v-if="state == 'error'" name="error"></slot>
  </div>
</template>
<script>
// Derived from https://github.com/oumoussa98/vue3-infinite-loading.  Reworked radically to allow an async event
// handler, and to make consistent with the rest of this codebase.
import { nextTick } from 'vue'

export default {
  props: {
    top: { type: Boolean, required: false },
    target: { type: [String, Boolean], required: false, default: null },
    distance: { type: Number, required: false, default: 0 },
    identifier: { type: [String, Number], required: false, default: null },
    firstload: { type: Boolean, required: false, default: true },
    slots: { type: Object, required: false, default: null },
  },
  emits: ['infinite'],
  data() {
    return {
      state: 'ready',
      bump: 0,
      visible: false,
    }
  },
  watch: {
    async state(newVal) {
      // console.log('state changed', newVal)
      if (newVal === 'loading') {
        // This is an internal change - nothing to do.
      } else if (newVal === 'complete') {
        // console.log('Complete, stop observer')
        this.stopObserver()
      } else {
        const parentEl = this.target || document.documentElement
        const prevHeight = parentEl.scrollHeight

        // Tick to ensure that this.visible is up to date.
        await nextTick()

        if (newVal === 'loaded' && this.top) {
          // console.log('Adjust scrollTop')
          parentEl.scrollTop = parentEl.scrollHeight - prevHeight
        }

        if (newVal === 'loaded' && this.visible) {
          // We loaded some more, but it's still visible.  So try again.  That will result in another change to
          // the state once complete, and we'll come through here again.
          // console.log('Loaded and still visible')
          await this.emit()
        }
      }
    },
    identifier() {
      // We've been asked to kick the component to reset it.
      this.state = 'ready'
      this.bump++
    },
  },
  async mounted() {
    if (this.firstload) {
      await this.emit()
    }
  },
  methods: {
    async visibilityChanged(isVisible) {
      // console.log('Visibility changed', isVisible)
      this.visible = isVisible

      if (this.state !== 'complete') {
        if (isVisible && this.state === 'loaded') {
          // console.log('Became visible, emit')
          await this.emit()
        }
      } else {
        // console.log('Already complete')
      }
    },
    emit() {
      this.loading()
      this.$emit('infinite', this)
    },
    loading() {
      this.state = 'loading'
    },
    loaded() {
      this.state = 'loaded'
    },
    complete() {
      this.state = 'complete'
    },
    error() {
      this.state = 'error'
    },
    stopObserver() {
      this.complete = true
    },
  },
}
</script>
