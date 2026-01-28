import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageListUpToDate from '~/components/MessageListUpToDate.vue'

describe('MessageListUpToDate', () => {
  function createWrapper() {
    return mount(MessageListUpToDate, {
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon" class="check-icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders divider container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.up-to-date-divider').exists()).toBe(true)
    })

    it('displays "You\'re up to date" text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("You're up to date")
    })

    it('shows check circle icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="check-circle"]').exists()).toBe(true)
    })

    it('renders two divider lines', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.divider-line')).toHaveLength(2)
    })

    it('renders divider content section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.divider-content').exists()).toBe(true)
    })

    it('has divider text element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.divider-text').exists()).toBe(true)
    })
  })
})
