import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NationalReuseDayBox from '~/components/NationalReuseDayBox.vue'

describe('NationalReuseDayBox', () => {
  function createWrapper(props = {}) {
    return mount(NationalReuseDayBox, {
      props: {
        title: 'Test Box Title',
        description: 'Test description text',
        url: 'https://example.com/page',
        colour: 'blue',
        ...props,
      },
      global: {
        stubs: {
          ExternalLink: {
            template: '<a :href="href" class="external-link"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders box wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.box-wrapper').exists()).toBe(true)
    })

    it('renders box element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.box').exists()).toBe(true)
    })

    it('shows description text', () => {
      const wrapper = createWrapper({ description: 'My description' })
      expect(wrapper.text()).toContain('My description')
    })

    it('sets title attribute on wrapper', () => {
      const wrapper = createWrapper({ title: 'Box Title' })
      expect(wrapper.find('.box-wrapper').attributes('title')).toBe('Box Title')
    })
  })

  describe('link', () => {
    it('wraps content in external link', () => {
      const wrapper = createWrapper({ url: 'https://test.com' })
      expect(wrapper.find('.external-link').exists()).toBe(true)
    })

    it('links to provided url', () => {
      const wrapper = createWrapper({ url: 'https://freegle.org/page' })
      expect(wrapper.find('.external-link').attributes('href')).toBe(
        'https://freegle.org/page'
      )
    })
  })

  describe('colour classes', () => {
    it('applies blue colour class', () => {
      const wrapper = createWrapper({ colour: 'blue' })
      expect(wrapper.find('.box').classes()).toContain('blue')
    })

    it('applies magenta colour class', () => {
      const wrapper = createWrapper({ colour: 'magenta' })
      expect(wrapper.find('.box').classes()).toContain('magenta')
    })

    it('applies purple colour class', () => {
      const wrapper = createWrapper({ colour: 'purple' })
      expect(wrapper.find('.box').classes()).toContain('purple')
    })

    it('applies gold colour class', () => {
      const wrapper = createWrapper({ colour: 'gold' })
      expect(wrapper.find('.box').classes()).toContain('gold')
    })

    it('applies orange colour class', () => {
      const wrapper = createWrapper({ colour: 'orange' })
      expect(wrapper.find('.box').classes()).toContain('orange')
    })

    it('applies teal colour class', () => {
      const wrapper = createWrapper({ colour: 'teal' })
      expect(wrapper.find('.box').classes()).toContain('teal')
    })
  })

  describe('background image', () => {
    it('sets background image style when image provided', () => {
      const wrapper = createWrapper({ image: '/images/test.jpg' })
      expect(wrapper.find('.box').attributes('style')).toContain(
        'background-image'
      )
      expect(wrapper.find('.box').attributes('style')).toContain(
        '/images/test.jpg'
      )
    })

    it('handles empty image prop', () => {
      const wrapper = createWrapper({ image: '' })
      expect(wrapper.find('.box').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires title prop', () => {
      const wrapper = createWrapper({ title: 'Required Title' })
      expect(wrapper.props('title')).toBe('Required Title')
    })

    it('requires description prop', () => {
      const wrapper = createWrapper({ description: 'Required Description' })
      expect(wrapper.props('description')).toBe('Required Description')
    })

    it('requires url prop', () => {
      const wrapper = createWrapper({ url: 'https://required.url' })
      expect(wrapper.props('url')).toBe('https://required.url')
    })

    it('requires colour prop', () => {
      const wrapper = createWrapper({ colour: 'teal' })
      expect(wrapper.props('colour')).toBe('teal')
    })

    it('defaults image to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('image')).toBe('')
    })
  })
})
