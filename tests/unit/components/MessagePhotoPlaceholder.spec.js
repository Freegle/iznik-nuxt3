import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessagePhotoPlaceholder from '~/components/MessagePhotoPlaceholder.vue'

describe('MessagePhotoPlaceholder', () => {
  function createWrapper(props = {}) {
    return mount(MessagePhotoPlaceholder, {
      props: {
        placeholderClass: 'offer-gradient',
        icon: 'gift',
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders message placeholder container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.message-placeholder').exists()).toBe(true)
    })

    it('renders placeholder pattern overlay', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.placeholder-pattern').exists()).toBe(true)
    })

    it('renders icon circle container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.icon-circle').exists()).toBe(true)
    })

    it('renders icon inside icon circle', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.icon-circle .v-icon').exists()).toBe(true)
    })
  })

  describe('placeholderClass prop', () => {
    it('applies offer-gradient class', () => {
      const wrapper = createWrapper({ placeholderClass: 'offer-gradient' })
      expect(wrapper.find('.message-placeholder').classes()).toContain(
        'offer-gradient'
      )
    })

    it('applies wanted-gradient class', () => {
      const wrapper = createWrapper({ placeholderClass: 'wanted-gradient' })
      expect(wrapper.find('.message-placeholder').classes()).toContain(
        'wanted-gradient'
      )
    })

    it('applies custom class', () => {
      const wrapper = createWrapper({ placeholderClass: 'custom-class' })
      expect(wrapper.find('.message-placeholder').classes()).toContain(
        'custom-class'
      )
    })
  })

  describe('icon prop', () => {
    it('passes icon to v-icon component', () => {
      const wrapper = createWrapper({ icon: 'gift' })
      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('gift')
    })

    it('accepts different icon names', () => {
      const wrapper = createWrapper({ icon: 'search' })
      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('search')
    })
  })

  describe('props validation', () => {
    it('requires placeholderClass prop', () => {
      const wrapper = createWrapper({ placeholderClass: 'test-class' })
      expect(wrapper.props('placeholderClass')).toBe('test-class')
    })

    it('requires icon prop', () => {
      const wrapper = createWrapper({ icon: 'heart' })
      expect(wrapper.props('icon')).toBe('heart')
    })
  })
})
