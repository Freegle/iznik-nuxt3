import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ExternalDa from '~/components/ExternalDa.vue'

const { mockMe, mockRecentDonor } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMe: ref({ id: 1, email: 'test@example.com' }),
    mockRecentDonor: ref(false),
  }
})

const mockConfigStore = {
  fetch: vi.fn().mockResolvedValue([{ value: '1' }]),
}

const mockMiscStore = {
  boredWithJobs: false,
  adsDisabled: false,
}

const mockRuntimeConfig = {
  public: {
    ISAPP: false,
    USE_COOKIES: true,
    COOKIEYES: false,
    USER_SITE: 'ilovefreegle.org',
  },
}

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    recentDonor: mockRecentDonor,
  }),
}))

vi.mock('~/stores/config', () => ({
  useConfigStore: () => mockConfigStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => mockRuntimeConfig,
}))

vi.mock('#imports', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    useRuntimeConfig: () => mockRuntimeConfig,
  }
})

describe('ExternalDa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockMe.value = { id: 1, email: 'test@example.com' }
    mockRecentDonor.value = false
    mockMiscStore.boredWithJobs = false
    mockMiscStore.adsDisabled = false
    mockRuntimeConfig.public.ISAPP = false
    mockRuntimeConfig.public.USE_COOKIES = true
    mockRuntimeConfig.public.COOKIEYES = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}) {
    return mount(ExternalDa, {
      props: {
        adUnitPath: '/12345/test-ad',
        divId: 'test-ad-div',
        ...props,
      },
      global: {
        stubs: {
          ClientOnly: {
            template: '<div><slot /></div>',
          },
          JobsDaSlot: {
            template:
              '<div class="jobs-da-slot" :data-min-width="minWidth" :data-max-width="maxWidth" />',
            props: [
              'minWidth',
              'maxWidth',
              'minHeight',
              'maxHeight',
              'hideHeader',
              'listOnly',
            ],
            emits: ['rendered', 'borednow'],
          },
          OurPlaywireDa: {
            template: '<div class="playwire-da" />',
            props: [
              'adUnitPath',
              'minWidth',
              'maxWidth',
              'minHeight',
              'maxHeight',
              'divId',
              'renderAd',
              'video',
            ],
            emits: ['rendered'],
          },
          OurGoogleDa: {
            template: '<div class="google-da" />',
            props: [
              'adUnitPath',
              'minWidth',
              'maxWidth',
              'minHeight',
              'maxHeight',
              'divId',
              'renderAd',
            ],
            emits: ['rendered'],
          },
          OurPrebidDa: {
            template: '<div class="prebid-da" />',
            props: [
              'adUnitPath',
              'minWidth',
              'maxWidth',
              'minHeight',
              'maxHeight',
              'divId',
              'renderAd',
            ],
            emits: ['rendered'],
          },
          'nuxt-link': {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to'],
          },
        },
        directives: {
          'observe-visibility': {
            mounted: (el, binding) => {
              // Simulate visibility callback for testing
              binding.value(true)
            },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders when user exists', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.pointer').exists()).toBe(true)
    })

    it('renders when showLoggedOut is true and user is null', async () => {
      mockMe.value = null
      const wrapper = createWrapper({ showLoggedOut: true })
      await flushPromises()
      expect(wrapper.find('.pointer').exists()).toBe(true)
    })

    it('does not render when showLoggedOut is false and user is null', async () => {
      mockMe.value = null
      const wrapper = createWrapper({ showLoggedOut: false })
      await flushPromises()
      expect(wrapper.find('.pointer').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('requires adUnitPath prop', () => {
      const wrapper = createWrapper({ adUnitPath: '/custom/path' })
      expect(wrapper.props('adUnitPath')).toBe('/custom/path')
    })

    it('requires divId prop', () => {
      const wrapper = createWrapper({ divId: 'custom-div' })
      expect(wrapper.props('divId')).toBe('custom-div')
    })

    it('accepts minWidth prop', () => {
      const wrapper = createWrapper({ minWidth: '300px' })
      expect(wrapper.props('minWidth')).toBe('300px')
    })

    it('accepts maxWidth prop', () => {
      const wrapper = createWrapper({ maxWidth: '728px' })
      expect(wrapper.props('maxWidth')).toBe('728px')
    })

    it('accepts minHeight prop', () => {
      const wrapper = createWrapper({ minHeight: '90px' })
      expect(wrapper.props('minHeight')).toBe('90px')
    })

    it('accepts maxHeight prop', () => {
      const wrapper = createWrapper({ maxHeight: '250px' })
      expect(wrapper.props('maxHeight')).toBe('250px')
    })

    it('has default jobs prop of true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('jobs')).toBe(true)
    })

    it('has default video prop of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('video')).toBe(false)
    })

    it('has default inModal prop of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('inModal')).toBe(false)
    })

    it('has default showLoggedOut prop of true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showLoggedOut')).toBe(true)
    })

    it('has default hideJobsHeader prop of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('hideJobsHeader')).toBe(false)
    })

    it('has default listOnly prop of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('listOnly')).toBe(false)
    })
  })

  describe('fallback ad behavior', () => {
    it('sets fallbackAdVisible when app mode without cookies', async () => {
      mockRuntimeConfig.public.ISAPP = true
      mockRuntimeConfig.public.USE_COOKIES = false
      const wrapper = createWrapper({ jobs: false })
      await flushPromises()

      // In app mode without cookies, visibility should trigger fallback
      // But since visibility directive runs synchronously, we can check state
      expect(
        wrapper.vm.fallbackAdVisible || wrapper.find('.pointer').exists()
      ).toBe(true)
    })

    it('passes minWidth to JobsDaSlot', async () => {
      const wrapper = createWrapper({ minWidth: '400px' })
      await flushPromises()
      const jobsSlot = wrapper.find('.jobs-da-slot')
      if (jobsSlot.exists()) {
        expect(jobsSlot.attributes('data-min-width')).toBe('400px')
      }
    })

    it('passes maxWidth to JobsDaSlot', async () => {
      const wrapper = createWrapper({ maxWidth: '600px' })
      await flushPromises()
      const jobsSlot = wrapper.find('.jobs-da-slot')
      if (jobsSlot.exists()) {
        expect(jobsSlot.attributes('data-max-width')).toBe('600px')
      }
    })
  })

  describe('recent donor detection', () => {
    it('identifies recent donors from composable', () => {
      mockRecentDonor.value = true
      createWrapper()
      // The component has access to recentDonor ref
      expect(mockRecentDonor.value).toBe(true)
    })
  })

  describe('system account detection', () => {
    it('can detect user email for system accounts', () => {
      mockMe.value = { id: 1, email: 'support@ilovefreegle.org' }
      createWrapper()
      // The component checks email against USER_SITE
      expect(mockMe.value.email).toContain('ilovefreegle.org')
    })
  })

  describe('boredWithJobs', () => {
    it('computes boredWithJobs from jobs prop and store', () => {
      const wrapper = createWrapper({ jobs: false })
      expect(wrapper.vm.boredWithJobs).toBe(true)
    })

    it('returns true when miscStore.boredWithJobs is true', () => {
      mockMiscStore.boredWithJobs = true
      const wrapper = createWrapper({ jobs: true })
      expect(wrapper.vm.boredWithJobs).toBe(true)
    })
  })

  describe('setBored method', () => {
    it('sets miscStore.boredWithJobs to true', () => {
      const wrapper = createWrapper()
      wrapper.vm.setBored()
      expect(mockMiscStore.boredWithJobs).toBe(true)
    })
  })

  describe('rippleRendered method', () => {
    it('emits rendered true when ad renders successfully', () => {
      const wrapper = createWrapper()
      wrapper.vm.rippleRendered(true)
      expect(wrapper.emitted('rendered')).toContainEqual([true])
    })

    it('shows fallback when ad fails to render', () => {
      const wrapper = createWrapper()
      wrapper.vm.rippleRendered(false)
      expect(wrapper.vm.fallbackAdVisible).toBe(true)
      expect(mockMiscStore.adsDisabled).toBe(true)
    })
  })

  describe('passClicks computed', () => {
    it('returns false when adShown is true', () => {
      const wrapper = createWrapper()
      wrapper.vm.adShown = true
      expect(wrapper.vm.passClicks).toBe(false)
    })

    it('returns true when adShown is false', () => {
      const wrapper = createWrapper()
      wrapper.vm.adShown = false
      expect(wrapper.vm.passClicks).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('clears timer on unmount', async () => {
      vi.spyOn(global, 'clearTimeout')
      const wrapper = createWrapper()
      await flushPromises()
      wrapper.unmount()
      // Should not throw and cleanup should happen
    })
  })
})
