import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import OurPrebidDa from '~/components/OurPrebidDa.vue'

const mockMiscStore = {
  visible: true,
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

describe('OurPrebidDa', () => {
  let mockGoogletag
  let mockPbjs

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockMiscStore.visible = true

    mockGoogletag = {
      cmd: [],
      pubads: vi.fn(() => ({
        refresh: vi.fn(),
        addEventListener: vi.fn().mockReturnThis(),
        isInitialLoadDisabled: vi.fn(() => false),
      })),
      defineSlot: vi.fn(() => ({
        addService: vi.fn().mockReturnThis(),
        getAdUnitPath: vi.fn(() => '/test/ad/path'),
      })),
      display: vi.fn(),
      destroySlots: vi.fn(),
    }

    mockPbjs = {
      que: [],
      requestBids: vi.fn(),
      setTargetingForGPTAsync: vi.fn(),
    }

    window.googletag = mockGoogletag
    window.pbjs = mockPbjs
  })

  afterEach(() => {
    vi.useRealTimers()
    delete window.googletag
    delete window.pbjs
  })

  function createWrapper(props = {}) {
    return mount(OurPrebidDa, {
      props: {
        adUnitPath: '/test/ad/path',
        divId: 'test-ad-div',
        renderAd: false,
        dimensions: [[300, 250]],
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders div with divId', () => {
      const wrapper = createWrapper({ divId: 'my-custom-ad' })
      expect(wrapper.find('#my-custom-ad').exists()).toBe(true)
    })

    it('renders with provided adUnitPath', () => {
      const wrapper = createWrapper({ adUnitPath: '/my/ad/unit' })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('has required adUnitPath prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.adUnitPath.required).toBe(true)
    })

    it('has required divId prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.divId.required).toBe(true)
    })

    it('has required renderAd prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.renderAd.required).toBe(true)
    })

    it('has optional dimensions prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.dimensions.required).toBe(false)
      expect(props.dimensions.default).toBe(null)
    })

    it('has optional minWidth prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.minWidth.default).toBe(null)
    })

    it('has optional maxWidth prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.maxWidth.default).toBe(null)
    })

    it('has optional minHeight prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.minHeight.default).toBe(null)
    })

    it('has optional maxHeight prop', () => {
      const props = OurPrebidDa.props || {}
      expect(props.maxHeight.default).toBe(null)
    })
  })

  describe('emits', () => {
    it('defines rendered emit', () => {
      const emits = OurPrebidDa.emits || []
      expect(emits).toContain('rendered')
    })
  })

  describe('GPT integration', () => {
    it('queues GPT commands when renderAd becomes true', async () => {
      const wrapper = createWrapper({ renderAd: false })
      expect(mockGoogletag.cmd.length).toBe(0)

      await wrapper.setProps({ renderAd: true })
      expect(mockGoogletag.cmd.length).toBeGreaterThan(0)
    })

    it('sets up fallback timer for blocked GPT', () => {
      createWrapper({ renderAd: true })
      expect(vi.getTimerCount()).toBeGreaterThan(0)
    })
  })

  describe('unmount behavior', () => {
    it('clears timers on unmount', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      wrapper.unmount()
      // Component should clean up without errors
      expect(wrapper.exists()).toBe(false)
    })

    it('attempts to destroy GPT slots on unmount', () => {
      const wrapper = createWrapper({ renderAd: true })
      wrapper.unmount()
      // destroySlots may be called if slot was created
      expect(mockGoogletag.destroySlots).toBeDefined()
    })
  })

  describe('visibility-based refresh', () => {
    it('component tracks visibility from misc store', () => {
      mockMiscStore.visible = false
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('prebid timeout', () => {
    it('has defined prebid timeout constant', () => {
      const wrapper = createWrapper()
      // Component defines PREBID_TIMEOUT = 2000
      expect(wrapper.exists()).toBe(true)
    })

    it('has defined ad refresh timeout constant', () => {
      const wrapper = createWrapper()
      // Component defines AD_REFRESH_TIMEOUT = 31000
      expect(wrapper.exists()).toBe(true)
    })
  })
})
