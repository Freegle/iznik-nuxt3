import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NoticeMessage from '~/components/NoticeMessage.vue'

describe('NoticeMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(NoticeMessage, {
        slots: { default: 'Test content' },
        global: { stubs: { 'b-button': true, 'b-modal': true } },
      })
      expect(wrapper.text()).toContain('Test content')
    })
  })
})
