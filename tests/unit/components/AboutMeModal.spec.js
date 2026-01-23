import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import AboutMeModal from '~/components/AboutMeModal.vue'

// Mock the auth store
const mockSaveAboutMe = vi.fn().mockResolvedValue({})
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      aboutme: { text: 'Initial about me text' },
    },
    saveAboutMe: mockSaveAboutMe,
  }),
}))

// Mock the useOurModal composable - modal must be a ref for template ref binding
const mockHide = vi.fn()
const mockModal = ref({ show: vi.fn(), hide: mockHide })
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

describe('AboutMeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(AboutMeModal, {
      props,
      global: {
        stubs: {
          'b-modal': {
            template: '<div class="modal"><slot /><slot name="footer" /></div>',
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder', 'rows'],
          },
          'b-button': {
            template:
              '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
          },
          'v-icon': true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('displays "Complete your public profile" when not in review mode', () => {
      const wrapper = createWrapper({ review: false })
      expect(wrapper.text()).toContain('Complete your public profile')
      expect(wrapper.text()).toContain(
        'Tell other freeglers a bit about yourself'
      )
    })

    it('displays "Review your public profile" when in review mode', () => {
      const wrapper = createWrapper({ review: true })
      expect(wrapper.text()).toContain('Review your public profile')
      expect(wrapper.text()).toContain('Check this still applies')
    })

    it('shows suggestions section', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Ideas:')
      expect(wrapper.text()).toContain('Why you freegle')
      expect(wrapper.text()).toContain('Collection arrangements')
      expect(wrapper.text()).toContain('Hobbies & interests')
    })

    it('shows info hint about public visibility', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This is public')
      expect(wrapper.text()).toContain('visible on your profile')
    })

    it('initializes textarea with user aboutme text', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('Initial about me text')
    })
  })

  describe('cancel button', () => {
    it('shows "Skip for now" when not in review mode', () => {
      const wrapper = createWrapper({ review: false })
      expect(wrapper.text()).toContain('Skip for now')
    })

    it('shows "No changes" when in review mode', () => {
      const wrapper = createWrapper({ review: true })
      expect(wrapper.text()).toContain('No changes')
    })

    it('calls hide when cancel button is clicked', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const cancelBtn = buttons.find((b) => b.text().includes('Skip'))
      await cancelBtn.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('save button', () => {
    it('displays Save button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Save')
    })

    it('calls saveAboutMe and emits dataChange when save is clicked', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const saveBtn = buttons.find((b) => b.text().includes('Save'))
      await saveBtn.trigger('click')
      await flushPromises()

      expect(mockSaveAboutMe).toHaveBeenCalledWith('Initial about me text')
      expect(wrapper.emitted('dataChange')).toBeTruthy()
      expect(mockHide).toHaveBeenCalled()
    })

    it('saves updated text when textarea is modified', async () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('textarea')
      await textarea.setValue('New about me text')

      const buttons = wrapper.findAll('button')
      const saveBtn = buttons.find((b) => b.text().includes('Save'))
      await saveBtn.trigger('click')
      await flushPromises()

      expect(mockSaveAboutMe).toHaveBeenCalledWith('New about me text')
    })
  })

  describe('props', () => {
    it('accepts review prop as boolean', () => {
      const wrapper = createWrapper({ review: true })
      expect(wrapper.props('review')).toBe(true)
    })

    it('defaults review to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('review')).toBe(false)
    })
  })
})
