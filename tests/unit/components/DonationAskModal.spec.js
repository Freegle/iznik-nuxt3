import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import DonationAskModal from '~/components/DonationAskModal.vue'

const { mockVariant, mockGroupId, mockShow, mockRaised, mockTarget } =
  vi.hoisted(() => {
    const { ref } = require('vue')
    return {
      mockVariant: ref('default'),
      mockGroupId: ref(123),
      mockShow: vi.fn(),
      mockRaised: ref(500),
      mockTarget: ref(1000),
    }
  })

const mockGroupStore = {
  get: vi.fn().mockReturnValue({ namedisplay: 'Test Group' }),
}

const mockDonationStore = {
  raised: mockRaised,
  target: mockTarget,
}

const mockAuthStore = {
  user: { donated: null },
}

const mockApi = {
  bandit: {
    chosen: vi.fn(),
  },
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/donations', () => ({
  useDonationStore: () => mockDonationStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    storeToRefs: () => ({
      raised: mockRaised,
      target: mockTarget,
    }),
  }
})

const { mockModal } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
  }
})

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
  }),
}))

vi.mock('~/composables/useDonationAskModal', () => ({
  useDonationAskModal: () =>
    Promise.resolve({
      variant: mockVariant,
      groupId: mockGroupId,
      show: mockShow,
    }),
}))

vi.mock('~/api', () => ({
  default: () => mockApi,
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: {} }),
}))

describe('DonationAskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVariant.value = 'default'
    mockGroupId.value = 123
    mockRaised.value = 500
    mockTarget.value = 1000
    mockAuthStore.user = { donated: null }
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(DonationAskModal),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-modal': {
            template: '<div class="b-modal"><slot name="default" /></div>',
            props: ['title', 'hideHeader', 'hideFooter', 'size', 'noStacking'],
          },
          DonationAskStripe: {
            template: '<div class="donation-ask-stripe" />',
            props: [
              'groupid',
              'groupname',
              'target',
              'raised',
              'targetMet',
              'donated',
              'amounts',
              'default',
            ],
            emits: ['score', 'success', 'cancel'],
          },
          DonationThank: {
            template: '<div class="donation-thank" />',
          },
          RateAppAsk: {
            template: '<div class="rate-app-ask" />',
            emits: ['hide'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders modal', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('calls show on mount', async () => {
      await createWrapper()
      expect(mockShow).toHaveBeenCalled()
    })
  })

  describe('donation stripe variant', () => {
    it('renders DonationAskStripe when variant is default', async () => {
      mockVariant.value = 'default'
      const wrapper = await createWrapper()
      expect(wrapper.find('.donation-ask-stripe').exists()).toBe(true)
    })

    it('does not show thank you message initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.donation-thank').exists()).toBe(false)
    })
  })

  describe('rate app variant', () => {
    it('renders RateAppAsk when variant is rateapp', async () => {
      mockVariant.value = 'rateapp'
      const wrapper = await createWrapper()
      expect(wrapper.find('.rate-app-ask').exists()).toBe(true)
    })

    it('does not render DonationAskStripe when variant is rateapp', async () => {
      mockVariant.value = 'rateapp'
      const wrapper = await createWrapper()
      expect(wrapper.find('.donation-ask-stripe').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('gets groupName from store when target not met', async () => {
      mockGroupId.value = 123
      mockRaised.value = 500
      mockTarget.value = 1000
      await createWrapper()
      expect(mockGroupStore.get).toHaveBeenCalledWith(123)
    })

    it('returns Freegle when target is met', async () => {
      mockGroupId.value = 123
      mockRaised.value = 1500
      mockTarget.value = 1000
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(DonationAskModal)
      expect(component.vm.groupName).toBe('Freegle')
    })

    it('returns Freegle when no groupId', async () => {
      mockGroupId.value = null
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(DonationAskModal)
      expect(component.vm.groupName).toBe('Freegle')
    })

    it('computes targetMet correctly when raised > target', async () => {
      mockGroupId.value = 123
      mockRaised.value = 1500
      mockTarget.value = 1000
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(DonationAskModal)
      expect(component.vm.targetMet).toBe(true)
    })

    it('computes targetMet as false when raised < target', async () => {
      mockGroupId.value = 123
      mockRaised.value = 500
      mockTarget.value = 1000
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(DonationAskModal)
      expect(component.vm.targetMet).toBe(false)
    })
  })

  describe('donated display', () => {
    it('shows donated message when user has donated', async () => {
      mockAuthStore.user = { donated: '2024-01-15' }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain("You've already donated")
    })

    it('does not show donated message when user has not donated', async () => {
      mockAuthStore.user = { donated: null }
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain("You've already donated")
    })
  })

  describe('score method', () => {
    it('calls bandit API with correct params', async () => {
      mockVariant.value = 'test-variant'
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(DonationAskModal)

      component.vm.score(5)

      expect(mockApi.bandit.chosen).toHaveBeenCalledWith({
        uid: 'donation',
        variant: 'test-variant',
        score: 5,
      })
    })
  })
})
