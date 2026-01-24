import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JumpingDots from '~/components/JumpingDots.vue'

describe('JumpingDots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(JumpingDots, {
      props: {
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders jumping-dots container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.jumping-dots').exists()).toBe(true)
    })

    it('renders three dots', () => {
      const wrapper = createWrapper()
      const dots = wrapper.findAll('.dot')
      expect(dots.length).toBe(3)
    })

    it('renders dot-1 class on first dot', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.dot-1').exists()).toBe(true)
    })

    it('renders dot-2 class on second dot', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.dot-2').exists()).toBe(true)
    })

    it('renders dot-3 class on third dot', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.dot-3').exists()).toBe(true)
    })
  })

  describe('size variants', () => {
    it('applies md size class by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.jumping-dots').classes()).toContain(
        'jumping-dots--md'
      )
    })

    it('applies sm size class when size is sm', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.find('.jumping-dots').classes()).toContain(
        'jumping-dots--sm'
      )
    })

    it('applies lg size class when size is lg', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.find('.jumping-dots').classes()).toContain(
        'jumping-dots--lg'
      )
    })
  })

  describe('props', () => {
    it('has size prop defaulting to md', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('md')
    })

    it('accepts sm size', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.props('size')).toBe('sm')
    })

    it('accepts lg size', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.props('size')).toBe('lg')
    })
  })

  describe('computed sizeClass', () => {
    it('computes correct class for sm', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.vm.sizeClass).toBe('jumping-dots--sm')
    })

    it('computes correct class for md', () => {
      const wrapper = createWrapper({ size: 'md' })
      expect(wrapper.vm.sizeClass).toBe('jumping-dots--md')
    })

    it('computes correct class for lg', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.vm.sizeClass).toBe('jumping-dots--lg')
    })
  })
})
