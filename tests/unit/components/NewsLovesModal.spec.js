import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NewsLovesModal from '~/components/NewsLovesModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockNewsfeedStore = {
  fetch: vi.fn().mockResolvedValue(undefined),
  byId: vi.fn().mockReturnValue({
    id: 1,
    loves: 5,
    lovelist: [{ userid: 1 }, { userid: 2 }, { userid: 3 }],
  }),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

describe('NewsLovesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeedStore.byId.mockReturnValue({
      id: 1,
      loves: 5,
      lovelist: [{ userid: 1 }, { userid: 2 }, { userid: 3 }],
    })
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NewsLovesModal, {
                id: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :id="id" :title="title"><slot /><slot name="footer" /></div>',
            props: ['id', 'title', 'scrollable', 'noStacking'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant'],
          },
          NewsLovesUserInfo: {
            template: '<div class="news-loves-user-info" :data-id="id" />',
            props: ['id'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders b-modal with correct id', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').attributes('id')).toBe('newsLovesModal-1')
    })

    it('renders Close button in footer', async () => {
      const wrapper = await createWrapper()
      const closeBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Close'))
      expect(closeBtn.exists()).toBe(true)
      expect(closeBtn.classes()).toContain('white')
    })

    it('renders NewsLovesUserInfo for each lover', async () => {
      const wrapper = await createWrapper()
      const userInfos = wrapper.findAll('.news-loves-user-info')
      expect(userInfos.length).toBe(3)
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 10 })
      expect(wrapper.findComponent(NewsLovesModal).props('id')).toBe(10)
    })
  })

  describe('computed title', () => {
    it('shows singular freegler loves this for 1 love', async () => {
      mockNewsfeedStore.byId.mockReturnValue({
        id: 1,
        loves: 1,
        lovelist: [{ userid: 1 }],
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        '1 freegler loves this'
      )
    })

    it('shows plural freeglers love this for multiple loves', async () => {
      mockNewsfeedStore.byId.mockReturnValue({
        id: 1,
        loves: 5,
        lovelist: [{ userid: 1 }],
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        '5 freeglers love this'
      )
    })

    it('returns null when no newsfeed', async () => {
      mockNewsfeedStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NewsLovesModal)
      expect(component.vm.title).toBe(null)
    })
  })

  describe('data fetching', () => {
    it('fetches newsfeed with lovers on mount', async () => {
      await createWrapper({ id: 5 })
      expect(mockNewsfeedStore.fetch).toHaveBeenCalledWith(5, true, true)
    })
  })

  describe('close button', () => {
    it('calls hide when Close button clicked', async () => {
      const wrapper = await createWrapper()
      const closeBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Close'))
      await closeBtn.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
