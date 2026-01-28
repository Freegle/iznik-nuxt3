import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import InfiniteLoading from '~/components/InfiniteLoading.vue'

describe('InfiniteLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}, slots = {}) {
    return mount(InfiniteLoading, {
      props: {
        firstload: false,
        ...props,
      },
      slots,
      global: {
        stubs: {
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
        },
        directives: {
          'observe-visibility': {
            mounted(el, binding) {
              el._visibilityCallback = binding.value.callback
            },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders infinite-loader container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.infinite-loader').exists()).toBe(true)
    })

    it('wraps content in client-only', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.client-only').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('has default distance of 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('distance')).toBe(0)
    })

    it('has default firstload of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('firstload')).toBe(false)
    })

    it('has default target of null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('target')).toBe(null)
    })

    it('has default top of false (Boolean prop)', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('top')).toBe(false)
    })

    it('accepts custom distance', () => {
      const wrapper = createWrapper({ distance: 100 })
      expect(wrapper.props('distance')).toBe(100)
    })

    it('accepts identifier prop', () => {
      const wrapper = createWrapper({ identifier: 'test-id' })
      expect(wrapper.props('identifier')).toBe('test-id')
    })
  })

  describe('state management', () => {
    it('initializes state as ready', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.state).toBe('ready')
    })

    it('initializes bump as 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.bump).toBe(0)
    })

    it('initializes visible as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.visible).toBe(false)
    })
  })

  describe('loading method', () => {
    it('sets state to loading', () => {
      const wrapper = createWrapper()
      wrapper.vm.loading()
      expect(wrapper.vm.state).toBe('loading')
    })
  })

  describe('loaded method', () => {
    it('sets state to loaded', () => {
      const wrapper = createWrapper()
      wrapper.vm.loaded()
      expect(wrapper.vm.state).toBe('loaded')
    })
  })

  describe('complete method', () => {
    it('sets state to complete', () => {
      const wrapper = createWrapper()
      wrapper.vm.complete()
      expect(wrapper.vm.state).toBe('complete')
    })
  })

  describe('error method', () => {
    it('sets state to error', () => {
      const wrapper = createWrapper()
      wrapper.vm.error()
      expect(wrapper.vm.state).toBe('error')
    })
  })

  describe('stopObserver method', () => {
    it('calls complete', () => {
      const wrapper = createWrapper()
      wrapper.vm.stopObserver()
      expect(wrapper.vm.state).toBe('complete')
    })
  })

  describe('visibilityChanged method', () => {
    it('updates visible state', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.visible).toBe(false)
      wrapper.vm.visibilityChanged(true)
      expect(wrapper.vm.visible).toBe(true)
    })

    it('sets visible to false when not visible', () => {
      const wrapper = createWrapper()
      wrapper.vm.visibilityChanged(true)
      wrapper.vm.visibilityChanged(false)
      expect(wrapper.vm.visible).toBe(false)
    })
  })

  describe('slots', () => {
    it('renders spinner slot when loading', async () => {
      const wrapper = createWrapper(
        {},
        {
          spinner: '<span class="spinner">Loading...</span>',
        }
      )
      wrapper.vm.loading()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.spinner').exists()).toBe(true)
    })

    it('renders complete slot when complete', async () => {
      const wrapper = createWrapper(
        {},
        {
          complete: '<span class="done">No more items</span>',
        }
      )
      wrapper.vm.complete()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.done').exists()).toBe(true)
    })

    it('renders error slot when error', async () => {
      const wrapper = createWrapper(
        {},
        {
          error: '<span class="error">Error occurred</span>',
        }
      )
      wrapper.vm.error()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.error').exists()).toBe(true)
    })

    it('does not render spinner slot when not loading', () => {
      const wrapper = createWrapper(
        {},
        {
          spinner: '<span class="spinner">Loading...</span>',
        }
      )
      expect(wrapper.find('.spinner').exists()).toBe(false)
    })
  })

  describe('emitInfinite method', () => {
    it('emits infinite event', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.emitInfinite()
      expect(wrapper.emitted('infinite')).toBeTruthy()
    })

    it('provides control methods in event payload', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.emitInfinite()
      const emitted = wrapper.emitted('infinite')[0][0]
      expect(emitted).toHaveProperty('loading')
      expect(emitted).toHaveProperty('loaded')
      expect(emitted).toHaveProperty('complete')
      expect(emitted).toHaveProperty('error')
      expect(emitted).toHaveProperty('stopObserver')
    })

    it('sets state to loading when emitting', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.state).toBe('ready')
      // Start the emit but check state immediately
      const promise = wrapper.vm.emitInfinite()
      expect(wrapper.vm.state).toBe('loading')
      await promise
    })
  })

  describe('defineExpose', () => {
    it('exposes loading method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.loading).toBe('function')
    })

    it('exposes loaded method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.loaded).toBe('function')
    })

    it('exposes complete method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.complete).toBe('function')
    })

    it('exposes error method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.error).toBe('function')
    })

    it('exposes stopObserver method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.stopObserver).toBe('function')
    })
  })

  describe('identifier watch', () => {
    it('increments bump when identifier changes', async () => {
      const wrapper = createWrapper({ identifier: 1 })
      expect(wrapper.vm.bump).toBe(0)

      await wrapper.setProps({ identifier: 2 })
      await flushPromises()
      expect(wrapper.vm.bump).toBe(1)
    })

    it('emits infinite when identifier changes', async () => {
      const wrapper = createWrapper({ identifier: 1 })
      await wrapper.setProps({ identifier: 2 })
      await flushPromises()
      expect(wrapper.emitted('infinite')).toBeTruthy()
    })
  })

  describe('firstload prop', () => {
    it('emits infinite on mount when firstload is true', async () => {
      const wrapper = createWrapper({ firstload: true })
      await flushPromises()
      expect(wrapper.emitted('infinite')).toBeTruthy()
    })

    it('does not emit infinite on mount when firstload is false', async () => {
      const wrapper = createWrapper({ firstload: false })
      await flushPromises()
      expect(wrapper.emitted('infinite')).toBeFalsy()
    })
  })
})
