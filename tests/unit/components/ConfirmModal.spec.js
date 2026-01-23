import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ConfirmModal from '~/components/ConfirmModal.vue'

// Mock useOurModal
const mockModal = { value: null }
const mockShow = vi.fn()
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({ modal: mockModal, show: mockShow, hide: mockHide }),
}))

describe('ConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ConfirmModal, {
      props: {
        // title: undefined,
        // type: undefined,
        // required: undefined,
        // default: undefined,
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
  describe('events', () => {
    it('emits confirm event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('confirm')).toBeTruthy()
    })
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(ConfirmModal, {
        slots: { default: 'Test content' },
        global: { stubs: { 'b-button': true, 'b-modal': true } },
      })
      expect(wrapper.text()).toContain('Test content')
    })
  })
})
