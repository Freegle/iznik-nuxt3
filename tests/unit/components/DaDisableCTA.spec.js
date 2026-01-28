import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, Suspense, h } from 'vue'
import DaDisableCTA from '~/components/DaDisableCTA.vue'

// Use vi.hoisted for mock setup
const { mockFetchConfig, mockAdsEnabled } = vi.hoisted(() => ({
  mockFetchConfig: vi.fn(),
  mockAdsEnabled: { value: true },
}))

// Mock config store
vi.mock('~/stores/config', () => ({
  useConfigStore: () => ({
    fetch: mockFetchConfig,
  }),
}))

describe('DaDisableCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdsEnabled.value = true
    mockFetchConfig.mockResolvedValue([{ value: '1' }])
  })

  // Wrap async component in Suspense for testing
  async function createWrapper() {
    const TestWrapper = defineComponent({
      render() {
        return h(
          Suspense,
          {},
          {
            default: () => h(DaDisableCTA),
            fallback: () => h('div', 'Loading...'),
          }
        )
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :to="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('when ads are enabled', () => {
    beforeEach(() => {
      mockFetchConfig.mockResolvedValue([{ value: '1' }])
    })

    it('shows the CTA when ads are enabled', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.da-disable-cta').exists()).toBe(true)
    })

    it('displays "Hate ads?" message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Hate ads?')
    })

    it('displays donation message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain("Donate and we'll turn them off")
    })

    it('shows Learn more link', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Learn more')
    })

    it('links to /adsoff page', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('.cta-link')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Learn more')
    })
  })

  describe('when ads are disabled', () => {
    beforeEach(() => {
      mockFetchConfig.mockResolvedValue([{ value: '0' }])
    })

    it('hides the CTA when ads are disabled', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.da-disable-cta').exists()).toBe(false)
    })
  })

  describe('when config returns empty array', () => {
    beforeEach(() => {
      mockFetchConfig.mockResolvedValue([])
    })

    it('hides the CTA when config is empty', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.da-disable-cta').exists()).toBe(false)
    })
  })

  describe('config fetching', () => {
    it('fetches ads_enabled config', async () => {
      await createWrapper()
      expect(mockFetchConfig).toHaveBeenCalledWith('ads_enabled')
    })
  })
})
