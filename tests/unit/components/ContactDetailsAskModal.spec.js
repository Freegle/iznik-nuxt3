import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ContactDetailsAskModal from '~/components/ContactDetailsAskModal.vue'

const mockSaveAndGet = vi.fn()
const mockMe = vi.fn()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveAndGet: mockSaveAndGet,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    get me() {
      return { value: mockMe() }
    },
  }),
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
  }),
}))

describe('ContactDetailsAskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.mockReturnValue({ settings: { mylocation: null } })
    mockSaveAndGet.mockResolvedValue({})
  })

  function createWrapper() {
    return mount(ContactDetailsAskModal, {
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="b-modal">
                <div class="modal-title">{{ title }}</div>
                <slot />
              </div>
            `,
            props: ['title', 'scrollable', 'size', 'noStacking'],
          },
          'b-form-group': {
            template:
              '<div class="form-group"><label>{{ label }}</label><slot /></div>',
            props: ['label', 'labelFor', 'description'],
          },
          PostCode: {
            template:
              '<input class="postcode" @change="$emit(\'selected\', { id: 1, name: \'AB1 2CD\' })" />',
            emits: ['selected'],
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

    it('has title "Contact details"', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Contact details')
    })

    it('explains postcode usage', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('postcode')
      expect(wrapper.text()).toContain('how far away')
    })

    it('mentions privacy', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("won't show this")
      expect(wrapper.text()).toContain('approximate distance')
    })

    it('renders PostCode component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.postcode').exists()).toBe(true)
    })

    it('shows lock icon for privacy', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('shows privacy message near postcode', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("Other freeglers won't see this")
    })
  })

  describe('form group', () => {
    it('has postcode label', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.form-group label').text()).toBe('Your postcode:')
    })
  })
})
