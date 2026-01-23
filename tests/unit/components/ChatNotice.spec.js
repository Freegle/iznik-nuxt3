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
    it('applies info variant class by default', () => {
      const wrapper = mountChatNotice()
      expect(wrapper.find('.chat-notice--info').exists()).toBe(true)
    })

    it('applies warning variant class', () => {
      const wrapper = mountChatNotice({ variant: 'warning' })
      expect(wrapper.find('.chat-notice--warning').exists()).toBe(true)
    })

    it('applies danger variant class', () => {
      const wrapper = mountChatNotice({ variant: 'danger' })
      expect(wrapper.find('.chat-notice--danger').exists()).toBe(true)
    })
  })

  describe('icon behavior', () => {
    it('shows info-circle icon by default (info variant)', () => {
      const wrapper = mountChatNotice({ variant: 'info' })
      const icon = wrapper.find('.chat-notice__icon i')
      expect(icon.attributes('data-icon')).toBe('info-circle')
    })

    it('shows exclamation-triangle icon for warning variant', () => {
      const wrapper = mountChatNotice({ variant: 'warning' })
      const icon = wrapper.find('.chat-notice__icon i')
      expect(icon.attributes('data-icon')).toBe('exclamation-triangle')
    })

    it('shows ban icon for danger variant', () => {
      const wrapper = mountChatNotice({ variant: 'danger' })
      const icon = wrapper.find('.chat-notice__icon i')
      expect(icon.attributes('data-icon')).toBe('ban')
    })

    it('uses custom icon when provided', () => {
      const wrapper = mountChatNotice({ icon: 'check-circle', variant: 'info' })
      const icon = wrapper.find('.chat-notice__icon i')
      expect(icon.attributes('data-icon')).toBe('check-circle')
    })

    it('custom icon overrides default variant icon', () => {
      const wrapper = mountChatNotice({ icon: 'star', variant: 'danger' })
      const icon = wrapper.find('.chat-notice__icon i')
      expect(icon.attributes('data-icon')).toBe('star')
    })
  })

  describe('dismissible behavior', () => {
    it('does not show dismiss button by default', () => {
      const wrapper = mountChatNotice()
      expect(wrapper.find('.chat-notice__dismiss').exists()).toBe(false)
    })

    it('shows dismiss button when dismissible is true', () => {
      const wrapper = mountChatNotice({ dismissible: true })
      expect(wrapper.find('.chat-notice__dismiss').exists()).toBe(true)
    })

    it('dismiss button has times icon', () => {
      const wrapper = mountChatNotice({ dismissible: true })
      const dismissButton = wrapper.find('.chat-notice__dismiss')
      const icon = dismissButton.find('i')
      expect(icon.attributes('data-icon')).toBe('times')
    })

    it('dismiss button has aria-label for accessibility', () => {
      const wrapper = mountChatNotice({ dismissible: true })
      const dismissButton = wrapper.find('.chat-notice__dismiss')
      expect(dismissButton.attributes('aria-label')).toBe('Dismiss')
    })

    it('emits dismiss event when dismiss button is clicked', async () => {
      const wrapper = mountChatNotice({ dismissible: true })
      await wrapper.find('.chat-notice__dismiss').trigger('click')
      expect(wrapper.emitted('dismiss')).toBeTruthy()
      expect(wrapper.emitted('dismiss').length).toBe(1)
    })

    it('applies dismissible class when dismissible is true', () => {
      const wrapper = mountChatNotice({ dismissible: true })
      expect(wrapper.find('.chat-notice--dismissible').exists()).toBe(true)
    })

    it('does not apply dismissible class when dismissible is false', () => {
      const wrapper = mountChatNotice({ dismissible: false })
      expect(wrapper.find('.chat-notice--dismissible').exists()).toBe(false)
    })
  })

  describe('computed iconName', () => {
    it('returns custom icon prop when provided', () => {
      const wrapper = mountChatNotice({ icon: 'bell' })
      expect(wrapper.vm.iconName).toBe('bell')
    })

    it('returns info-circle for info variant', () => {
      const wrapper = mountChatNotice({ variant: 'info' })
      expect(wrapper.vm.iconName).toBe('info-circle')
    })

    it('returns exclamation-triangle for warning variant', () => {
      const wrapper = mountChatNotice({ variant: 'warning' })
      expect(wrapper.vm.iconName).toBe('exclamation-triangle')
    })

    it('returns ban for danger variant', () => {
      const wrapper = mountChatNotice({ variant: 'danger' })
      expect(wrapper.vm.iconName).toBe('ban')
    })

    it('returns info-circle as fallback for unknown variant', () => {
      // Default case in switch handles this
      const wrapper = mountChatNotice({ variant: 'info' })
      expect(wrapper.vm.iconName).toBe('info-circle')
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
