import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageSkeleton from '~/components/MessageSkeleton.vue'

describe('MessageSkeleton', () => {
  function createWrapper() {
    return mount(MessageSkeleton)
  }

  describe('rendering', () => {
    it('renders skeleton container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.message-skeleton').exists()).toBe(true)
    })

    it('renders photo area placeholder', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.skeleton-photo-area').exists()).toBe(true)
    })

    it('renders content section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.skeleton-content').exists()).toBe(true)
    })

    it('renders title line', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.skeleton-line--title').exists()).toBe(true)
    })

    it('renders text lines', () => {
      const wrapper = createWrapper()
      const textLines = wrapper.findAll('.skeleton-line--text')
      expect(textLines.length).toBe(2)
    })

    it('renders short text line', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.skeleton-line--short').exists()).toBe(true)
    })
  })

  describe('structure', () => {
    it('has correct skeleton line hierarchy', () => {
      const wrapper = createWrapper()
      const content = wrapper.find('.skeleton-content')
      expect(content.find('.skeleton-line--title').exists()).toBe(true)
      expect(content.findAll('.skeleton-line').length).toBe(3)
    })

    it('photo area is sibling of content', () => {
      const wrapper = createWrapper()
      const skeleton = wrapper.find('.message-skeleton')
      const children = skeleton.element.children
      expect(children[0].classList.contains('skeleton-photo-area')).toBe(true)
      expect(children[1].classList.contains('skeleton-content')).toBe(true)
    })
  })
})
