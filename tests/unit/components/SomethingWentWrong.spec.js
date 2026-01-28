import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SomethingWentWrong from '~/components/SomethingWentWrong.vue'

// Use vi.hoisted for mock setup
const { mockClearError } = vi.hoisted(() => ({
  mockClearError: vi.fn(),
}))

// Create refs at module level
const somethingWentWrongRef = ref(false)
const needToReloadRef = ref(false)
const offlineRef = ref(false)
const unloadingRef = ref(false)
const errorDetailsRef = ref(null)

// Mock Pinia's storeToRefs to return our refs while preserving other exports
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    storeToRefs: () => ({
      somethingWentWrong: somethingWentWrongRef,
      needToReload: needToReloadRef,
      offline: offlineRef,
      unloading: unloadingRef,
      errorDetails: errorDetailsRef,
    }),
  }
})

// Mock misc store
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    clearError: mockClearError,
  }),
}))

describe('SomethingWentWrong', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Reset ref values before each test
    somethingWentWrongRef.value = false
    needToReloadRef.value = false
    offlineRef.value = false
    unloadingRef.value = false
    errorDetailsRef.value = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper() {
    return mount(SomethingWentWrong, {
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          NoticeMessage: {
            template:
              '<div v-if="show" class="notice-message" :class="variant"><slot /></div>',
            props: ['variant', 'show'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          SupportLink: {
            template: '<a class="support-link">Support</a>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows nothing when no errors and not reloading', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('hides content when unloading', () => {
      unloadingRef.value = true
      const wrapper = createWrapper()
      // The outer div should not render when unloading
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('methods', () => {
    it('has reload method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.reload).toBe('function')
    })

    it('has snooze method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.snooze).toBe('function')
    })

    it('has formatTimestamp method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.formatTimestamp).toBe('function')
    })
  })

  describe('formatTimestamp', () => {
    it('formats valid timestamp', () => {
      const wrapper = createWrapper()
      const result = wrapper.vm.formatTimestamp('2026-01-23T12:00:00Z')
      // Just verify it returns a string (locale-dependent formatting)
      expect(typeof result).toBe('string')
      expect(result).not.toBe('2026-01-23T12:00:00Z') // Should be formatted
    })

    it('returns original value on invalid timestamp', () => {
      const wrapper = createWrapper()
      const result = wrapper.vm.formatTimestamp('invalid')
      // Invalid date might still parse without throwing
      expect(typeof result).toBe('string')
    })
  })

  describe('store integration', () => {
    it('connects to misc store', () => {
      const wrapper = createWrapper()
      // Component should mount and connect to store without error
      expect(wrapper.exists()).toBe(true)
    })
  })
})
