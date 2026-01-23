import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Suspense, defineComponent, h } from 'vue'
import DonationThank from '~/components/DonationThank.vue'

// Mock giftaid store
let giftaidData = null
const mockFetch = vi.fn().mockResolvedValue(undefined)

vi.mock('~/stores/giftaid', () => ({
  useGiftAidStore: () => ({
    fetch: mockFetch,
    get giftaid() {
      return giftaidData
    },
  }),
}))

describe('DonationThank', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    giftaidData = null
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      render() {
        return h(Suspense, null, {
          default: () => h(DonationThank),
        })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-button': {
            template: '<button :class="[variant]" :to="to"><slot /></button>',
            props: ['variant', 'size', 'to'],
          },
          NuxtLink: {
            template: '<a :href="to" class="nuxt-link"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  it('fetches gift aid data on mount', async () => {
    await createWrapper()
    expect(mockFetch).toHaveBeenCalled()
  })

  it('shows gift aid CTA button when user has not completed gift aid', async () => {
    giftaidData = null
    const wrapper = await createWrapper()

    // Should show the button to fill out gift aid
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('to')).toBe('/giftaid?noguard=true')
    expect(button.classes()).toContain('primary')
  })

  it('shows already declared message when gift aid completed', async () => {
    giftaidData = { period: 'Lifetime' }
    const wrapper = await createWrapper()

    // Should NOT show the CTA button
    expect(wrapper.find('button').exists()).toBe(false)

    // Should show the "already declared" text and link
    expect(wrapper.text()).toContain('already made a gift aid declaration')
    const giftaidLink = wrapper
      .findAll('.nuxt-link')
      .find((l) => l.attributes('href') === '/giftaid?noguard=true')
    expect(giftaidLink).toBeDefined()
  })
})
