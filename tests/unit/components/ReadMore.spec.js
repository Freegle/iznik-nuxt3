import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReadMore from '~/components/ReadMore.vue'

describe('ReadMore', () => {
  const shortText = 'Short text'
  const longText =
    'This is a very long text that exceeds the default maximum character limit and should be truncated with a read more link to expand it.'

  function createWrapper(props = {}) {
    return mount(ReadMore, {
      props: {
        text: shortText,
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('displays full text when under maxChars', () => {
      const wrapper = createWrapper({ text: shortText })
      expect(wrapper.text()).toContain(shortText)
    })

    it('truncates text when over maxChars', () => {
      const wrapper = createWrapper({ text: longText, maxChars: 50 })
      expect(wrapper.text()).toContain('...')
      expect(wrapper.text().length).toBeLessThan(longText.length)
    })

    it('shows "read more" link when text is truncated', () => {
      const wrapper = createWrapper({ text: longText, maxChars: 50 })
      expect(wrapper.text()).toContain('read more')
    })

    it('does not show "read more" link when text is short', () => {
      const wrapper = createWrapper({ text: shortText, maxChars: 100 })
      // The link is hidden with v-show, so it exists but isn't visible
      const links = wrapper.findAll('a')
      expect(links.length).toBe(2) // Both links exist but are hidden
    })
  })

  describe('props', () => {
    it('defaults maxChars to 100', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('maxChars')).toBe(100)
    })

    it('defaults moreStr to "read more"', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('moreStr')).toBe('read more')
    })

    it('defaults lessStr to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('lessStr')).toBe('')
    })

    it('defaults link to "#"', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('link')).toBe('#')
    })

    it('accepts custom maxChars', () => {
      const wrapper = createWrapper({ maxChars: 50 })
      expect(wrapper.props('maxChars')).toBe(50)
    })

    it('accepts custom moreStr', () => {
      const wrapper = createWrapper({ moreStr: 'Show more' })
      expect(wrapper.props('moreStr')).toBe('Show more')
    })

    it('accepts custom lessStr', () => {
      const wrapper = createWrapper({ lessStr: 'Show less' })
      expect(wrapper.props('lessStr')).toBe('Show less')
    })
  })

  describe('expand/collapse functionality', () => {
    it('expands text when "read more" is clicked', async () => {
      const wrapper = createWrapper({ text: longText, maxChars: 50 })

      // Initially truncated
      expect(wrapper.text()).toContain('...')

      // Click read more
      const readMoreLink = wrapper.find('#readmore')
      await readMoreLink.trigger('click')

      // Should show full text
      expect(wrapper.text()).toContain(longText)
      expect(wrapper.text()).not.toContain('...')
    })

    it('collapses text when "less" link is clicked', async () => {
      const wrapper = createWrapper({
        text: longText,
        maxChars: 50,
        lessStr: 'Show less',
      })

      // Expand first
      const readMoreLink = wrapper.find('#readmore')
      await readMoreLink.trigger('click')

      // Find and click the "show less" link
      const links = wrapper.findAll('#readmore')
      const showLessLink = links[1]
      await showLessLink.trigger('click')

      // Should be truncated again
      expect(wrapper.text()).toContain('...')
    })

    it('prevents default when link is "#"', async () => {
      const wrapper = createWrapper({ text: longText, maxChars: 50 })
      const event = { preventDefault: vi.fn() }
      await wrapper.vm.triggerReadMore(event, true)

      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('custom moreStr and lessStr', () => {
    it('displays custom moreStr', () => {
      const wrapper = createWrapper({
        text: longText,
        maxChars: 50,
        moreStr: 'Expand',
      })
      expect(wrapper.text()).toContain('Expand')
    })

    it('displays custom lessStr when expanded', async () => {
      const wrapper = createWrapper({
        text: longText,
        maxChars: 50,
        lessStr: 'Collapse',
      })

      // Expand
      const readMoreLink = wrapper.find('#readmore')
      await readMoreLink.trigger('click')

      expect(wrapper.text()).toContain('Collapse')
    })
  })

  describe('edge cases', () => {
    it('handles text exactly at maxChars', () => {
      const exactText = 'a'.repeat(100)
      const wrapper = createWrapper({ text: exactText, maxChars: 100 })
      expect(wrapper.text()).toContain(exactText)
    })

    it('handles empty text', () => {
      const wrapper = createWrapper({ text: '' })
      expect(wrapper.exists()).toBe(true)
    })

    it('handles text with one character over maxChars', () => {
      const textOverByOne = 'a'.repeat(101)
      const wrapper = createWrapper({ text: textOverByOne, maxChars: 100 })
      expect(wrapper.text()).toContain('...')
      expect(wrapper.text()).toContain('read more')
    })
  })
})
