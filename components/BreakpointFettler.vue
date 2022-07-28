<template>
  <span>
    <span ref="xs" className="d-block d-sm-none" />
    <span ref="sm" className="d-none d-sm-block d-md-none" />
    <span ref="md" className="d-none d-md-block d-lg-none" />
    <span ref="lg" className="d-none d-lg-block d-xl-none" />
    <span ref="xl" className="d-none d-xl-block" />
    <span ref="xxl" className="d-none d-xxl-block" />
  </span>
</template>
<script>
import ResizeObserver from 'resize-observer-polyfill'
import { useMiscStore } from '~/stores/misc'

export default {
  mounted() {
    // Spot when the elements become visible/hidden.
    const ro = new ResizeObserver(this.check)
    ;['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((breakpoint) => {
      ro.observe(this.$refs[breakpoint])
    })

    this.check()
  },
  methods: {
    check() {
      const miscStore = useMiscStore()
      const oldBreakpoint = miscStore.breakpoint
      let currentBreakpoint = oldBreakpoint
      ;['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((breakpoint) => {
        if (this.$refs[breakpoint]) {
          if (getComputedStyle(this.$refs[breakpoint]).display === 'block') {
            // This breakpoint is visible and is therefore the current one.
            currentBreakpoint = breakpoint
          }
        }

        if (currentBreakpoint !== oldBreakpoint) {
          miscStore.setBreakpoint(currentBreakpoint)
        }
      })
    },
  },
}
</script>
