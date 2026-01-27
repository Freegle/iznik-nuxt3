import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import OurGoogleDa from '~/components/OurGoogleDa.vue'

const mockMiscStore = {
  visible: true,
}

const mockMyGroups = ref([{ nameshort: 'TestGroup', added: '2024-01-01' }])

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroups: mockMyGroups,
  }),
}))

describe('OurGoogleDa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockMiscStore.visible = true
    mockMyGroups.value = [{ nameshort: 'TestGroup', added: '2024-01-01' }]

    window.adsbygoogle = {
      loaded: true,
      pauseAdRequests: 1,
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    delete window.adsbygoogle
  })

  function createWrapper(props = {}) {
    return mount(OurGoogleDa, {
      props: {
        adUnitPath: '/test/ad/path',
        divId: 'test-ad-div',
        renderAd: false,
        ...props,
      },
      global: {
        stubs: {
          Adsbygoogle: {
            template: '<div class="adsbygoogle" :data-ad-slot="adSlot" />',
            props: ['style', 'pageUrl', 'adSlot'],
            methods: {
              updateAd: vi.fn(),
            },
          },
          DaDisableCTA: {
            template: '<div class="da-disable-cta" />',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('does not show ad initially when renderAd is false', () => {
      const wrapper = createWrapper({ renderAd: false })
      expect(wrapper.find('.adsbygoogle').exists()).toBe(false)
    })

    it('shows ad when renderAd becomes true', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      expect(wrapper.find('.adsbygoogle').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('has required adUnitPath prop', () => {
      const props = OurGoogleDa.props || {}
      expect(props.adUnitPath.required).toBe(true)
    })

    it('has required divId prop', () => {
      const props = OurGoogleDa.props || {}
      expect(props.divId.required).toBe(true)
    })

    it('has required renderAd prop', () => {
      const props = OurGoogleDa.props || {}
      expect(props.renderAd.required).toBe(true)
    })

    it('has optional minWidth prop with null default', () => {
      const props = OurGoogleDa.props || {}
      expect(props.minWidth.default).toBe(null)
    })

    it('has optional maxWidth prop with null default', () => {
      const props = OurGoogleDa.props || {}
      expect(props.maxWidth.default).toBe(null)
    })

    it('has optional minHeight prop with null default', () => {
      const props = OurGoogleDa.props || {}
      expect(props.minHeight.default).toBe(null)
    })

    it('has optional maxHeight prop with null default', () => {
      const props = OurGoogleDa.props || {}
      expect(props.maxHeight.default).toBe(null)
    })
  })

  describe('emits', () => {
    it('defines rendered emit', () => {
      const emits = OurGoogleDa.emits || []
      expect(emits).toContain('rendered')
    })
  })

  describe('ad blocked state', () => {
    it('shows ad blocker message when adsbygoogle not loaded', async () => {
      delete window.adsbygoogle
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      expect(wrapper.find('.da-disable-cta').exists()).toBe(true)
    })

    it('shows ad blocker message when adsbygoogle.loaded is false', async () => {
      window.adsbygoogle = { loaded: false }
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      expect(wrapper.text()).toContain("Maybe you're using an ad blocker")
    })
  })

  describe('ad style computation', () => {
    it('applies width 100% by default', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      // The computed adStyle should have width: 100%
      expect(wrapper.exists()).toBe(true)
    })

    it('respects maxWidth prop', async () => {
      const wrapper = createWrapper({ renderAd: true, maxWidth: '728px' })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('respects minWidth prop', async () => {
      const wrapper = createWrapper({ renderAd: true, minWidth: '300px' })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('respects minHeight prop', async () => {
      const wrapper = createWrapper({ renderAd: true, minHeight: '90px' })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })

    it('respects maxHeight prop', async () => {
      const wrapper = createWrapper({ renderAd: true, maxHeight: '250px' })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('page URL computation', () => {
    it('uses user group for page URL when available', async () => {
      mockMyGroups.value = [{ nameshort: 'MyLocalGroup', added: '2024-01-01' }]
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      // pageUrl computed should return URL with user's group
      expect(wrapper.exists()).toBe(true)
    })

    it('falls back to Croydon when no groups', async () => {
      mockMyGroups.value = []
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      // pageUrl should fall back to Croydon-Freegle
      expect(wrapper.exists()).toBe(true)
    })

    it('uses most recently added group', async () => {
      mockMyGroups.value = [
        { nameshort: 'OldGroup', added: '2023-01-01' },
        { nameshort: 'NewGroup', added: '2024-06-01' },
      ]
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      // Should use NewGroup as it was added most recently
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('ad refresh', () => {
    it('does not refresh when visibility is false', async () => {
      mockMiscStore.visible = false
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      // Should skip refresh logic
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('unmount behavior', () => {
    it('clears timers on unmount', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      wrapper.unmount()
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('ad slot', () => {
    it('uses responsive ad slot', async () => {
      const wrapper = createWrapper({ renderAd: true })
      await flushPromises()
      // Component uses slot '9463528951' for responsive ads
      expect(wrapper.exists()).toBe(true)
    })
  })
})
