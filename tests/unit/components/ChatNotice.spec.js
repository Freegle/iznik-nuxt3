import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatNotice from '~/components/ChatNotice.vue'

describe('ChatNotice', () => {
  function mountChatNotice(props = {}, slots = {}) {
    return mount(ChatNotice, {
      props,
      slots,
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders the notice container', () => {
      const wrapper = mountChatNotice()
      expect(wrapper.find('.chat-notice').exists()).toBe(true)
    })

    it('renders slot content in the text area', () => {
      const wrapper = mountChatNotice({}, { default: 'This is a test message' })
      expect(wrapper.find('.chat-notice__text').text()).toBe(
        'This is a test message'
      )
    })

    it('renders title when provided', () => {
      const wrapper = mountChatNotice({ title: 'Important Notice' })
      expect(wrapper.find('.chat-notice__title').exists()).toBe(true)
      expect(wrapper.find('.chat-notice__title').text()).toBe(
        'Important Notice'
      )
    })

    it('does not render title when not provided', () => {
      const wrapper = mountChatNotice()
      expect(wrapper.find('.chat-notice__title').exists()).toBe(false)
    })

    it('renders icon area', () => {
      const wrapper = mountChatNotice()
      expect(wrapper.find('.chat-notice__icon').exists()).toBe(true)
    })
  })

  describe('variants', () => {
    it.each([
      [undefined, 'info'],
      ['warning', 'warning'],
      ['danger', 'danger'],
    ])('applies %s variant class as chat-notice--%s', (variant, expected) => {
      const wrapper = mountChatNotice(variant ? { variant } : {})
      expect(wrapper.find(`.chat-notice--${expected}`).exists()).toBe(true)
    })
  })

  describe('icon behavior', () => {
    it.each([
      ['info', undefined, 'info-circle'],
      ['warning', undefined, 'exclamation-triangle'],
      ['danger', undefined, 'ban'],
      ['info', 'check-circle', 'check-circle'],
      ['danger', 'star', 'star'],
    ])('variant=%s with icon=%s shows %s', (variant, icon, expected) => {
      const wrapper = mountChatNotice({ variant, ...(icon && { icon }) })
      expect(wrapper.find('.chat-notice__icon i').attributes('data-icon')).toBe(
        expected
      )
    })
  })

  describe('dismissible behavior', () => {
    it.each([
      [false, false],
      [true, true],
    ])('dismissible=%s shows dismiss button=%s', (dismissible, visible) => {
      const wrapper = mountChatNotice({ dismissible })
      expect(wrapper.find('.chat-notice__dismiss').exists()).toBe(visible)
      expect(wrapper.find('.chat-notice--dismissible').exists()).toBe(visible)
    })

    it('dismiss button has times icon and aria-label', () => {
      const wrapper = mountChatNotice({ dismissible: true })
      const dismissButton = wrapper.find('.chat-notice__dismiss')
      expect(dismissButton.find('i').attributes('data-icon')).toBe('times')
      expect(dismissButton.attributes('aria-label')).toBe('Dismiss')
    })

    it('emits dismiss event when dismiss button is clicked', async () => {
      const wrapper = mountChatNotice({ dismissible: true })
      await wrapper.find('.chat-notice__dismiss').trigger('click')
      expect(wrapper.emitted('dismiss')).toHaveLength(1)
    })
  })

  describe('combined usage', () => {
    it('renders all features together correctly', () => {
      const wrapper = mountChatNotice(
        {
          variant: 'warning',
          title: 'Warning Title',
          icon: 'exclamation-circle',
          dismissible: true,
        },
        { default: 'Warning message content' }
      )

      expect(wrapper.find('.chat-notice--warning').exists()).toBe(true)
      expect(wrapper.find('.chat-notice__title').text()).toBe('Warning Title')
      expect(wrapper.find('.chat-notice__text').text()).toBe(
        'Warning message content'
      )
      expect(wrapper.find('.chat-notice__icon i').attributes('data-icon')).toBe(
        'exclamation-circle'
      )
      expect(wrapper.find('.chat-notice__dismiss').exists()).toBe(true)
    })
  })
})
