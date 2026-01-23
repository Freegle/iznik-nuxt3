import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { modalBootstrapStubs } from '../mocks/bootstrap-stubs'
import ChatReportModal from '~/components/ChatReportModal.vue'

const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

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
          ...modalBootstrapStubs,
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
    it('shows modal with title, questions, and buttons', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Oh dear...')
      expect(wrapper.text()).toContain("Sorry you're having trouble")
      expect(wrapper.text()).toContain('Which community is this about?')
      expect(wrapper.text()).toContain('Why are you reporting this?')
      expect(wrapper.text()).toContain("What's wrong?")
      expect(wrapper.text()).toContain('Close')
      expect(wrapper.text()).toContain('Send Report')
    })

    it('renders GroupSelect and form inputs', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-testid="group-select"]').exists()).toBe(true)
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('select').exists()).toBe(true)
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

  describe('send report validation', () => {
    it('does not send report without required fields', async () => {
      const wrapper = createWrapper()
      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send Report'))
      await sendBtn.trigger('click')
      expect(mockReport).not.toHaveBeenCalled()
    })
  })
})
