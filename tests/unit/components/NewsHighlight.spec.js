import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsHighlight from '~/components/NewsHighlight.vue'

// Mock vue-highlight-words
vi.mock('vue-highlight-words', () => ({
  default: {
    name: 'Highlighter',
    template:
      '<span class="highlighter" :class="highlightClassName">{{ textToHighlight }}</span>',
    props: [
      'searchWords',
      'textToHighlight',
      'highlightClassName',
      'autoEscape',
    ],
  },
}))

describe('NewsHighlight', () => {
  function createWrapper(props = {}) {
    return mount(NewsHighlight, {
      props: {
        text: 'Test text content',
        searchWords: ['test'],
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders highlighter when text provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.highlighter').exists()).toBe(true)
    })

    it('passes text to highlighter', () => {
      const wrapper = createWrapper({ text: 'Hello world' })
      expect(wrapper.find('.highlighter').text()).toContain('Hello world')
    })

    it('does not render highlighter when text is null', () => {
      const wrapper = createWrapper({ text: null })
      expect(wrapper.find('.highlighter').exists()).toBe(false)
    })
  })

  describe('text truncation', () => {
    it('truncates text longer than maxChars', () => {
      const longText = 'a'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
      })
      expect(wrapper.find('.highlighter').text()).toContain('...')
      expect(wrapper.find('.highlighter').text().length).toBeLessThan(150)
    })

    it('shows full text when shorter than maxChars', () => {
      const wrapper = createWrapper({
        text: 'Short text',
        maxChars: 100,
      })
      expect(wrapper.find('.highlighter').text()).toBe('Short text')
    })

    it('shows read more link for long text', () => {
      const longText = 'a'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
      })
      expect(wrapper.find('#readmore').exists()).toBe(true)
    })

    it('does not show read more wrapper for short text', () => {
      const wrapper = createWrapper({
        text: 'Short',
        maxChars: 100,
      })
      // When text is short, the outer span with v-show is hidden
      // The readmore links exist but their parent wrapper is hidden
      const spans = wrapper.findAll('span')
      const readMoreSpan = spans.find(
        (s) =>
          s.text().includes('read more') && s.element.style.display === 'none'
      )
      expect(readMoreSpan).toBeDefined()
    })
  })

  describe('read more functionality', () => {
    it('shows "read more" text by default', () => {
      const longText = 'a'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        moreStr: 'read more',
      })
      expect(wrapper.text()).toContain('read more')
    })

    it('expands text when read more clicked', async () => {
      const longText = 'a'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        lessStr: 'read less',
      })
      const readMoreLink = wrapper.findAll('#readmore')[0]
      await readMoreLink.trigger('click')
      expect(wrapper.find('.highlighter').text()).toBe(longText)
    })

    it('shows less link after expanding', async () => {
      const longText = 'a'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        lessStr: 'read less',
      })
      const readMoreLink = wrapper.findAll('#readmore')[0]
      await readMoreLink.trigger('click')
      expect(wrapper.text()).toContain('read less')
    })
  })

  describe('props', () => {
    it('defaults moreStr to "read more"', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('moreStr')).toBe('read more')
    })

    it('accepts custom moreStr', () => {
      const wrapper = createWrapper({ moreStr: 'show more' })
      expect(wrapper.props('moreStr')).toBe('show more')
    })

    it('defaults lessStr to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('lessStr')).toBe('')
    })

    it('accepts custom lessStr', () => {
      const wrapper = createWrapper({ lessStr: 'show less' })
      expect(wrapper.props('lessStr')).toBe('show less')
    })

    it('requires text prop', () => {
      const wrapper = createWrapper({ text: 'Hello' })
      expect(wrapper.props('text')).toBe('Hello')
    })

    it('defaults link to "#"', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('link')).toBe('#')
    })

    it('accepts custom link', () => {
      const wrapper = createWrapper({ link: '/details' })
      expect(wrapper.props('link')).toBe('/details')
    })

    it('defaults maxChars to 100', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('maxChars')).toBe(100)
    })

    it('accepts custom maxChars', () => {
      const wrapper = createWrapper({ maxChars: 50 })
      expect(wrapper.props('maxChars')).toBe(50)
    })

    it('requires searchWords prop', () => {
      const wrapper = createWrapper({ searchWords: ['word1', 'word2'] })
      expect(wrapper.props('searchWords')).toEqual(['word1', 'word2'])
    })

    it('defaults highlightClassName to "highlight"', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('highlightClassName')).toBe('highlight')
    })
  })

  describe('link behavior', () => {
    it('has href attribute on read more link', () => {
      const longText = 'a'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        link: '/custom-link',
      })
      const readMoreLink = wrapper.findAll('#readmore')[0]
      expect(readMoreLink.attributes('href')).toBe('/custom-link')
    })
  })
})
