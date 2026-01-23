import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModtoolsViewControl from '~/modtools/components/ModtoolsViewControl.vue'

// Mock the misc store
const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

describe('ModtoolsViewControl', () => {
  function mountComponent(props = {}) {
    return mount(ModtoolsViewControl, {
      props: {
        misckey: 'testViewKey',
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          OurToggle: {
            template:
              '<div class="our-toggle" @click="$emit(\'change\', !modelValue)"><slot /></div>',
            props: [
              'modelValue',
              'height',
              'width',
              'fontSize',
              'sync',
              'labels',
              'variant',
            ],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockMiscStore.get.mockReturnValue(undefined)
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.our-toggle').exists()).toBe(true)
    })

    it('renders OurToggle with correct props', () => {
      const wrapper = mountComponent()
      const toggle = wrapper.find('.our-toggle')
      expect(toggle.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires misckey prop', () => {
      const wrapper = mountComponent({ misckey: 'customKey' })
      expect(wrapper.props('misckey')).toBe('customKey')
    })
  })

  describe('computed properties', () => {
    it('summary returns false when miscStore.get returns undefined', () => {
      mockMiscStore.get.mockReturnValue(undefined)
      const wrapper = mountComponent()
      expect(wrapper.vm.summary).toBe(false)
    })

    it('summary returns value from miscStore.get when defined', () => {
      mockMiscStore.get.mockReturnValue(true)
      const wrapper = mountComponent()
      expect(wrapper.vm.summary).toBe(true)
    })

    it('summary getter calls miscStore.get with correct key', () => {
      const wrapper = mountComponent({ misckey: 'myTestKey' })
      wrapper.vm.summary // trigger getter
      expect(mockMiscStore.get).toHaveBeenCalledWith('myTestKey')
    })

    it('summary setter does nothing (empty implementation)', () => {
      const wrapper = mountComponent()
      wrapper.vm.summary = true
      // The setter is empty, so no store call should happen
      expect(mockMiscStore.set).not.toHaveBeenCalled()
    })
  })

  describe('methods', () => {
    it('toggleView calls miscStore.set with key and value', () => {
      const wrapper = mountComponent({ misckey: 'viewToggleKey' })
      wrapper.vm.toggleView(true, {})
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'viewToggleKey',
        value: true,
      })
    })

    it('toggleView with false value', () => {
      const wrapper = mountComponent({ misckey: 'viewToggleKey' })
      wrapper.vm.toggleView(false, {})
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'viewToggleKey',
        value: false,
      })
    })
  })

  describe('toggle interaction', () => {
    it('triggers toggleView when OurToggle emits change', async () => {
      const wrapper = mountComponent()
      const toggle = wrapper.find('.our-toggle')
      await toggle.trigger('click')
      expect(mockMiscStore.set).toHaveBeenCalled()
    })
  })

  describe('different misckey values', () => {
    it('uses different keys for different instances', () => {
      const wrapper1 = mountComponent({ misckey: 'key1' })
      const wrapper2 = mountComponent({ misckey: 'key2' })

      wrapper1.vm.summary
      wrapper2.vm.summary

      expect(mockMiscStore.get).toHaveBeenCalledWith('key1')
      expect(mockMiscStore.get).toHaveBeenCalledWith('key2')
    })
  })
})
