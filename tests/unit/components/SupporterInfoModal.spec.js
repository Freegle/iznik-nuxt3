import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SupporterInfoModal from '~/components/SupporterInfoModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockMiscGet = vi.fn()
const mockMiscSet = vi.fn()
const mockSaveMicrovolunteering = vi.fn()

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get: mockMiscGet,
    set: mockMiscSet,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveMicrovolunteering: mockSaveMicrovolunteering,
  }),
}))

describe('SupporterInfoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscGet.mockReturnValue(false)
  })

  function createWrapper() {
    return mount(SupporterInfoModal, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot /><slot name="footer" /></div>',
            props: ['scrollable', 'hideHeader', 'contentClass'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button :class="variant" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'disabled'],
          },
          DonationButton: {
            template: '<div class="donation-button" />',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('renders trophy icon in header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="trophy"]').exists()).toBe(true)
    })

    it('renders header title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Freegle Supporters')
    })

    it('renders header subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'Help keep Freegle running - with money or time'
      )
    })

    it('renders intro text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("We're free to use, but not free to run")
    })

    it('renders donate money option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Donate money')
    })

    it('renders donate time option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Donate time')
    })

    it('renders DonationButton component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-button').exists()).toBe(true)
    })
  })

  describe('icons', () => {
    it('renders hand-holding-heart icon for donate money', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.v-icon[data-icon="hand-holding-heart"]').exists()
      ).toBe(true)
    })

    it('renders clock icon for donate time', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="clock"]').exists()).toBe(true)
    })

    it('renders award icon for badge info', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="award"]').exists()).toBe(true)
    })
  })

  describe('badge info section', () => {
    it('displays badge reward info', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Supporters get a badge for a year')
    })

    it('mentions turning off ads', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('turn off ads for a month')
    })
  })

  describe('volunteer button', () => {
    it('shows Volunteer text when not microvolunteering', () => {
      mockMiscGet.mockReturnValue(false)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Volunteer')
    })

    it('shows Thanks for helping text when already microvolunteering', () => {
      mockMiscGet.mockReturnValue(true)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Thanks for helping!')
    })

    it('button is disabled when already microvolunteering', () => {
      mockMiscGet.mockReturnValue(true)
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const volunteerBtn = buttons.find(
        (b) => b.text().includes('Thanks') || b.text().includes('Volunteer')
      )
      expect(volunteerBtn.attributes('disabled')).toBeDefined()
    })

    it('button is enabled when not microvolunteering', () => {
      mockMiscGet.mockReturnValue(false)
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const volunteerBtn = buttons.find((b) => b.text().includes('Volunteer'))
      expect(volunteerBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('donateTime method', () => {
    it('sets microvolunteeringinviteaccepted in misc store', async () => {
      mockMiscGet.mockReturnValue(false)
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const volunteerBtn = buttons.find((b) => b.text().includes('Volunteer'))

      await volunteerBtn.trigger('click')

      expect(mockMiscSet).toHaveBeenCalledWith({
        key: 'microvolunteeringinviteaccepted',
        value: expect.any(Number),
      })
    })

    it('calls saveMicrovolunteering with Basic level', async () => {
      mockMiscGet.mockReturnValue(false)
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const volunteerBtn = buttons.find((b) => b.text().includes('Volunteer'))

      await volunteerBtn.trigger('click')

      expect(mockSaveMicrovolunteering).toHaveBeenCalledWith('Basic')
    })
  })

  describe('close functionality', () => {
    it('renders close button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Close')
    })

    it('calls hide when close button clicked', async () => {
      const wrapper = createWrapper()
      const closeBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))

      await closeBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('amMicroVolunteering computed', () => {
    it('returns false when not microvolunteering', () => {
      mockMiscGet.mockReturnValue(false)
      const wrapper = createWrapper()
      expect(wrapper.vm.amMicroVolunteering).toBe(false)
    })

    it('returns true when microvolunteering', () => {
      mockMiscGet.mockReturnValue(Date.now())
      const wrapper = createWrapper()
      expect(wrapper.vm.amMicroVolunteering).toBe(true)
    })
  })
})
