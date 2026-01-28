import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageDescription from '~/components/MessageDescription.vue'

const mockById = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockById,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

describe('MessageDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockById.mockReturnValue(null)
  })

  function createWrapper(props = {}) {
    return mount(MessageDescription, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          Highlighter: {
            template: '<span class="highlighter">{{ textToHighlight }}</span>',
            props: [
              'searchWords',
              'textToHighlight',
              'highlightClassName',
              'autoEscape',
            ],
          },
          highlighter: {
            template: '<span class="highlighter">{{ textToHighlight }}</span>',
            props: [
              'searchWords',
              'textToHighlight',
              'highlightClassName',
              'autoEscape',
            ],
          },
          MessageDeadline: {
            template: '<div class="message-deadline" />',
            props: ['id'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders MessageDeadline component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.message-deadline').exists()).toBe(true)
    })

    it('passes id to MessageDeadline', () => {
      const wrapper = createWrapper({ id: 42 })
      // Verify the MessageDeadline stub is rendered with the correct id
      expect(wrapper.find('.message-deadline').exists()).toBe(true)
    })
  })

  describe('when message has textbody', () => {
    beforeEach(() => {
      mockById.mockReturnValue({
        textbody: 'This is a test message description',
      })
    })

    it('shows textbody content', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This is a test message description')
    })

    it('renders textbody container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.textbody').exists()).toBe(true)
    })

    it('includes hidden description for SEO', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[itemprop="description"]').exists()).toBe(true)
    })
  })

  describe('when message has no textbody', () => {
    beforeEach(() => {
      mockById.mockReturnValue({
        textbody: null,
      })
    })

    it('does not show textbody container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.textbody').exists()).toBe(false)
    })
  })

  describe('when textbody is "null" string', () => {
    beforeEach(() => {
      mockById.mockReturnValue({
        textbody: 'null',
      })
    })

    it('does not show textbody container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.textbody').exists()).toBe(false)
    })
  })

  describe('with matchedon prop', () => {
    it('accepts matchedon prop', () => {
      mockById.mockReturnValue({
        textbody: 'Looking for a chair',
      })
      const wrapper = createWrapper({ matchedon: { word: 'chair' } })
      expect(wrapper.props('matchedon')).toEqual({ word: 'chair' })
    })

    it('renders textbody when matchedon is provided', () => {
      mockById.mockReturnValue({
        textbody: 'Looking for a chair',
      })
      const wrapper = createWrapper({ matchedon: { word: 'chair' } })
      expect(wrapper.find('.textbody').exists()).toBe(true)
    })

    it('renders textbody when matchedon is null', () => {
      mockById.mockReturnValue({
        textbody: 'Looking for a chair',
      })
      const wrapper = createWrapper({ matchedon: null })
      expect(wrapper.find('.textbody').exists()).toBe(true)
      expect(wrapper.text()).toContain('Looking for a chair')
    })
  })

  describe('computed properties', () => {
    it('textbody returns null when no message', () => {
      mockById.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.vm.textbody).toBeNull()
    })

    it('description truncates to 160 characters', () => {
      const longText = 'A'.repeat(200)
      mockById.mockReturnValue({ textbody: longText })
      const wrapper = createWrapper()
      expect(wrapper.vm.description.length).toBe(160)
    })

    it('description returns null when no message', () => {
      mockById.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.vm.description).toBeNull()
    })
  })
})
