// We have some cases where components only get rendered conditionally, e.g. v-if.  The conventional way to handle
// this is to use $nextTick, but we've seen examples where it takes more than one tick to render.
//
// Another approach is to emit events when the component is ready.  But this potentially requires us to ripple the
// event up a component tree, which is quite clunky.
//
// So we have a cheap and cheerful poll timer.
//
// TODO MINOR But this should use promises rather than callbacks.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin({
    methods: {
      waitForRef(name, callback) {
        // When a component is conditional using a v-if, it sometimes takes more than one tick for it to appear.  So
        // we have a bit of a timer.
        if (this.$refs[name]) {
          setTimeout(() => {
            callback.apply(this)
          })
        } else {
          setTimeout(() => {
            this.waitForRef(name, callback)
          }, 100)
        }
      },
    },
  })
})
