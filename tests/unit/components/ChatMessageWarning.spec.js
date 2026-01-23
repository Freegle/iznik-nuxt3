import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessageWarning from '~/components/ChatMessageWarning.vue'

describe('ChatMessageWarning', () => {
  function createWrapper() {
    return mount(ChatMessageWarning)
  }

  describe('rendering', () => {
    it('renders warning text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'This message may contain a phone number outside the UK'
      )
    })

    it('mentions additional call costs', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('costs more to call')
    })

    it('has text-danger class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.text-danger').exists()).toBe(true)
    })
  })
})
