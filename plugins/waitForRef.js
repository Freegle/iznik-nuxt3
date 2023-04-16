// We have some cases where components only get rendered conditionally, e.g. v-if.  The conventional way to handle
// this is to use $nextTick, but we've seen examples where it takes more than one tick to render.
//
// Another approach is to emit events when the component is ready.  But this potentially requires us to ripple the
// event up a component tree, which is quite clunky.
//
// So we have a cheap and cheerful poll timer.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin({
    methods: {
      waitForRefTimer(name, resolve) {
        if (this.$refs[name]) {
          resolve()
        } else {
          setTimeout(() => {
            this.waitForRefTimer(name, resolve)
          }, 100)
        }
      },
      waitForRef(name) {
        // When a component is conditional using a v-if, it sometimes takes more than one tick for it to appear.  So
        // we have a bit of a timer.
        return new Promise((resolve) => {
          this.waitForRefTimer(name, resolve)
        })
      },
    },
  })
})
