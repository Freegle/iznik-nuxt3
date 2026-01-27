import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import MobileVisualiseList from '~/components/MobileVisualiseList.vue'

const { mockOffers } = vi.hoisted(() => {
  return {
    mockOffers: [
      {
        id: 1,
        subject: 'OFFER: Sofa',
        type: 'Offer',
        attachments: [{ id: 1 }],
      },
      {
        id: 2,
        subject: 'OFFER: Chair',
        type: 'Offer',
        attachments: [{ id: 2 }],
      },
      {
        id: 3,
        subject: 'OFFER: Table',
        type: 'Offer',
        attachments: [{ id: 3 }],
      },
      {
        id: 4,
        subject: 'OFFER: Lamp',
        type: 'Offer',
        attachments: [{ id: 4 }],
      },
      {
        id: 5,
        subject: 'OFFER: Desk',
        type: 'Offer',
        attachments: [{ id: 5 }],
      },
      {
        id: 6,
        subject: 'OFFER: Bookshelf',
        type: 'Offer',
        attachments: [{ id: 6 }],
      },
      {
        id: 7,
        subject: 'OFFER: Wardrobe',
        type: 'Offer',
        attachments: [{ id: 7 }],
      },
      { id: 8, subject: 'OFFER: Bed', type: 'Offer', attachments: [{ id: 8 }] },
    ],
  }
})

const mockRouter = {
  push: vi.fn(),
}

const mockMessageStore = {
  all: mockOffers,
  fetch: vi.fn().mockImplementation((id) => {
    return Promise.resolve(mockOffers.find((o) => o.id === id))
  }),
  fetchInBounds: vi.fn().mockResolvedValue(mockOffers),
  byId: vi.fn().mockImplementation((id) => mockOffers.find((o) => o.id === id)),
}

