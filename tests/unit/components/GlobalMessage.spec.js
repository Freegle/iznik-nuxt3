import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GlobalMessage from '~/components/GlobalMessage.vue'

const mockGet = vi.fn()
const mockSet = vi.fn()
const mockGroups = vi.fn(() => [])

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get: mockGet,
    set: mockSet,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get groups() {
      return mockGroups()
    },
  }),
}))

describe('GlobalMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReturnValue(false)
    mockGroups.mockReturnValue([])
    // Set date to before the active date for tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-05-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper() {
    return mount(GlobalMessage, {
      global: {
        stubs: {
          PrivacyUpdate: {
            template: '<div class="privacy-update" />',
          },
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :class="$attrs.class" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'href', 'target', 'title'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('always renders PrivacyUpdate component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.privacy-update').exists()).toBe(true)
    })
  })

  describe('relevantGroup computed', () => {
    it('returns false when date is after active date', () => {
      vi.setSystemTime(new Date('2025-07-01'))
      const wrapper = createWrapper()
      expect(wrapper.vm.relevantGroup).toBe(false)
    })

    it('returns false when user has no groups', () => {
      mockGroups.mockReturnValue([])
      const wrapper = createWrapper()
      expect(wrapper.vm.relevantGroup).toBe(false)
    })

    it('returns false when user groups do not match', () => {
      mockGroups.mockReturnValue([{ groupid: 99999, added: '2024-10-01' }])
      const wrapper = createWrapper()
      expect(wrapper.vm.relevantGroup).toBe(false)
    })

    it('returns true when user has relevant group and joined after cutoff', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      const wrapper = createWrapper()
      expect(wrapper.vm.relevantGroup).toBe(true)
    })

    it('returns false when user has relevant group but joined before cutoff', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-01-01' }])
      const wrapper = createWrapper()
      expect(wrapper.vm.relevantGroup).toBe(false)
    })
  })

  describe('show computed', () => {
    it('returns true when warning not hidden', () => {
      mockGet.mockReturnValue(false)
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      const wrapper = createWrapper()
      expect(wrapper.vm.show).toBe(true)
    })

    it('returns false when warning is hidden', () => {
      mockGet.mockReturnValue(true)
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      const wrapper = createWrapper()
      expect(wrapper.vm.show).toBe(false)
    })
  })

  describe('hide functionality', () => {
    it('shows card when relevantGroup and not hidden', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      mockGet.mockReturnValue(false)
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('hides card when hidden', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      mockGet.mockReturnValue(true)
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })

    it('shows "Show notice" link when hidden', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      mockGet.mockReturnValue(true)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show notice')
    })
  })

  describe('hideIt method', () => {
    it('calls miscStore.set with correct key and value', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      mockGet.mockReturnValue(false)
      const wrapper = createWrapper()

      const event = { preventDefault: vi.fn() }
      wrapper.vm.hideIt(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(mockSet).toHaveBeenCalledWith({
        key: 'hideglobalwarning20250530',
        value: true,
      })
    })
  })

  describe('showit method', () => {
    it('calls miscStore.set with false to show notice', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      mockGet.mockReturnValue(true)
      const wrapper = createWrapper()

      wrapper.vm.showit()

      expect(mockSet).toHaveBeenCalledWith({
        key: 'hideglobalwarning20250530',
        value: false,
      })
    })
  })

  describe('store interactions', () => {
    it('checks miscStore for hidden state', () => {
      mockGroups.mockReturnValue([{ groupid: 126719, added: '2024-10-01' }])
      createWrapper()
      expect(mockGet).toHaveBeenCalledWith('hideglobalwarning20250530')
    })
  })
})
