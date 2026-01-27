import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClusterIcon from '~/components/ClusterIcon.vue'

describe('ClusterIcon', () => {
  function mountClusterIcon(props = {}) {
    const defaultProps = { count: 5 }
    return mount(ClusterIcon, {
      props: { ...defaultProps, ...props },
    })
  }

  describe('rendering', () => {
    it('renders a div with icon class', () => {
      const wrapper = mountClusterIcon()
      expect(wrapper.find('div.icon').exists()).toBe(true)
    })

    it('displays the count', () => {
      const wrapper = mountClusterIcon({ count: 42 })
      expect(wrapper.text()).toContain('42')
    })

    it('has flex layout classes', () => {
      const wrapper = mountClusterIcon()
      const iconDiv = wrapper.find('.icon')
      expect(iconDiv.classes()).toContain('d-flex')
      expect(iconDiv.classes()).toContain('flex-column')
      expect(iconDiv.classes()).toContain('justify-content-center')
    })
  })

  describe('count display sizing', () => {
    it('applies normal class for counts under 1000', () => {
      const wrapper = mountClusterIcon({ count: 999 })
      const countSpan = wrapper.find('span.normal')
      expect(countSpan.exists()).toBe(true)
    })

    it('applies small class for counts of 1000 or more', () => {
      const wrapper = mountClusterIcon({ count: 1000 })
      const countSpan = wrapper.find('span.small')
      expect(countSpan.exists()).toBe(true)
    })

    it('applies small class for very large counts', () => {
      const wrapper = mountClusterIcon({ count: 9999 })
      const countSpan = wrapper.find('span.small')
      expect(countSpan.exists()).toBe(true)
    })

    it('applies normal class for zero', () => {
      const wrapper = mountClusterIcon({ count: 0 })
      const countSpan = wrapper.find('span.normal')
      expect(countSpan.exists()).toBe(true)
    })
  })

  describe('tag prop and pluralization', () => {
    it('does not show tag when tag is null', () => {
      const wrapper = mountClusterIcon({ count: 5, tag: null })
      expect(wrapper.find('.tag').exists()).toBe(false)
    })

    it('shows tag when provided', () => {
      const wrapper = mountClusterIcon({ count: 5, tag: 'item' })
      expect(wrapper.find('.tag').exists()).toBe(true)
    })

    it('pluralizes tag for count > 1', () => {
      const wrapper = mountClusterIcon({ count: 5, tag: 'item' })
      expect(wrapper.find('.tag').text()).toBe('items')
    })

    it('uses singular form for count = 1', () => {
      const wrapper = mountClusterIcon({ count: 1, tag: 'item' })
      expect(wrapper.find('.tag').text()).toBe('item')
    })

    it('pluralizes irregular nouns correctly', () => {
      const wrapper = mountClusterIcon({ count: 3, tag: 'person' })
      expect(wrapper.find('.tag').text()).toBe('people')
    })

    it('uses plural for count = 0', () => {
      const wrapper = mountClusterIcon({ count: 0, tag: 'item' })
      expect(wrapper.find('.tag').text()).toBe('items')
    })

    it('tag has text-muted class', () => {
      const wrapper = mountClusterIcon({ count: 5, tag: 'item' })
      expect(wrapper.find('.tag').classes()).toContain('text-muted')
    })
  })

  describe('className prop', () => {
    it('applies custom className to icon div', () => {
      const wrapper = mountClusterIcon({ count: 5, className: 'custom-class' })
      expect(wrapper.find('.icon').classes()).toContain('custom-class')
    })

    it('defaults to empty string', () => {
      const wrapper = mountClusterIcon({ count: 5 })
      // Just verify it renders without className - the class list will only have icon and flex classes
      expect(wrapper.find('.icon').exists()).toBe(true)
    })

    it('can apply multiple classes via space-separated string', () => {
      const wrapper = mountClusterIcon({
        count: 5,
        className: 'class-a class-b',
      })
      const iconDiv = wrapper.find('.icon')
      // The whole className string is added as one class attribute value
      expect(iconDiv.attributes('class')).toContain('class-a class-b')
    })
  })

  describe('click event', () => {
    it('emits click event when clicked', async () => {
      const wrapper = mountClusterIcon()
      await wrapper.find('.icon').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('emits click event multiple times on multiple clicks', async () => {
      const wrapper = mountClusterIcon()
      await wrapper.find('.icon').trigger('click')
      await wrapper.find('.icon').trigger('click')
      await wrapper.find('.icon').trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(3)
    })
  })

  describe('edge cases', () => {
    it('handles negative counts', () => {
      const wrapper = mountClusterIcon({ count: -5 })
      expect(wrapper.text()).toContain('-5')
      // Negative is less than 1000, so normal class
      expect(wrapper.find('span.normal').exists()).toBe(true)
    })

    it('handles very large counts', () => {
      const wrapper = mountClusterIcon({ count: 999999 })
      expect(wrapper.text()).toContain('999999')
      expect(wrapper.find('span.small').exists()).toBe(true)
    })
  })
})
