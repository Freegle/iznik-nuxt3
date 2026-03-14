import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockSpammerStore } from '../../mocks/stores'
import ModSpammerReport from '~/modtools/components/ModSpammerReport.vue'

// Create mock store instance
const mockSpammerStore = createMockSpammerStore()

// Mock hide function that tests can spy on
const mockHide = vi.fn()
const mockShow = vi.fn()

// Mock the spammer store import - component uses ~/stores/spammer which maps to modtools/stores/spammer
vi.mock('~/stores/spammer', () => ({
  useSpammerStore: () => mockSpammerStore,
}))

// Override the global useOurModal mock with our custom spy
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

describe('ModSpammerReport', () => {
  const defaultUser = {
    id: 123,
    displayname: 'Test User',
  }

  function mountComponent(props = {}) {
    return mount(ModSpammerReport, {
      props: {
        user: defaultUser,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal" :data-title="title"><slot name="default" /><slot name="footer" /></div>',
            props: ['title', 'size', 'noStacking', 'id'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
            props: ['modelValue', 'placeholder'],
          },
          'b-button': {
            template:
              '<button :variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock store methods
    mockSpammerStore.report.mockResolvedValue({})
    mockSpammerStore.safelist.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the textarea for reason input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('has Cancel button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Cancel')
    })
  })

  describe('props', () => {
    it('accepts safelist prop defaulting to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('safelist')).toBe(false)
    })

    it('accepts safelist prop as true', () => {
      const wrapper = mountComponent({ safelist: true })
      expect(wrapper.props('safelist')).toBe(true)
    })
  })

  describe('when safelist is false (Report Spammer mode)', () => {
    it('displays "Report Spammer" in title', () => {
      const wrapper = mountComponent({ safelist: false })
      // The title is passed to b-modal as data-title attribute
      const modal = wrapper.find('.modal')
      expect(modal.attributes('data-title')).toContain('Report Spammer')
      expect(modal.attributes('data-title')).toContain('Test User')
    })

    it('displays warning about not reporting single spam messages', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).toContain(
        "Please don't report someone as a spammer just because they have sent a single spam message"
      )
    })

    it('displays information about multi-joiners', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).toContain('Members may join many groups')
    })

    it('displays information about mail spoofing', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).toContain('Mail can be spoofed')
    })

    it('displays requirement for clear intent', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).toContain('clear intent to deliberately spam/scam')
    })

    it('has link to wiki', () => {
      const wrapper = mountComponent({ safelist: false })
      const link = wrapper.find('.external-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toContain('wiki.ilovefreegle.org')
    })

    it('displays review notice', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).toContain('Spammer reports will be reviewed')
    })

    it('displays delete warning', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).toContain(
        'Please do not delete a post until the Spam team'
      )
    })

    it('has Send Report button', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).toContain('Send Report')
    })

    it('does not have Add to Safelist button', () => {
      const wrapper = mountComponent({ safelist: false })
      expect(wrapper.text()).not.toContain('Add to Safelist')
    })
  })

  describe('when safelist is true (Safelist mode)', () => {
    it('displays "Add to Safelist" in title', () => {
      const wrapper = mountComponent({ safelist: true })
      const modal = wrapper.find('.modal')
      expect(modal.attributes('data-title')).toContain('Add to Safelist')
      expect(modal.attributes('data-title')).toContain('Test User')
    })

    it('displays safelist guidance', () => {
      const wrapper = mountComponent({ safelist: true })
      expect(wrapper.text()).toContain('You should only safelist people')
    })

    it('displays information about legitimate reasons', () => {
      const wrapper = mountComponent({ safelist: true })
      expect(wrapper.text()).toContain(
        'legitimate reason to join many communities'
      )
    })

    it('does not display spammer warning content', () => {
      const wrapper = mountComponent({ safelist: true })
      expect(wrapper.text()).not.toContain(
        "Please don't report someone as a spammer"
      )
    })

    it('has Add to Safelist button', () => {
      const wrapper = mountComponent({ safelist: true })
      expect(wrapper.text()).toContain('Add to Safelist')
    })

    it('does not have Send Report button', () => {
      const wrapper = mountComponent({ safelist: true })
      expect(wrapper.text()).not.toContain('Send Report')
    })
  })

  describe('common content', () => {
    it('displays reason visibility notice', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'This reason will be visible to other moderators'
      )
    })

    it('has placeholder on textarea', () => {
      const wrapper = mountComponent()
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('placeholder')).toBe('Enter a reason')
    })
  })

  describe('send functionality', () => {
    it('does not call store if reason is empty', async () => {
      const wrapper = mountComponent({ safelist: false })

      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).not.toHaveBeenCalled()
      expect(mockSpammerStore.safelist).not.toHaveBeenCalled()
    })

    it('does not call store if reason is null', async () => {
      const wrapper = mountComponent({ safelist: false })
      wrapper.vm.reason = null

      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).not.toHaveBeenCalled()
    })

    it('calls spammerStore.report when safelist is false and reason is provided', async () => {
      const wrapper = mountComponent({
        user: { id: 789, displayname: 'Spammer User' },
        safelist: false,
      })

      wrapper.vm.reason = 'This is clearly a scammer'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).toHaveBeenCalledWith({
        userid: 789,
        reason: 'This is clearly a scammer',
      })
    })

    it('calls spammerStore.safelist when safelist is true and reason is provided', async () => {
      const wrapper = mountComponent({
        user: { id: 456, displayname: 'Safe User' },
        safelist: true,
      })

      wrapper.vm.reason = 'Works across UK for Freegle'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.safelist).toHaveBeenCalledWith({
        userid: 456,
        reason: 'Works across UK for Freegle',
      })
    })

    it('calls hide after successful report', async () => {
      const wrapper = mountComponent({ safelist: false })

      wrapper.vm.reason = 'Spam reason'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockHide).toHaveBeenCalled()
    })

    it('calls hide after successful safelist', async () => {
      const wrapper = mountComponent({ safelist: true })

      wrapper.vm.reason = 'Safelist reason'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockHide).toHaveBeenCalled()
    })

    it('uses user.id when available', async () => {
      const wrapper = mountComponent({
        user: { id: 111, displayname: 'User with id' },
        safelist: false,
      })

      wrapper.vm.reason = 'Test reason'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).toHaveBeenCalledWith({
        userid: 111,
        reason: 'Test reason',
      })
    })

    it('uses user.userid as fallback when user.id is not available', async () => {
      const wrapper = mountComponent({
        user: { userid: 222, displayname: 'User with userid' },
        safelist: false,
      })

      wrapper.vm.reason = 'Test reason'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).toHaveBeenCalledWith({
        userid: 222,
        reason: 'Test reason',
      })
    })

    it('prefers user.id over user.userid when both present', async () => {
      const wrapper = mountComponent({
        user: { id: 333, userid: 444, displayname: 'User with both' },
        safelist: false,
      })

      wrapper.vm.reason = 'Test reason'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).toHaveBeenCalledWith({
        userid: 333,
        reason: 'Test reason',
      })
    })
  })

  describe('modal functionality', () => {
    it('exposes modal from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.modal).toBeDefined()
    })

    it('exposes hide from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.hide).toBeDefined()
    })

    it('calls hide when Cancel button clicked', async () => {
      const wrapper = mountComponent()
      // Find the Cancel button (first button)
      const buttons = wrapper.findAll('button')
      const cancelButton = buttons.find((b) => b.text() === 'Cancel')

      await cancelButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('user interactions', () => {
    it('updates reason when typing in textarea', async () => {
      const wrapper = mountComponent()
      const textarea = wrapper.find('textarea')

      await textarea.setValue('New reason text')

      expect(wrapper.vm.reason).toBe('New reason text')
    })

    it('clicking Send Report button calls send method', async () => {
      const wrapper = mountComponent({ safelist: false })
      wrapper.vm.reason = 'A valid reason'

      const buttons = wrapper.findAll('button')
      const sendButton = buttons.find((b) => b.text() === 'Send Report')

      await sendButton.trigger('click')
      await flushPromises()

      expect(mockSpammerStore.report).toHaveBeenCalled()
    })

    it('clicking Add to Safelist button calls send method', async () => {
      const wrapper = mountComponent({ safelist: true })
      wrapper.vm.reason = 'A valid reason'

      const buttons = wrapper.findAll('button')
      const safelistButton = buttons.find((b) => b.text() === 'Add to Safelist')

      await safelistButton.trigger('click')
      await flushPromises()

      expect(mockSpammerStore.safelist).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles user with only displayname', () => {
      const wrapper = mountComponent({
        user: { displayname: 'Display Only User' },
      })
      expect(wrapper.props('user').displayname).toBe('Display Only User')
    })

    it('handles empty reason string (truthy check)', async () => {
      const wrapper = mountComponent({ safelist: false })
      wrapper.vm.reason = ''

      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).not.toHaveBeenCalled()
    })

    it('handles whitespace-only reason (truthy check)', async () => {
      const wrapper = mountComponent({ safelist: false })
      wrapper.vm.reason = '   '

      await wrapper.vm.send()
      await flushPromises()

      // Whitespace is truthy, so it should call the store
      expect(mockSpammerStore.report).toHaveBeenCalled()
    })

    it('handles user.id being 0 (nullish coalescing uses 0)', async () => {
      const wrapper = mountComponent({
        user: { id: 0, userid: 999, displayname: 'Zero ID User' },
        safelist: false,
      })

      wrapper.vm.reason = 'Test reason'
      await wrapper.vm.send()
      await flushPromises()

      // The component uses ?? (nullish coalescing), so 0 is used (not null/undefined)
      expect(mockSpammerStore.report).toHaveBeenCalledWith({
        userid: 0,
        reason: 'Test reason',
      })
    })

    it('handles user.id being undefined', async () => {
      const wrapper = mountComponent({
        user: { userid: 555, displayname: 'No ID User' },
        safelist: false,
      })

      wrapper.vm.reason = 'Test reason'
      await wrapper.vm.send()
      await flushPromises()

      expect(mockSpammerStore.report).toHaveBeenCalledWith({
        userid: 555,
        reason: 'Test reason',
      })
    })
  })

  describe('initial state', () => {
    it('reason starts as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.reason).toBeNull()
    })
  })
})
