import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DebugLogsModal from '~/components/DebugLogsModal.vue'

const mockLogs = ref([])
const mockClear = vi.fn()
const mockShow = vi.fn()
const mockHide = vi.fn()

vi.mock('~/stores/debug', () => ({
  useDebugStore: () => ({
    logs: mockLogs.value,
    clear: mockClear,
    getLogsAsText: 'log1\nlog2',
  }),
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

describe('DebugLogsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogs.value = []
  })

  function createWrapper() {
    return mount(DebugLogsModal, {
      global: {
        stubs: {
          'b-modal': {
            template: `<div class="b-modal">
              <slot name="default"></slot>
              <slot name="footer"></slot>
            </div>`,
            props: ['scrollable', 'title', 'size', 'fullscreen'],
            emits: ['hidden'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('shows log count', () => {
      mockLogs.value = [
        { timestamp: Date.now(), level: 'INFO', message: 'Test' },
        { timestamp: Date.now(), level: 'DEBUG', message: 'Test 2' },
      ]
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('2 log entries')
    })

    it('shows no logs message when empty', () => {
      mockLogs.value = []
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('No logs yet')
    })

    it('shows Copy button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Copy')
    })

    it('shows Clear button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Clear')
    })

    it('shows Close button in footer', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('log display', () => {
    it('displays log entries', () => {
      mockLogs.value = [
        { timestamp: Date.now(), level: 'INFO', message: 'Info message' },
      ]
      const wrapper = createWrapper()
      expect(wrapper.find('.log-entry').exists()).toBe(true)
    })

    it('shows log level', () => {
      mockLogs.value = [
        { timestamp: Date.now(), level: 'ERROR', message: 'Error!' },
      ]
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('[ERROR]')
    })

    it('shows log message', () => {
      mockLogs.value = [
        {
          timestamp: Date.now(),
          level: 'DEBUG',
          message: 'Debug message here',
        },
      ]
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Debug message here')
    })

    it('applies log level class', () => {
      mockLogs.value = [
        { timestamp: Date.now(), level: 'ERROR', message: 'Error' },
      ]
      const wrapper = createWrapper()
      expect(wrapper.find('.log-error').exists()).toBe(true)
    })

    it('reverses log order (newest first)', () => {
      mockLogs.value = [
        { timestamp: 1, level: 'INFO', message: 'First' },
        { timestamp: 2, level: 'INFO', message: 'Second' },
      ]
      const wrapper = createWrapper()
      const entries = wrapper.findAll('.log-entry')
      expect(entries[0].text()).toContain('Second')
    })
  })

  describe('actions', () => {
    it('clears logs when Clear clicked', async () => {
      const wrapper = createWrapper()
      const clearButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Clear'))

      await clearButton.trigger('click')

      expect(mockClear).toHaveBeenCalled()
    })

    it('hides modal when Close clicked', async () => {
      const wrapper = createWrapper()
      const closeButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))

      await closeButton.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })

    it('shows modal on mount', () => {
      createWrapper()
      expect(mockShow).toHaveBeenCalled()
    })
  })

  describe('emits', () => {
    it('emits hidden event defined', () => {
      const wrapper = createWrapper()
      // Verify the component has the hidden emit defined
      expect(wrapper.vm.$options.emits).toContain('hidden')
    })
  })
})
