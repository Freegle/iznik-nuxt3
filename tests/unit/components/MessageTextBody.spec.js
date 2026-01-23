import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageTextBody from '~/components/MessageTextBody.vue'

// Mock message store
const mockByIdFn = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockByIdFn,
  }),
}))

// Mock twem composable
vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

describe('MessageTextBody', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockByIdFn.mockReturnValue({
      id: 123,
      textbody: 'This is a test message body',
      matchedon: null,
    })
  })

  function createWrapper(props = {}) {
    return mount(MessageTextBody, {
      props: { id: 123, ...props },
    })
  }

  describe('rendering without matchedon', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders span with message body when no matchedon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.prewrap.forcebreak').exists()).toBe(true)
    })

    it('displays the message text body', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This is a test message body')
    })

    it('does not render Highlighter when no matchedon', () => {
      const wrapper = createWrapper()
      // When no matchedon, no highlight marks should exist
      expect(wrapper.find('mark.highlight').exists()).toBe(false)
    })
  })

  describe('rendering with matchedon', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({
        id: 123,
        textbody: 'Looking for a bicycle',
        matchedon: { word: 'bicycle' },
      })
    })

    it('renders Highlighter when matchedon exists', () => {
      const wrapper = createWrapper()
      // Highlighter renders with prewrap class (from component) and mark.highlight for matches
      expect(wrapper.find('span.prewrap').exists()).toBe(true)
    })

    it('does not render regular span when matchedon exists', () => {
      const wrapper = createWrapper()
      // The forcebreak class is only on the non-Highlighter span
      expect(wrapper.find('.prewrap.forcebreak').exists()).toBe(false)
    })

    it('highlights the matched word', () => {
      const wrapper = createWrapper()
      const highlight = wrapper.find('mark.highlight')
      expect(highlight.exists()).toBe(true)
      expect(highlight.text()).toBe('bicycle')
    })

    it('displays full text with highlighting', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('Looking for a bicycle')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const props = MessageTextBody.props
      expect(props.id.required).toBe(true)
    })

    it('id prop is Number type', () => {
      const props = MessageTextBody.props
      expect(props.id.type).toBe(Number)
    })
  })

  describe('computed safeBody', () => {
    it('returns processed text body', () => {
      mockByIdFn.mockReturnValue({
        id: 123,
        textbody: 'Hello world',
        matchedon: null,
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.safeBody).toBe('Hello world')
    })
  })

  describe('with different messages', () => {
    it('handles message with emoji', () => {
      mockByIdFn.mockReturnValue({
        id: 456,
        textbody: 'Great item! 😀',
        matchedon: null,
      })
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.text()).toContain('Great item!')
    })

    it('handles empty text body', () => {
      mockByIdFn.mockReturnValue({
        id: 789,
        textbody: '',
        matchedon: null,
      })
      const wrapper = createWrapper({ id: 789 })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
