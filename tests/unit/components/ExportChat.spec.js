import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExportChat from '~/components/ExportChat.vue'

// Mock the dateonly function from useTimeFormat
vi.mock('~/composables/useTimeFormat', () => ({
  dateonly: vi.fn((date) => `Formatted: ${date}`),
}))

describe('ExportChat', () => {
  const defaultChat = {
    id: 1,
    date: '2024-01-15T10:30:00Z',
    name: 'Test Chat',
    messages: [
      { id: 101, date: '2024-01-15T10:31:00Z', message: 'Hello there!' },
      { id: 102, date: '2024-01-15T10:32:00Z', message: 'Hi, how are you?' },
    ],
  }

  function mountExportChat(props = {}) {
    return mount(ExportChat, {
      props: {
        chat: defaultChat,
        ...props,
      },
      global: {
        stubs: {
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the chat container', () => {
      const wrapper = mountExportChat()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders the chat date', () => {
      const wrapper = mountExportChat()
      expect(wrapper.text()).toContain('Formatted: 2024-01-15T10:30:00Z')
    })

    it('renders the chat name', () => {
      const wrapper = mountExportChat()
      expect(wrapper.text()).toContain('Test Chat')
    })

    it('renders show messages button', () => {
      const wrapper = mountExportChat()
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('Show messages')
    })

    it('has export button', () => {
      const wrapper = mountExportChat()
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('message visibility', () => {
    it('does not show messages by default', () => {
      const wrapper = mountExportChat()
      expect(wrapper.text()).not.toContain('Hello there!')
      expect(wrapper.text()).not.toContain('Hi, how are you?')
    })

    it('shows messages when show button is clicked', async () => {
      const wrapper = mountExportChat()
      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Hello there!')
      expect(wrapper.text()).toContain('Hi, how are you?')
    })

    it('shows all messages with their dates', async () => {
      const wrapper = mountExportChat()
      await wrapper.find('button').trigger('click')

      // Check messages are displayed with their formatted dates
      expect(wrapper.text()).toContain('Formatted: 2024-01-15T10:31:00Z')
      expect(wrapper.text()).toContain('Formatted: 2024-01-15T10:32:00Z')
    })

    it('toggles showMessages state', async () => {
      const wrapper = mountExportChat()
      expect(wrapper.vm.showMessages).toBe(false)

      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showMessages).toBe(true)
    })
  })

  describe('message rendering', () => {
    it('renders messages in correct structure', async () => {
      const wrapper = mountExportChat()
      await wrapper.find('button').trigger('click')

      // Should have row elements for each message
      const rows = wrapper.findAll('.row')
      // First row is the chat header, then messages have their own rows
      expect(rows.length).toBeGreaterThan(1)
    })

    it('applies bg-white class to message rows', async () => {
      const wrapper = mountExportChat()
      await wrapper.find('button').trigger('click')

      const bgWhiteElements = wrapper.findAll('.bg-white')
      expect(bgWhiteElements.length).toBeGreaterThan(0)
    })

    it('applies prewrap class for message text', async () => {
      const wrapper = mountExportChat()
      await wrapper.find('button').trigger('click')

      const prewrapElements = wrapper.findAll('.prewrap')
      expect(prewrapElements.length).toBe(2) // Two messages
    })
  })

  describe('with different chat data', () => {
    it('renders chat with no messages', () => {
      const emptyChat = {
        id: 2,
        date: '2024-01-16T12:00:00Z',
        name: 'Empty Chat',
        messages: [],
      }
      const wrapper = mountExportChat({ chat: emptyChat })

      expect(wrapper.text()).toContain('Empty Chat')
      expect(wrapper.text()).toContain('Formatted: 2024-01-16T12:00:00Z')
    })

    it('handles chat with single message', async () => {
      const singleMessageChat = {
        id: 3,
        date: '2024-01-17T08:00:00Z',
        name: 'Single Message Chat',
        messages: [
          { id: 201, date: '2024-01-17T08:05:00Z', message: 'Only message' },
        ],
      }
      const wrapper = mountExportChat({ chat: singleMessageChat })
      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Only message')
    })

    it('handles multiline messages with prewrap', async () => {
      const multilineChat = {
        id: 4,
        date: '2024-01-18T14:00:00Z',
        name: 'Multiline Chat',
        messages: [
          {
            id: 301,
            date: '2024-01-18T14:01:00Z',
            message: 'Line 1\nLine 2\nLine 3',
          },
        ],
      }
      const wrapper = mountExportChat({ chat: multilineChat })
      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Line 1\nLine 2\nLine 3')
    })
  })

  describe('props', () => {
    it('accepts required chat prop', () => {
      const wrapper = mountExportChat()
      expect(wrapper.props('chat')).toEqual(defaultChat)
    })

    it('uses chat.id for message keys', async () => {
      const chatWithDifferentIds = {
        id: 999,
        date: '2024-01-20T09:00:00Z',
        name: 'Keyed Chat',
        messages: [
          { id: 501, date: '2024-01-20T09:01:00Z', message: 'First' },
          { id: 502, date: '2024-01-20T09:02:00Z', message: 'Second' },
        ],
      }
      const wrapper = mountExportChat({ chat: chatWithDifferentIds })
      await wrapper.find('button').trigger('click')

      // The component uses v-for with :key="message.id"
      // We verify the messages render correctly
      expect(wrapper.text()).toContain('First')
      expect(wrapper.text()).toContain('Second')
    })
  })

  describe('edge cases', () => {
    it('handles empty message text', async () => {
      const chatWithEmpty = {
        id: 5,
        date: '2024-01-21T11:00:00Z',
        name: 'Chat with empty',
        messages: [{ id: 601, date: '2024-01-21T11:01:00Z', message: '' }],
      }
      const wrapper = mountExportChat({ chat: chatWithEmpty })
      await wrapper.find('button').trigger('click')

      // Should not crash with empty message
      expect(wrapper.find('.prewrap').exists()).toBe(true)
    })

    it('handles special characters in messages', async () => {
      const chatWithSpecial = {
        id: 6,
        date: '2024-01-22T13:00:00Z',
        name: 'Special Chat',
        messages: [
          {
            id: 701,
            date: '2024-01-22T13:01:00Z',
            message: '<script>alert("xss")</script>',
          },
        ],
      }
      const wrapper = mountExportChat({ chat: chatWithSpecial })
      await wrapper.find('button').trigger('click')

      // Vue escapes HTML by default in text interpolation
      expect(wrapper.text()).toContain('<script>')
    })

    it('handles null/undefined message gracefully', async () => {
      const chatWithNull = {
        id: 7,
        date: '2024-01-23T15:00:00Z',
        name: 'Null Message Chat',
        messages: [{ id: 801, date: '2024-01-23T15:01:00Z', message: null }],
      }
      const wrapper = mountExportChat({ chat: chatWithNull })
      await wrapper.find('button').trigger('click')

      // Should render without crashing
      expect(wrapper.find('.prewrap').exists()).toBe(true)
    })
  })
})
