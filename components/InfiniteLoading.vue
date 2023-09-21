<template>
  <client-only>
    <div
      ref="infiniteLoading"
      :key="bump"
      v-observe-visibility="{
        callback: visibilityChanged,
        intersection: {
          rootMargin: '0px 0px ' + distance + 'px 0px',
        },
      }"
      class="infinite-loader mb-4"
    >
      <slot v-if="state == 'loading'" name="spinner"></slot>
      <slot v-if="state == 'complete'" name="complete"></slot>
      <slot v-if="state == 'error'" name="error"></slot>
    </div>
  </client-only>
</template>
<script>
// Derived from https://github.com/oumoussa98/vue3-infinite-loading.  Reworked radically to allow an async event
// handler, and to make consistent with the rest of this codebase.
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
      timer: null,
    }
  },
  watch: {
    state(newVal) {
      // console.log('state changed', newVal)
      if (newVal === 'loading') {
        // This is an internal change - nothing to do.
      } else if (newVal === 'complete') {
        // console.log('Complete, stop observer')
        this.stopObserver()
      } else {
        const parentEl = this.target || document.documentElement
        const prevHeight = parentEl.scrollHeight

        if (newVal === 'loaded' && this.top) {
          // console.log('Adjust scrollTop')
          parentEl.scrollTop = parentEl.scrollHeight - prevHeight
        }
      }
    },
    identifier() {
      // We've been asked to kick the component to reset it.
      console.log('Bump')
      this.bump++
      this.emit()
    },
  },
  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
  async mounted() {
    if (this.firstload) {
      await this.emit()
    }

    // It would be nice if we didn't need a timer and could be purely event-driven.  But there is no guarantee
    // that what happens in response to our emit will result in all the components being rendered, and although
    // Vue3 has Suspense I can't see an easy way of waiting for all renders to finish.
    this.timer = setTimeout(this.fallback, 100)
  },
  methods: {
    fallback() {
      this.timer = null

      if (this.visible && this.state === 'loaded') {
        // We have loaded and not completed, and yet it's still visible.  We need to do some more.
        // console.log('Fallback emit')
        this.emit()
      }

      this.timer = setTimeout(this.fallback, 100)
    },
    visibilityChanged(isVisible) {
      this.visible = isVisible
    },
    async emit() {
      this.loading()

      // Wait for the next tick otherwise if the event handlers return synchronously we may not end up triggering
      // the watch.
      await this.$nextTick()
      try {
        this.$emit('infinite', this)
      } catch (e) {
        console.error('Error in infinite handler', e)
        this.complete()
      }
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
      this.complete()
    },
  },
}
</script>
