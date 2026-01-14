<template>
  <span>
    <span ref="xs" class="d-block d-sm-none" />
    <span ref="sm" class="d-none d-sm-block d-md-none" />
    <span ref="md" class="d-none d-md-block d-lg-none" />
    <span ref="lg" class="d-none d-lg-block d-xl-none" />
    <span ref="xl" class="d-none d-xl-block d-xxl-none" />
    <span ref="xxl" class="d-none d-xxl-block" />
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

// Create a mapping between breakpoint names and their refs
const breakpointRefs = {
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
}

// Get store reference
const miscStore = useMiscStore()

// Function to check which breakpoint is active
function check() {
  const oldBreakpoint = miscStore.breakpoint
  let currentBreakpoint = oldBreakpoint

  // Loop through all breakpoints
  Object.entries(breakpointRefs).forEach(([breakpoint, elementRef]) => {
    const refElement = elementRef.value
    if (refElement && getComputedStyle(refElement).display === 'block') {
      // This breakpoint is visible and is therefore the current one
      currentBreakpoint = breakpoint
    }
  })

  // Only update if the breakpoint has changed
  if (currentBreakpoint !== oldBreakpoint) {
    miscStore.setBreakpoint(currentBreakpoint)
  }
}

// Set up observers when component is mounted
onMounted(() => {
  // Spot when the elements become visible/hidden.
  const ro = new ResizeObserver(check)

  // Add observers to each breakpoint element
  Object.values(breakpointRefs).forEach((elementRef) => {
    const refElement = elementRef.value
    if (refElement) {
      ro.observe(refElement)
    }
  })

  // Initial check
  check()
})
</script>
