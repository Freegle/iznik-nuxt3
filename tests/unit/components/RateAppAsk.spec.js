import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RateAppAsk from '~/components/RateAppAsk.vue'

describe('RateAppAsk', () => {
  function createWrapper() {
    return mount(RateAppAsk)
  }

  describe('rendering', () => {
    it('renders stub container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders empty content (stub)', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('')
    })
  })

  describe('emits', () => {
    it('defines hide emit', () => {
      const wrapper = createWrapper()
      // Check that the component defines the hide emit
      expect(wrapper.vm.$options.emits).toContain('hide')
    })
  })
})
