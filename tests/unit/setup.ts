import { vi, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

// ============================================
// GLOBAL STUBS (applied to all tests)
// ============================================
config.global.stubs = {
  // Stub bootstrap-vue-next components
  'b-button': {
    template:
      '<button :disabled="disabled" :class="variant"><slot /></button>',
    props: ['variant', 'disabled', 'size'],
  },
  'b-card': {
    template:
      '<div class="card"><slot /><slot name="header" /><slot name="footer" /></div>',
  },

  // Stub FontAwesome
  'v-icon': { template: '<i :class="icon"></i>', props: ['icon'] },

  // Stub NuxtLink
  NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
}

// ============================================
// RESET BETWEEN TESTS
// ============================================
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})
