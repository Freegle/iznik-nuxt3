import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AutoComplete from '~/components/AutoComplete.vue'
describe('AutoComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(AutoComplete, {
      props: {
        // id: undefined,
        // name: undefined,
        // className: undefined,
        // classes: undefined,
        // type: undefined,
        // default: undefined,
        // wrapper: undefined,
        // input: undefined,
        // list: undefined,
        // item: undefined,
        // listentry: undefined,
        // listentrylist: undefined,
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
    it('mounts without error', async () => {
      const wrapper = await mountComponent()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })
  describe('events', () => {
    it('emits update:modelValue event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('emits search event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('emits invalid event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('invalid')).toBeTruthy()
    })
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(AutoComplete, {
        slots: { default: 'Test content' },
        global: { stubs: { 'b-button': true, 'b-modal': true } },
      })
      expect(wrapper.text()).toContain('Test content')
    })
  })
})
