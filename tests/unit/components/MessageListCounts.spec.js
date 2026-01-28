import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageListCounts from '~/components/MessageListCounts.vue'

describe('MessageListCounts', () => {
  function createWrapper(props = {}) {
    return mount(MessageListCounts, {
      props: {
        count: 5,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders when count > 0', () => {
      const wrapper = createWrapper({ count: 5 })
      expect(wrapper.find('.unread-divider').exists()).toBe(true)
    })

    it('does not render when count is 0', () => {
      const wrapper = createWrapper({ count: 0 })
      expect(wrapper.find('.unread-divider').exists()).toBe(false)
    })

    it('shows icon', () => {
      const wrapper = createWrapper({ count: 3 })
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('shows mark seen button', () => {
      const wrapper = createWrapper({ count: 3 })
      expect(wrapper.find('.mark-seen-btn').exists()).toBe(true)
      expect(wrapper.find('.mark-seen-btn').text()).toBe('Mark seen')
    })

    it('shows divider lines', () => {
      const wrapper = createWrapper({ count: 3 })
      expect(wrapper.findAll('.divider-line').length).toBe(2)
    })
  })

  describe('count display', () => {
    it('shows singular when count is 1', () => {
      const wrapper = createWrapper({ count: 1 })
      expect(wrapper.find('.unread-text').text()).toBe('1 unread post')
    })

    it('shows plural when count > 1', () => {
      const wrapper = createWrapper({ count: 5 })
      expect(wrapper.find('.unread-text').text()).toBe('5 unread posts')
    })

    it('caps browseCount at 99 for display logic', () => {
      const wrapper = createWrapper({ count: 150 })
      // browseCount is min(99, count) but text uses actual count
      expect(wrapper.find('.unread-text').text()).toBe('150 unread posts')
    })

    it('shows zero count in text when applicable', () => {
      const wrapper = createWrapper({ count: 0 })
      // Component doesn't render when count is 0, so no text to check
      expect(wrapper.find('.unread-divider').exists()).toBe(false)
    })
  })

  describe('events', () => {
    it('emits markSeen when button clicked', async () => {
      const wrapper = createWrapper({ count: 5 })
      await wrapper.find('.mark-seen-btn').trigger('click')
      expect(wrapper.emitted('markSeen')).toBeTruthy()
      expect(wrapper.emitted('markSeen').length).toBe(1)
    })
  })

  describe('props', () => {
    it('defaults count to 0', () => {
      const wrapper = mount(MessageListCounts, {
        global: {
          stubs: {
            'v-icon': {
              template: '<span class="v-icon" />',
              props: ['icon'],
            },
          },
        },
      })
      expect(wrapper.props('count')).toBe(0)
    })

    it('accepts count prop', () => {
      const wrapper = createWrapper({ count: 42 })
      expect(wrapper.props('count')).toBe(42)
    })
  })
})
