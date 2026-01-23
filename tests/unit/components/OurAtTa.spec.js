import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import OurAtTa from '~/components/OurAtTa.vue'
describe('OurAtTa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(OurAtTa, {
      props: {
        // members: undefined,
        // type: undefined,
        // required: undefined,
        ...props,
      },
      global: {
        stubs: {
          'b-button': true,
          'b-modal': true,
          'b-row': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'v-icon': true,
          'nuxt-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts without error', () => {
      const wrapper = mountComponent()
      
      expect(wrapper.exists()).toBe(true)
    })
  })
  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(OurAtTa, {
        slots: { default: 'Test content' },
        global: { stubs: { 'b-button': true, 'b-modal': true } },
      })
      expect(wrapper.text()).toContain('Test content')
    })
  })
})
