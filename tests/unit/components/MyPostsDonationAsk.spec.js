import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MyPostsDonationAsk from '~/components/MyPostsDonationAsk.vue'

const mockApi = {
  bandit: {
    choose: vi.fn().mockResolvedValue({ variant: 'minimal-friction-2' }),
    shown: vi.fn().mockResolvedValue({}),
    chosen: vi.fn().mockResolvedValue({}),
  },
}

vi.mock('~/api', () => ({
  default: () => mockApi,
}))

vi.mock('#imports', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    useRuntimeConfig: () => ({
      public: {
        API_BASE: 'https://api.example.com',
      },
    }),
  }
})

describe('MyPostsDonationAsk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.bandit.choose.mockResolvedValue({ variant: 'minimal-friction-2' })
  })

  function createWrapper() {
    return mount(MyPostsDonationAsk, {
      global: {
        stubs: {
          DonationButton: {
            template:
              '<button class="donation-button" :data-value="value">{{ text }}</button>',
            props: ['text', 'value'],
          },
          StripeDonate: {
            template:
              '<div class="stripe-donate" :data-price="price"><button class="stripe-btn" @click="$emit(\'success\')" /></div>',
            props: ['price'],
            emits: ['success', 'no-payment-methods', 'error'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders donation container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-ask-container').exists()).toBe(true)
    })

    it('renders donation content', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-ask-content').exists()).toBe(true)
    })

    it('shows donation message', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-message').exists()).toBe(true)
    })

    it('shows minimal friction message by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('volunteer-run and free to use')
    })

    it('shows donation controls', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-controls').exists()).toBe(true)
    })

    it('shows amount display', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.amount-display').exists()).toBe(true)
    })

    it('shows amount slider', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.amount-slider').exists()).toBe(true)
    })

    it('shows slider labels', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.slider-labels').exists()).toBe(true)
      expect(wrapper.text()).toContain('£0.50')
      expect(wrapper.text()).toContain('£10')
    })
  })

  describe('amount selection', () => {
    it('shows default amount', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.amount-value').text()).toContain('£')
    })

    it('updates amount when slider changes', async () => {
      mockApi.bandit.choose.mockResolvedValue({ variant: 'minimal-friction-1' })
      const wrapper = createWrapper()
      await flushPromises()
      const slider = wrapper.find('.amount-slider')
      await slider.setValue(5)
      await flushPromises()
      expect(wrapper.find('.amount-value').text()).toBe('£5.00')
    })

    it('slider has correct min and max', () => {
      const wrapper = createWrapper()
      const slider = wrapper.find('.amount-slider')
      expect(slider.attributes('min')).toBe('0.5')
      expect(slider.attributes('max')).toBe('10')
    })

    it('slider has correct step', () => {
      const wrapper = createWrapper()
      const slider = wrapper.find('.amount-slider')
      expect(slider.attributes('step')).toBe('0.5')
    })
  })

  describe('payment components', () => {
    it('shows stripe component by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.stripe-donate').exists()).toBe(true)
    })

    it('has PayPal as fallback option', () => {
      const wrapper = createWrapper()
      // Both components exist in the DOM
      expect(wrapper.find('.stripe-donate').exists()).toBe(true)
      expect(wrapper.find('.donation-button').exists()).toBe(true)
    })

    it('stripe has price attribute', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.stripe-donate').attributes('data-price')
      ).toBeDefined()
    })
  })

  describe('A/B test variations', () => {
    it('shows solution framing variation when selected', async () => {
      mockApi.bandit.choose.mockResolvedValue({
        variant: 'solution-framing-3',
      })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Help us continue the solution')
    })

    it('sets amount from variant', async () => {
      mockApi.bandit.choose.mockResolvedValue({
        variant: 'minimal-friction-5',
      })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.amount-value').text()).toBe('£5.00')
    })
  })

  describe('bandit API', () => {
    it('calls bandit.choose on mount', async () => {
      createWrapper()
      await flushPromises()
      expect(mockApi.bandit.choose).toHaveBeenCalledWith({
        uid: 'mypostsdonation',
      })
    })

    it('calls bandit.shown after choose', async () => {
      createWrapper()
      await flushPromises()
      expect(mockApi.bandit.shown).toHaveBeenCalled()
    })

    it('handles bandit API error gracefully', async () => {
      mockApi.bandit.choose.mockRejectedValue(new Error('API Error'))
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('donation success', () => {
    it('emits donation-made on success', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.stripe-btn').trigger('click')
      expect(wrapper.emitted('donation-made')).toBeTruthy()
    })

    it('calls bandit.chosen on success', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.stripe-btn').trigger('click')
      await flushPromises()
      expect(mockApi.bandit.chosen).toHaveBeenCalledWith({
        uid: 'mypostsdonation',
        variant: expect.any(String),
        score: expect.any(Number),
      })
    })

    it('handles chosen API error gracefully', async () => {
      mockApi.bandit.chosen.mockRejectedValue(new Error('API Error'))
      const wrapper = createWrapper()
      await wrapper.find('.stripe-btn').trigger('click')
      await flushPromises()
      // Should not throw
      expect(wrapper.emitted('donation-made')).toBeTruthy()
    })
  })

  describe('emits', () => {
    it('defines donation-made emit', () => {
      const emits = MyPostsDonationAsk.emits || []
      expect(emits).toContain('donation-made')
    })
  })
})
