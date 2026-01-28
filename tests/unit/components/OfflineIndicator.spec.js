import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OfflineIndicator from '~/components/OfflineIndicator.vue'

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(OfflineIndicator, {
      global: {
        stubs: {
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :class="$attrs.class" />',
            props: ['icon', 'size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders pulsate container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('renders stacked icon container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.stacked').exists()).toBe(true)
    })

    it('renders cloud icon', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.v-icon')
      const cloudIcon = icons.find(
        (icon) => icon.attributes('data-icon') === 'cloud'
      )
      expect(cloudIcon.exists()).toBe(true)
    })

    it('renders ban icon', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.v-icon')
      const banIcon = icons.find(
        (icon) => icon.attributes('data-icon') === 'ban'
      )
      expect(banIcon.exists()).toBe(true)
    })

    it('displays Offline text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Offline')
    })
  })

  describe('icon styling', () => {
    it('cloud icon has text-white class', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.v-icon')
      const cloudIcon = icons.find(
        (icon) => icon.attributes('data-icon') === 'cloud'
      )
      expect(cloudIcon.classes()).toContain('text-white')
    })

    it('ban icon has text-danger class', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.v-icon')
      const banIcon = icons.find(
        (icon) => icon.attributes('data-icon') === 'ban'
      )
      expect(banIcon.classes()).toContain('text-danger')
    })

    it('ban icon has marg class', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.v-icon')
      const banIcon = icons.find(
        (icon) => icon.attributes('data-icon') === 'ban'
      )
      expect(banIcon.classes()).toContain('marg')
    })
  })

  describe('accessibility', () => {
    it('has title attribute on stacked div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.stacked').attributes('title')).toBe(
        'Network is offline'
      )
    })
  })

  describe('structure', () => {
    it('has two icons', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.v-icon').length).toBe(2)
    })

    it('renders as static component with no props', () => {
      const wrapper = createWrapper()
      expect(wrapper.props()).toEqual({})
    })
  })
})
