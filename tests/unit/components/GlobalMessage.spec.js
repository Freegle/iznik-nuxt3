import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GlobalMessage from '~/components/GlobalMessage.vue'

// Mock misc store
const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock auth store
let mockGroups = []

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get groups() {
      return mockGroups
    },
  }),
}))

describe('GlobalMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.get.mockReturnValue(false)
    mockGroups = []
    // Mock Date to a time before the active date (2025-06-22)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper() {
    return mount(GlobalMessage, {
      global: {
        stubs: {
          PrivacyUpdate: {
            template: '<div class="privacy-update"></div>',
          },
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :class="variant" :href="href" :target="target" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'href', 'target'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('always renders PrivacyUpdate component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.privacy-update').exists()).toBe(true)
    })
  })

  describe('group targeting', () => {
    it('does not show banner when user has no relevant groups', () => {
      mockGroups = [{ groupid: 999, added: '2024-10-01' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })

    it('does not show banner when user is in relevant group but joined before cutoff', () => {
      mockGroups = [{ groupid: 126719, added: '2024-08-01' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })

    it('shows banner when user is in relevant group and joined after cutoff', () => {
      mockGroups = [{ groupid: 126719, added: '2024-10-01' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })
  })

  describe('date expiration', () => {
    it('does not show banner after active date expires', () => {
      vi.setSystemTime(new Date('2025-06-23'))
      mockGroups = [{ groupid: 126719, added: '2024-10-01' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })

    it('shows banner before active date expires', () => {
      vi.setSystemTime(new Date('2025-06-21'))
      mockGroups = [{ groupid: 126719, added: '2024-10-01' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })
  })

  describe('hide functionality', () => {
    beforeEach(() => {
      mockGroups = [{ groupid: 126719, added: '2024-10-01' }]
    })

    it('shows card when not hidden', () => {
      mockMiscStore.get.mockReturnValue(false)
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('hides card when hidden', () => {
      mockMiscStore.get.mockReturnValue(true)
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })

    it('shows "Show notice" link when hidden', () => {
      mockMiscStore.get.mockReturnValue(true)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show notice')
    })

    it('clicking Hide button stores hide preference', async () => {
      const wrapper = createWrapper()
      const hideButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Hide')
      await hideButton.trigger('click')
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'hideglobalwarning20250530',
        value: true,
      })
    })

    it('clicking Show notice restores visibility', async () => {
      mockMiscStore.get.mockReturnValue(true)
      const wrapper = createWrapper()
      const showLink = wrapper.find('.text-danger')
      await showLink.trigger('click')
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'hideglobalwarning20250530',
        value: false,
      })
    })
  })

  describe('banner content', () => {
    beforeEach(() => {
      mockGroups = [{ groupid: 126719, added: '2024-10-01' }]
    })

    it('displays survey title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Quick survey')
    })

    it('displays voucher prize', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('£25 voucher')
    })

    it('has survey button', () => {
      const wrapper = createWrapper()
      const surveyButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Click to open survey'))
      expect(surveyButton).toBeTruthy()
    })

    it('survey button links to correct URL', () => {
      const wrapper = createWrapper()
      const surveyButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Click to open survey'))
      expect(surveyButton.attributes('href')).toBe(
        'https://ilovefreegle.org/shortlink/WandsworthSurvey'
      )
    })

    it('survey button opens in new tab', () => {
      const wrapper = createWrapper()
      const surveyButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Click to open survey'))
      expect(surveyButton.attributes('target')).toBe('_blank')
    })
  })
})
