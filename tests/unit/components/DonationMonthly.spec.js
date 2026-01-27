import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DonationMonthly from '~/components/DonationMonthly.vue'

const mockAction = vi.fn()

vi.mock('~/composables/useClientLog', () => ({
  action: (...args) => mockAction(...args),
}))

describe('DonationMonthly', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }))
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
  })

  function createWrapper(props = {}) {
    return mount(DonationMonthly, {
      props: {
        variant: 'test-variant',
        ...props,
      },
      global: {
        stubs: {
          'b-img': {
            template:
              '<img :src="src" :alt="alt" :title="title" class="b-img" />',
            props: ['src', 'alt', 'title', 'lazy'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders clickable container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.clickme').exists()).toBe(true)
    })

    it('renders donation image', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.b-img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/donate_per_month.jpg')
    })

    it('has alt text on image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').attributes('alt')).toContain(
        'donating £1 per month'
      )
    })

    it('has title on image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').attributes('title')).toContain(
        '£1/month donation'
      )
    })

    it('renders hidden PayPal form', () => {
      const wrapper = createWrapper()
      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
      expect(form.attributes('action')).toContain('paypal.com')
      expect(form.classes()).toContain('d-none')
    })

    it('has correct PayPal form fields', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[name="cmd"]').element.value).toBe('_s-xclick')
      expect(wrapper.find('input[name="hosted_button_id"]').element.value).toBe(
        '6VJKBWQ9RQHPU'
      )
      expect(wrapper.find('input[name="currency_code"]').element.value).toBe(
        'GBP'
      )
    })
  })

  describe('tracking', () => {
    it('logs render action on mount', () => {
      createWrapper({ variant: 'sidebar' })
      expect(mockAction).toHaveBeenCalledWith('donation_monthly_rendered', {
        variant: 'sidebar',
      })
    })

    it('sets up intersection observer on mount', () => {
      createWrapper()
      expect(IntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('click handling', () => {
    it('logs click action when clicked', async () => {
      const wrapper = createWrapper({ variant: 'footer' })
      // Reset after mount action
      mockAction.mockClear()

      // Mock form submit
      const mockSubmit = vi.fn()
      wrapper.vm.donateform = { submit: mockSubmit }

      await wrapper.find('.clickme').trigger('click')

      expect(mockAction).toHaveBeenCalledWith('donation_monthly_click', {
        variant: 'footer',
      })
    })
  })

  describe('props', () => {
    it('requires variant prop', () => {
      const wrapper = createWrapper({ variant: 'my-variant' })
      expect(wrapper.props('variant')).toBe('my-variant')
    })
  })
})
