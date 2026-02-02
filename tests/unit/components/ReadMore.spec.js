import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReadMore from '~/components/ReadMore.vue'

describe('ReadMore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ReadMore, {
      props: {
        text: 'This is a short text',
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders a div container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders paragraph with text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('p').exists()).toBe(true)
    })

    it('displays full text when under maxChars', () => {
      const wrapper = createWrapper({ text: 'Short text', maxChars: 100 })
      expect(wrapper.text()).toContain('Short text')
    })
  })

  describe('truncation', () => {
    it('truncates text when over maxChars', () => {
      const longText =
        'This is a very long text that should be truncated because it exceeds the maximum character limit'
      const wrapper = createWrapper({ text: longText, maxChars: 20 })
      expect(wrapper.vm.formattedString).toBe('This is a very long ...')
    })

    it('shows full text when exactly at maxChars', () => {
      const wrapper = createWrapper({
        text: '12345678901234567890',
        maxChars: 20,
      })
      expect(wrapper.vm.formattedString).toBe('12345678901234567890')
    })

    it('adds ellipsis when truncated', () => {
      const wrapper = createWrapper({
        text: 'abcdefghijklmnopqrstuvwxyz',
        maxChars: 10,
      })
      expect(wrapper.vm.formattedString).toContain('...')
    })
  })

  describe('read more link', () => {
    it('shows read more link when text exceeds maxChars', () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({ text: longText, maxChars: 100 })
      const readMoreLink = wrapper.find('#readmore')
      expect(readMoreLink.exists()).toBe(true)
    })

    it('hides read more link when text is under maxChars', () => {
      const wrapper = createWrapper({ text: 'Short', maxChars: 100 })
      // When text is under maxChars, v-show hides the span containing the links
      // Check that the condition text.length > maxChars is false
      expect(wrapper.props('text').length > wrapper.props('maxChars')).toBe(
        false
      )
      // The span with v-show should have display: none style
      const linkContainer = wrapper.find('p > span')
      expect(linkContainer.attributes('style')).toContain('display: none')
    })

    it('displays moreStr text on read more link', () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        moreStr: 'Show more',
      })
      expect(wrapper.text()).toContain('Show more')
    })

    it('uses default moreStr of "read more"', () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({ text: longText, maxChars: 100 })
      expect(wrapper.text()).toContain('read more')
    })
  })

  describe('read more interaction', () => {
    it('expands text when read more is clicked', async () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        lessStr: 'Show less',
      })

      // Initially truncated
      expect(wrapper.vm.isReadMore).toBe(false)
      expect(wrapper.vm.formattedString.length).toBeLessThan(longText.length)

      // Click read more
      await wrapper.find('#readmore').trigger('click')

      // Now expanded
      expect(wrapper.vm.isReadMore).toBe(true)
      expect(wrapper.vm.formattedString).toBe(longText)
    })

    it('collapses text when read less is clicked', async () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        lessStr: 'Show less',
      })

      // Expand
      await wrapper.find('#readmore').trigger('click')
      expect(wrapper.vm.isReadMore).toBe(true)

      // Find and click the "read less" link (second link)
      const links = wrapper.findAll('#readmore')
      await links[1].trigger('click')

      expect(wrapper.vm.isReadMore).toBe(false)
    })

    it('prevents default when link is #', () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        link: '#',
      })

      const event = { preventDefault: vi.fn() }

      wrapper.vm.triggerReadMore(event, true)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('does not prevent default when link is not #', () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        link: '/some-page',
      })

      const event = { preventDefault: vi.fn() }

      wrapper.vm.triggerReadMore(event, true)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('requires text prop', () => {
      const wrapper = createWrapper({ text: 'Test text' })
      expect(wrapper.props('text')).toBe('Test text')
    })

    it('has moreStr prop defaulting to "read more"', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('moreStr')).toBe('read more')
    })

    it('has lessStr prop defaulting to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('lessStr')).toBe('')
    })

    it('has link prop defaulting to #', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('link')).toBe('#')
    })

    it('has maxChars prop defaulting to 100', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('maxChars')).toBe(100)
    })

    it('accepts custom moreStr', () => {
      const wrapper = createWrapper({ moreStr: 'Continue reading' })
      expect(wrapper.props('moreStr')).toBe('Continue reading')
    })

    it('accepts custom lessStr', () => {
      const wrapper = createWrapper({ lessStr: 'Collapse' })
      expect(wrapper.props('lessStr')).toBe('Collapse')
    })

    it('accepts custom link', () => {
      const wrapper = createWrapper({ link: '/details' })
      expect(wrapper.props('link')).toBe('/details')
    })

    it('accepts custom maxChars', () => {
      const wrapper = createWrapper({ maxChars: 50 })
      expect(wrapper.props('maxChars')).toBe(50)
    })
  })

  describe('computed formattedString', () => {
    it('returns full text when not truncated and isReadMore is false', () => {
      const wrapper = createWrapper({ text: 'Short', maxChars: 100 })
      expect(wrapper.vm.formattedString).toBe('Short')
    })

    it('returns full text when isReadMore is true', async () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        lessStr: 'less',
      })

      await wrapper.find('#readmore').trigger('click')

      expect(wrapper.vm.formattedString).toBe(longText)
    })

    it('returns truncated text with ellipsis when over maxChars', () => {
      const wrapper = createWrapper({
        text: 'This is a longer text that needs truncation',
        maxChars: 10,
      })
      expect(wrapper.vm.formattedString).toBe('This is a ...')
    })
  })

  describe('link href', () => {
    it('sets href to # by default', () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({ text: longText, maxChars: 100 })
      expect(wrapper.find('#readmore').attributes('href')).toBe('#')
    })

    it('sets custom href when provided', () => {
      const longText = 'A'.repeat(150)
      const wrapper = createWrapper({
        text: longText,
        maxChars: 100,
        link: '/read-full',
      })
      expect(wrapper.find('#readmore').attributes('href')).toBe('/read-full')
    })
  })
})
