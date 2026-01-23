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
            template:
              '<button :class="[variant, size]" :to="to"><slot /></button>',
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

  describe('rendering', () => {
    it('mounts successfully', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('shows thank you message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Thanks very much for donating')
    })

    it('shows money wisely message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain("We'll use your money wisely")
    })

    it('shows happy freegling message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Happy freegling!')
    })

    it('shows promote link', async () => {
      const wrapper = await createWrapper()
      const promoteLink = wrapper
        .findAll('.nuxt-link')
        .find((l) => l.attributes('href') === '/promote?noguard=true')
      expect(promoteLink).toBeDefined()
    })
  })

  describe('when gift aid not completed', () => {
    beforeEach(() => {
      giftaidData = null
    })

    it('shows gift aid button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('button links to gift aid page', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('button').attributes('to')).toBe(
        '/giftaid?noguard=true'
      )
    })

    it('button has primary variant', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('button').classes()).toContain('primary')
    })

    it('shows gift aid declaration prompt', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Gift Aid declaration')
    })
  })

  describe('when gift aid completed', () => {
    beforeEach(() => {
      giftaidData = { period: 'Lifetime' }
    })

    it('shows already declared message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('already made a gift aid declaration')
    })

    it('does not show gift aid button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('shows link to view existing declaration', async () => {
      const wrapper = await createWrapper()
      const giftaidLink = wrapper
        .findAll('.nuxt-link')
        .find((l) => l.attributes('href') === '/giftaid?noguard=true')
      expect(giftaidLink).toBeDefined()
    })
  })

  describe('store interaction', () => {
    it('fetches gift aid data on mount', async () => {
      await createWrapper()
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
