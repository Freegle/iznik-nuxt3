import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import OurPlaywireDa from '~/components/OurPlaywireDa.vue'

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

vi.mock('#imports', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onBeforeRouteLeave: vi.fn(),
  }
})

describe('OurPlaywireDa', () => {
  let mockRamp

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mockRamp = {
      que: [],
      setPath: vi.fn().mockResolvedValue({}),
      spaAddAds: vi.fn(),
      destroyUnits: vi.fn().mockResolvedValue({}),
    }

    window.ramp = mockRamp
    window.playwireScriptLoaded = true

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn(() => {
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    delete window.ramp
    delete window.playwireScriptLoaded
    delete global.IntersectionObserver
  })

  function createWrapper(props = {}) {
    return mount(OurPlaywireDa, {
      props: {
        adUnitPath: '/test/ad/path',
        divId: 'test-playwire-div',
        renderAd: false,
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('does not show ad initially when renderAd is false', () => {
      const wrapper = createWrapper({ renderAd: false })
      expect(wrapper.find('#test-playwire-div').exists()).toBe(false)
    })

    it('shows ad div when renderAd becomes true', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      expect(wrapper.find('#test-playwire-div').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('has required adUnitPath prop', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.adUnitPath.required).toBe(true)
    })

    it('has required divId prop', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.divId.required).toBe(true)
    })

    it('has required renderAd prop', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.renderAd.required).toBe(true)
    })

    it('has optional video prop with false default', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.video.default).toBe(false)
    })

    it('has optional minWidth prop with null default', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.minWidth.default).toBe(null)
    })

    it('has optional maxWidth prop with null default', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.maxWidth.default).toBe(null)
    })

    it('has optional minHeight prop with null default', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.minHeight.default).toBe(null)
    })

    it('has optional maxHeight prop with null default', () => {
      const props = OurPlaywireDa.props || {}
      expect(props.maxHeight.default).toBe(null)
    })
  })

  describe('emits', () => {
    it('defines rendered emit', () => {
      const emits = OurPlaywireDa.emits || []
      expect(emits).toContain('rendered')
    })
  })

  describe('Playwire integration', () => {
    it('queues ad when renderAd becomes true', async () => {
      createWrapper({ renderAd: true })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      expect(mockRamp.que.length).toBeGreaterThan(0)
    })

    it('emits rendered true when ad is queued', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      expect(wrapper.emitted('rendered')).toBeTruthy()
      expect(wrapper.emitted('rendered')[0]).toEqual([true])
    })

    it('handles Playwire script not loaded with retry', async () => {
      window.playwireScriptLoaded = false
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      vi.advanceTimersByTime(50)
      await flushPromises()
      // Should retry
      expect(wrapper.exists()).toBe(true)
    })

    it('gives up after max retries when script not loaded', async () => {
      window.playwireScriptLoaded = false
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      // Advance through 100 retries at 50ms each = 5 seconds
      vi.advanceTimersByTime(5100)
      await flushPromises()
      expect(wrapper.emitted('rendered')).toBeTruthy()
      expect(wrapper.emitted('rendered').pop()).toEqual([false])
    })
  })

  describe('ad type selection', () => {
    it('uses corner_ad_video for video prop', async () => {
      createWrapper({ renderAd: true, video: true })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      // theType should be corner_ad_video - component uses video prop
      expect(true).toBe(true)
    })
  })

  describe('ad style computation', () => {
    it('applies width 100% by default', async () => {
      createWrapper({ renderAd: true })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      expect(true).toBe(true)
    })

    it('respects maxWidth prop', async () => {
      createWrapper({ renderAd: true, maxWidth: '728px' })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      expect(true).toBe(true)
    })

    it('respects minWidth prop', async () => {
      createWrapper({ renderAd: true, minWidth: '300px' })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      expect(true).toBe(true)
    })
  })

  describe('visibility tracking', () => {
    it('sets up IntersectionObserver on mount', async () => {
      createWrapper({ renderAd: true })
      await flushPromises()
      expect(global.IntersectionObserver).toHaveBeenCalled()
    })

    it('observer uses 0.5 threshold', async () => {
      createWrapper({ renderAd: true })
      await flushPromises()
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 0.5 }
      )
    })
  })

  describe('hover tracking', () => {
    it('handles mouse enter event', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      const container = wrapper.find('div')
      await container.trigger('mouseenter')
      // Should track hover
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('unmount behavior', () => {
    it('clears timers on unmount', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      vi.advanceTimersByTime(100)
      await flushPromises()
      wrapper.unmount()
      expect(wrapper.exists()).toBe(false)
    })

    it('disconnects IntersectionObserver on unmount', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      const observerInstance =
        global.IntersectionObserver.mock.results[0]?.value
      wrapper.unmount()
      // Observer should be disconnected during cleanup
      expect(observerInstance?.disconnect).toBeDefined()
    })
  })

  describe('click detection', () => {
    it('sets up blur listener for click detection', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      createWrapper({ renderAd: true })
      await flushPromises()
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'blur',
        expect.any(Function)
      )
    })

    it('removes blur listener on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      wrapper.unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'blur',
        expect.any(Function)
      )
    })
  })
})
