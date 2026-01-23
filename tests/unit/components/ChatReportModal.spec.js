import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatReportModal from '~/components/ChatReportModal.vue'

// Mock useOurModal
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

// Mock chat store
const mockOpenChatToMods = vi.fn()
const mockReport = vi.fn()
vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    openChatToMods: mockOpenChatToMods,
    report: mockReport,
  }),
}))

describe('ChatReportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOpenChatToMods.mockResolvedValue(999)
  })

  function createWrapper(props = {}) {
    return mount(ChatReportModal, {
      props: {
        user: { displayname: 'Test User' },
        chatid: 123,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" data-testid="modal">
                <div class="modal-title">{{ title }}</div>
                <slot></slot>
                <div class="modal-footer"><slot name="footer"></slot></div>
              </div>
            `,
            props: ['title', 'scrollable', 'size', 'noStacking', 'modalClass'],
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :placeholder="placeholder"></textarea>',
            props: ['modelValue', 'placeholder'],
          },
          GroupSelect: {
            template:
              '<select data-testid="group-select" :value="modelValue" @change="$emit(\'update:modelValue\', parseInt($event.target.value))"><option value="1">Group 1</option></select>',
            props: ['modelValue'],
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

    it('shows modal with correct title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Oh dear...')
    })

    it('displays apology message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("Sorry you're having trouble")
    })

    it('shows group selection question', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Which community is this about?')
    })

    it('shows reason selection question', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Why are you reporting this?')
    })

    it('shows reason options', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please choose')
      expect(wrapper.text()).toContain('Spam')
      expect(wrapper.text()).toContain('Something else')
    })

    it('shows comments question', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("What's wrong?")
    })

    it('shows Close button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Close')
    })

    it('shows Send Report button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Send Report')
    })

    it('renders GroupSelect component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-testid="group-select"]').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires user prop', () => {
      const wrapper = createWrapper({ user: { displayname: 'Jane Doe' } })
      expect(wrapper.props('user').displayname).toBe('Jane Doe')
    })

    it('requires chatid prop', () => {
      const wrapper = createWrapper({ chatid: 456 })
      expect(wrapper.props('chatid')).toBe(456)
    })
  })

  describe('close action', () => {
    it('calls hide when Close is clicked', async () => {
      const wrapper = createWrapper()
      const closeBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))
      await closeBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('send report action', () => {
    it('does not send if groupid is missing', async () => {
      const wrapper = createWrapper()

      // Set reason and comments but not groupid
      await wrapper.find('select').setValue('Spam')
      await wrapper.find('textarea').setValue('Test comment')

      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send Report'))
      await sendBtn.trigger('click')

      expect(mockOpenChatToMods).not.toHaveBeenCalled()
      expect(mockReport).not.toHaveBeenCalled()
    })

    it('does not send if reason is missing', async () => {
      const wrapper = createWrapper()

      // Set groupid and comments but not reason
      await wrapper
        .find('[data-testid="group-select"]')
        .setValue('1')
        .catch(() => {})
      await wrapper.find('textarea').setValue('Test comment')

      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send Report'))
      await sendBtn.trigger('click')

      // Report shouldn't be called without proper reason
      expect(mockReport).not.toHaveBeenCalled()
    })

    it('does not send if comments is missing', async () => {
      const wrapper = createWrapper()

      // Set groupid and reason but not comments
      await wrapper
        .find('[data-testid="group-select"]')
        .setValue('1')
        .catch(() => {})
      await wrapper.find('select').setValue('Spam')

      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send Report'))
      await sendBtn.trigger('click')

      expect(mockReport).not.toHaveBeenCalled()
    })
  })

  describe('form inputs', () => {
    it('has a textarea for comments with placeholder', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      expect(textarea.attributes('placeholder')).toContain(
        'Please tell us what'
      )
    })

    it('has a reason select with options', () => {
      const wrapper = createWrapper()
      const select = wrapper.find('select')
      expect(select.exists()).toBe(true)
    })
  })
})
