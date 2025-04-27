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
<script setup>
import { ref, onMounted } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'
import { useMiscStore } from '~/stores/misc'

// Refs for breakpoint elements
const xs = ref(null)
const sm = ref(null)
const md = ref(null)
const lg = ref(null)
const xl = ref(null)
const xxl = ref(null)

// Get store reference
const miscStore = useMiscStore()

// Function to check which breakpoint is active
function check() {
  const oldBreakpoint = miscStore.breakpoint
  let currentBreakpoint = oldBreakpoint

  ;['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((breakpoint) => {
    // eslint-disable-next-line no-eval
    const refElement = eval(breakpoint).value
    if (refElement) {
      if (getComputedStyle(refElement).display === 'block') {
        // This breakpoint is visible and is therefore the current one.
        currentBreakpoint = breakpoint
      }
    }

    if (currentBreakpoint !== oldBreakpoint) {
      miscStore.setBreakpoint(currentBreakpoint)
    }
  })
}

// Set up observers when component is mounted
onMounted(() => {
  // Spot when the elements become visible/hidden.
  const ro = new ResizeObserver(check)
  ;['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((breakpoint) => {
    // eslint-disable-next-line no-eval
    const refElement = eval(breakpoint).value
    if (refElement) {
      ro.observe(refElement)
    }
  })

  check()
})
</script>
