import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import ModMessageEmailModal from '~/modtools/components/ModMessageEmailModal.vue'

// Mock message store
const mockMessageStore = {
  fetchMT: vi.fn(),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

// Mock useOurModal composable
const mockShow = vi.fn()
const mockHide = vi.fn()

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

describe('ModMessageEmailModal', () => {
  function mountComponent(props = {}) {
    return mount(ModMessageEmailModal, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" v-if="true">
                <div class="modal-title"><slot name="title" /></div>
                <div class="modal-body"><slot name="default" /></div>
                <div class="modal-footer"><slot name="footer" /></div>
              </div>
            `,
            props: ['id', 'size'],
            emits: ['hidden'],
          },
          'b-tabs': {
            template: '<div class="tabs"><slot /></div>',
            props: ['contentClass'],
          },
          'b-tab': {
            template: '<div class="tab" :class="{ active }"><slot /></div>',
            props: ['title', 'active'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          NoticeMessage: {
            template: '<div class="notice" :class="variant"><slot /></div>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.fetchMT.mockResolvedValue({
      id: 123,
      message: 'From: test@example.com\nSubject: Test\n\nBody text',
    })
  })

  describe('rendering', () => {
    it('renders the modal component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('displays modal title', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal-title').text()).toContain(
        'Message received by email'
      )
    })

    it('displays explanatory text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Sometimes messages which arrive by')
    })

    it('renders tabs for Pretty View and Raw Message Source', () => {
      const wrapper = mountComponent()
      expect(wrapper.findAll('.tab').length).toBe(2)
    })

    it('displays Close button in footer', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal-footer button').text()).toContain('Close')
    })
  })

  describe('props', () => {
    it('accepts id prop (required)', () => {
      const wrapper = mountComponent({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('accepts collection prop with default null', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('collection')).toBeNull()
    })

    it('accepts collection prop with value', () => {
      const wrapper = mountComponent({ collection: 'Pending' })
      expect(wrapper.props('collection')).toBe('Pending')
    })
  })

  describe('onMounted', () => {
    it('fetches message on mount', async () => {
      mountComponent({ id: 789 })
      await flushPromises()
      expect(mockMessageStore.fetchMT).toHaveBeenCalledWith({
        id: 789,
        messagehistory: true,
      })
    })

    it('stores fetched message in ref', async () => {
      mockMessageStore.fetchMT.mockResolvedValue({
        id: 123,
        message: 'Test message content',
      })
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.vm.message).toEqual({
        id: 123,
        message: 'Test message content',
      })
    })
  })

  describe('computed properties', () => {
    describe('parsed', () => {
      it('returns null when message ref is null', () => {
        const wrapper = mountComponent()
        // Before fetch completes, message is null
        expect(wrapper.vm.parsed).toBeNull()
      })

      it('returns null when message has no message property', async () => {
        mockMessageStore.fetchMT.mockResolvedValue({ id: 123 })
        const wrapper = mountComponent()
        await flushPromises()
        expect(wrapper.vm.parsed).toBeNull()
      })
    })

    describe('text', () => {
      it('returns text from parsed message', async () => {
        mockMessageStore.fetchMT.mockResolvedValue({
          id: 123,
          message: 'Full email',
        })
        const wrapper = mountComponent()
        await flushPromises()
        expect(wrapper.vm.text).toBe('Extracted plain text')
      })

      it('returns null when parsed is null', () => {
        const wrapper = mountComponent()
        // Before mount completes
        expect(wrapper.vm.text).toBeNull()
      })
    })

    describe('html', () => {
      it('returns html from parsed message', async () => {
        mockMessageStore.fetchMT.mockResolvedValue({
          id: 123,
          message: 'Full email',
        })
        const wrapper = mountComponent()
        await flushPromises()
        expect(wrapper.vm.html).toBe('<p>Extracted HTML</p>')
      })

      it('returns null when parsed is null', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.html).toBeNull()
      })
    })
  })

  describe('events', () => {
    it('emits hidden when onHide is called', () => {
      const wrapper = mountComponent()
      wrapper.vm.onHide()
      expect(wrapper.emitted('hidden')).toBeTruthy()
    })
  })

  describe('methods', () => {
    it('exposes show method', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.show).toBe('function')
    })

    it('exposes hide method', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.hide).toBe('function')
    })
  })

  describe('raw message display', () => {
    it('displays raw message in pre tag when available', async () => {
      mockMessageStore.fetchMT.mockResolvedValue({
        id: 123,
        message: 'Raw email content here',
      })
      const wrapper = mountComponent()
      await flushPromises()
      const pre = wrapper.find('pre')
      expect(pre.exists()).toBe(true)
      expect(pre.text()).toContain('Raw email content here')
    })

    it('displays notice message about raw email', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.notice').exists()).toBe(true)
      expect(wrapper.text()).toContain('raw email we received')
    })
  })

  describe('Letter component', () => {
    it('renders Letter component when message exists', async () => {
      mockMessageStore.fetchMT.mockResolvedValue({
        id: 123,
        message: 'Email content',
      })
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.letter').exists()).toBe(true)
    })

    it('passes html and text props to Letter', async () => {
      mockMessageStore.fetchMT.mockResolvedValue({
        id: 123,
        message: 'Email content',
      })
      const wrapper = mountComponent()
      await flushPromises()
      const letter = wrapper.find('.letter')
      expect(letter.attributes('data-html')).toBe('<p>Extracted HTML</p>')
      expect(letter.attributes('data-text')).toBe('Extracted plain text')
    })
  })

  describe('button interactions', () => {
    it('Close button calls hide', async () => {
      const wrapper = mountComponent()
      const closeButton = wrapper.find('.modal-footer button')
      await closeButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles fetch returning null', async () => {
      mockMessageStore.fetchMT.mockResolvedValue(null)
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.vm.message).toBeNull()
    })

    it('handles empty message content', async () => {
      mockMessageStore.fetchMT.mockResolvedValue({
        id: 123,
        message: '',
      })
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.vm.parsed).toBeNull()
    })
  })
})
