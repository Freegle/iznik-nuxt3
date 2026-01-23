import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JumpingDots from '~/components/JumpingDots.vue'

describe('JumpingDots', () => {
  function createWrapper(props = {}) {
    return mount(JumpingDots, { props })
  }

  describe('rendering', () => {
    it('renders three dots', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.dot')).toHaveLength(3)
    })

    it('renders container with jumping-dots class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.jumping-dots').exists()).toBe(true)
    })
  })

  describe('size prop', () => {
    it.each([
      ['sm', 'jumping-dots--sm'],
      ['md', 'jumping-dots--md'],
      ['lg', 'jumping-dots--lg'],
    ])('applies %s size class as %s', (size, expectedClass) => {
      const wrapper = createWrapper({ size })
      expect(wrapper.find('.jumping-dots').classes()).toContain(expectedClass)
    })

    it('defaults to md size', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.jumping-dots').classes()).toContain(
        'jumping-dots--md'
      )
    })
  })

  describe('dot animation delays', () => {
    it('renders dots with sequential classes for animation delay', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.dot-1').exists()).toBe(true)
      expect(wrapper.find('.dot-2').exists()).toBe(true)
      expect(wrapper.find('.dot-3').exists()).toBe(true)
    })
  })
})