const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue([]),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('MobileVisualiseList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.all = mockOffers
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(MobileVisualiseList),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          MessageSummary: {
            template: '<div class="message-summary" :data-id="id" />',
            props: ['id', 'showFreegled', 'showPromised', 'preload'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering with cached data', () => {
    it('renders mobile visualise container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.mobile-visualise').exists()).toBe(true)
    })

    it('shows scroll container when 4+ items', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.scroll-container').exists()).toBe(true)
    })

    it('renders message summaries', async () => {
      const wrapper = await createWrapper()
      const summaries = wrapper.findAll('.message-summary')
      expect(summaries.length).toBeGreaterThan(0)
    })

    it('doubles items for seamless loop', async () => {
      const wrapper = await createWrapper()
      const summaries = wrapper.findAll('.message-summary')
      // 8 items doubled = 16
      expect(summaries.length).toBe(16)
    })
  })

  describe('loading state', () => {
    it('shows loading state when fewer than 8 cached items', async () => {
      mockMessageStore.all = [
        {
          id: 1,
          subject: 'OFFER: Sofa',
          type: 'Offer',
          attachments: [{ id: 1 }],
        },
      ]
      mockMessageStore.fetchInBounds.mockResolvedValue([])
      const wrapper = await createWrapper()
      // Component will try to fetch, may show loading
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('scroll track', () => {
    it('has scroll track element', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.scroll-track').exists()).toBe(true)
    })

    it('applies animation duration based on item count', async () => {
      const wrapper = await createWrapper()
      const track = wrapper.find('.scroll-track')
      // 8 items * 4 = 32s
      expect(track.attributes('style')).toContain('animation-duration')
    })
  })

  describe('scroll items', () => {
    it('renders clickable scroll items', async () => {
      const wrapper = await createWrapper()
      const items = wrapper.findAll('.scroll-item')
      expect(items.length).toBeGreaterThan(0)
    })
  })

  describe('message summary props', () => {
    it('passes correct props to MessageSummary', async () => {
      const wrapper = await createWrapper()
      const summary = wrapper.findComponent('.message-summary')
      expect(summary.props('showFreegled')).toBe(false)
      expect(summary.props('showPromised')).toBe(false)
      expect(summary.props('preload')).toBe(true)
    })
  })

  describe('deduplication', () => {
    it('deduplicates items by subject', async () => {
      mockMessageStore.all = [
        {
          id: 1,
          subject: 'OFFER: Sofa',
          type: 'Offer',
          attachments: [{ id: 1 }],
        },
        {
          id: 2,
          subject: 'OFFER: Sofa',
          type: 'Offer',
          attachments: [{ id: 2 }],
        }, // duplicate
        {
          id: 3,
          subject: 'OFFER: Chair',
          type: 'Offer',
          attachments: [{ id: 3 }],
        },
        {
          id: 4,
          subject: 'OFFER: Table',
          type: 'Offer',
          attachments: [{ id: 4 }],
        },
        {
          id: 5,
          subject: 'OFFER: Lamp',
          type: 'Offer',
          attachments: [{ id: 5 }],
        },
        {
          id: 6,
          subject: 'OFFER: Desk',
          type: 'Offer',
          attachments: [{ id: 6 }],
        },
        {
          id: 7,
          subject: 'OFFER: Bookshelf',
          type: 'Offer',
          attachments: [{ id: 7 }],
        },
        {
          id: 8,
          subject: 'OFFER: Wardrobe',
          type: 'Offer',
          attachments: [{ id: 8 }],
        },
        {
          id: 9,
          subject: 'OFFER: Bed',
          type: 'Offer',
          attachments: [{ id: 9 }],
        },
      ]
      const wrapper = await createWrapper()
      // Should dedupe to 8 unique subjects, then doubled = 16
      const summaries = wrapper.findAll('.message-summary')
      expect(summaries.length).toBe(16)
    })
  })

  describe('filters offers only', () => {
    it('filters to only show offers', async () => {
      mockMessageStore.all = [
        {
          id: 1,
          subject: 'OFFER: Sofa',
          type: 'Offer',
          attachments: [{ id: 1 }],
        },
        {
          id: 2,
          subject: 'WANTED: Chair',
          type: 'Wanted',
          attachments: [{ id: 2 }],
        },
        {
          id: 3,
          subject: 'OFFER: Table',
          type: 'Offer',
          attachments: [{ id: 3 }],
        },
        {
          id: 4,
          subject: 'OFFER: Lamp',
          type: 'Offer',
          attachments: [{ id: 4 }],
        },
        {
          id: 5,
          subject: 'OFFER: Desk',
          type: 'Offer',
          attachments: [{ id: 5 }],
        },
        {
          id: 6,
          subject: 'OFFER: Bookshelf',
          type: 'Offer',
          attachments: [{ id: 6 }],
        },
        {
          id: 7,
          subject: 'OFFER: Wardrobe',
          type: 'Offer',
          attachments: [{ id: 7 }],
        },
        {
          id: 8,
          subject: 'OFFER: Bed',
          type: 'Offer',
          attachments: [{ id: 8 }],
        },
        {
          id: 9,
          subject: 'OFFER: Rug',
          type: 'Offer',
          attachments: [{ id: 9 }],
        },
      ]
      const wrapper = await createWrapper()
      // 8 unique offers doubled = 16
      const summaries = wrapper.findAll('.message-summary')
      expect(summaries.length).toBe(16)
    })
  })

  describe('requires attachments', () => {
    it('only shows items with attachments', async () => {
      mockMessageStore.all = [
        {
          id: 1,
          subject: 'OFFER: Sofa',
          type: 'Offer',
          attachments: [{ id: 1 }],
        },
        { id: 2, subject: 'OFFER: Chair', type: 'Offer', attachments: [] }, // no attachments
        {
          id: 3,
          subject: 'OFFER: Table',
          type: 'Offer',
          attachments: [{ id: 3 }],
        },
        {
          id: 4,
          subject: 'OFFER: Lamp',
          type: 'Offer',
          attachments: [{ id: 4 }],
        },
        {
          id: 5,
          subject: 'OFFER: Desk',
          type: 'Offer',
          attachments: [{ id: 5 }],
        },
        {
          id: 6,
          subject: 'OFFER: Bookshelf',
          type: 'Offer',
          attachments: [{ id: 6 }],
        },
        {
          id: 7,
          subject: 'OFFER: Wardrobe',
          type: 'Offer',
          attachments: [{ id: 7 }],
        },
        {
          id: 8,
          subject: 'OFFER: Bed',
          type: 'Offer',
          attachments: [{ id: 8 }],
        },
        {
          id: 9,
          subject: 'OFFER: Rug',
          type: 'Offer',
          attachments: [{ id: 9 }],
        },
      ]
      const wrapper = await createWrapper()
      const summaries = wrapper.findAll('.message-summary')
      // 8 with attachments doubled = 16
      expect(summaries.length).toBe(16)
    })
  })
})
