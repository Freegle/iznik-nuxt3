import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { bootstrapStubs } from '../mocks/bootstrap-stubs'
import ExportChat from '~/components/ExportChat.vue'

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
      props: { chat: defaultChat, ...props },
      global: { stubs: bootstrapStubs },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders chat data: date, name, and show messages button', () => {
      const wrapper = mountExportChat()
      expect(wrapper.text()).toContain('Formatted: 2024-01-15T10:30:00Z')
      expect(wrapper.text()).toContain('Test Chat')
      expect(wrapper.find('button').text()).toBe('Show messages')
    })
  })

  describe('message visibility', () => {
    it('hidden by default, shows all messages with dates when clicked', async () => {
      const wrapper = mountExportChat()
      expect(wrapper.text()).not.toContain('Hello there!')
      expect(wrapper.vm.showMessages).toBe(false)

      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showMessages).toBe(true)
      expect(wrapper.text()).toContain('Hello there!')
      expect(wrapper.text()).toContain('Hi, how are you?')
      expect(wrapper.text()).toContain('Formatted: 2024-01-15T10:31:00Z')
    })
  })

  describe('message rendering', () => {
    it('applies correct CSS classes (prewrap, bg-white) to messages', async () => {
      const wrapper = mountExportChat()
      await wrapper.find('button').trigger('click')
      expect(wrapper.findAll('.prewrap').length).toBe(2)
      expect(wrapper.findAll('.bg-white').length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('handles empty messages array', () => {
      const wrapper = mountExportChat({
        chat: { ...defaultChat, messages: [] },
      })
      expect(wrapper.text()).toContain('Test Chat')
    })

    it.each([
      [{ message: '' }, 'empty message'],
      [{ message: null }, 'null message'],
      [{ message: '<script>alert("xss")</script>' }, 'special characters'],
      [{ message: 'Line 1\nLine 2' }, 'multiline message'],
    ])('handles %s gracefully', async (messageOverride, desc) => {
      const wrapper = mountExportChat({
        chat: {
          ...defaultChat,
          messages: [{ id: 999, date: '2024-01-01', ...messageOverride }],
        },
      })
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('.prewrap').exists()).toBe(true)
    })
  })
})
