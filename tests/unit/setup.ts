import { vi, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

// ============================================
// GLOBAL MOCKS (provided to template context)
// ============================================
// These functions are auto-imported by Nuxt but need to be provided as mocks in tests
config.global.mocks = {
  // Time formatting functions (from composables/useTimeFormat.js)
  datetimeshort: (val: string) => `formatted:${val}`,
  timeadapt: (val: string) => `adapted:${val}`,
  timeago: (val: string) => `ago:${val}`,
  dateonly: (val: string) => `dateonly:${val}`,
  dateshort: (val: string) => `dateshort:${val}`,
}

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
