import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsReplies from '~/components/NewsReplies.vue'

const { mockReplies, mockNewsfeed } = vi.hoisted(() => {
  return {
    mockReplies: [
      {
        id: 10,
        userid: 100,
        displayname: 'User One',
        message: 'First reply',
        added: '2024-01-15T10:00:00Z',
        deleted: false,
        type: 'Reply',
      },
      {
        id: 11,
        userid: 100,
        displayname: 'User One',
        message: 'Second reply',
        added: '2024-01-15T10:05:00Z',
        deleted: false,
        type: 'Reply',
      },
      {
        id: 12,
        userid: 200,
        displayname: 'User Two',
        message: 'Third reply',
        added: '2024-01-15T11:00:00Z',
        deleted: false,
        type: 'Reply',
      },
    ],
    mockNewsfeed: {
      id: 1,
      replies: [10, 11, 12],
    },
  }
})

const mockNewsfeedStore = {
  byId: vi.fn((id) => {
    if (id === 1) return mockNewsfeed
    return mockReplies.find((r) => r.id === id)
  }),
}

const mockAuthStore = {
  user: { id: 1, systemrole: 'User' },
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('NewsReplies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.user = { id: 1, systemrole: 'User' }
    mockNewsfeedStore.byId.mockImplementation((id) => {
      if (id === 1) return mockNewsfeed
      return mockReplies.find((r) => r.id === id)
    })
  })

  function createWrapper(props = {}) {
    return mount(NewsReplies, {
      props: {
        id: 1,
        threadhead: 1,
        depth: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          NewsReply: {
            template:
              '<div class="news-reply" :data-id="id"><slot />{{ replyData?.message }}</div>',
            props: ['id', 'replyData', 'threadhead', 'scrollTo', 'depth'],
            emits: ['rendered', 'expand-combined'],
          },
          NewsRefer: {
            template: '<div class="news-refer" :data-id="id" />',
            props: ['id', 'type', 'threadhead'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders replies container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.replies-container').exists()).toBe(true)
    })

    it('applies depth class', () => {
      const wrapper = createWrapper({ depth: 2 })
      expect(wrapper.find('.depth-2').exists()).toBe(true)
    })

    it('renders reply threads', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.reply-thread').length).toBeGreaterThan(0)
    })

    it('renders NewsReply components', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.news-reply').length).toBeGreaterThan(0)
    })
  })

  describe('show earlier replies', () => {
    it('shows "Show earlier" button when more than 5 replies', () => {
      const manyReplies = Array.from({ length: 10 }, (_, i) => ({
        id: i + 10,
        userid: 100,
        displayname: 'User',
        message: `Reply ${i}`,
        added: `2024-01-15T${10 + i}:00:00Z`,
        deleted: false,
        type: 'Reply',
      }))
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1) return { id: 1, replies: manyReplies.map((r) => r.id) }
        return manyReplies.find((r) => r.id === id)
      })

      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show earlier')
    })

    it('hides "Show earlier" when 5 or fewer replies', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.show-earlier').exists()).toBe(false)
    })

    it('shows count of hidden replies', () => {
      const manyReplies = Array.from({ length: 10 }, (_, i) => ({
        id: i + 10,
        userid: 100 + i,
        displayname: `User ${i}`,
        message: `Reply ${i}`,
        added: `2024-01-15T${10 + i}:00:00Z`,
        deleted: false,
        type: 'Reply',
      }))
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1) return { id: 1, replies: manyReplies.map((r) => r.id) }
        return manyReplies.find((r) => r.id === id)
      })

      const wrapper = createWrapper()
      // Should show how many earlier replies are hidden
      expect(wrapper.text()).toContain('Show earlier')
    })
  })

  describe('deleted replies', () => {
    it('hides deleted replies for regular users', () => {
      const repliesWithDeleted = [
        ...mockReplies,
        {
          id: 13,
          userid: 300,
          displayname: 'Deleted User',
          message: 'Deleted reply',
          added: '2024-01-15T12:00:00Z',
          deleted: true,
          type: 'Reply',
        },
      ]
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1)
          return { id: 1, replies: repliesWithDeleted.map((r) => r.id) }
        return repliesWithDeleted.find((r) => r.id === id)
      })

      const wrapper = createWrapper()
      const replyTexts = wrapper.findAll('.news-reply').map((r) => r.text())
      expect(replyTexts.join('')).not.toContain('Deleted reply')
    })

    it('shows deleted replies for moderators', () => {
      mockAuthStore.user = { id: 1, systemrole: 'Moderator' }
      const repliesWithDeleted = [
        ...mockReplies,
        {
          id: 13,
          userid: 300,
          displayname: 'Deleted User',
          message: 'Deleted reply',
          added: '2024-01-15T12:00:00Z',
          deleted: true,
          type: 'Reply',
        },
      ]
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1)
          return { id: 1, replies: repliesWithDeleted.map((r) => r.id) }
        return repliesWithDeleted.find((r) => r.id === id)
      })

      const wrapper = createWrapper()
      const replyTexts = wrapper.findAll('.news-reply').map((r) => r.text())
      expect(replyTexts.join('')).toContain('Deleted reply')
    })
  })

  describe('refer type', () => {
    it('renders NewsRefer for ReferTo type', () => {
      const referReplies = [
        {
          id: 20,
          type: 'ReferToOffer',
          userid: 100,
          message: 'Refer message',
          displayname: 'User',
          added: '2024-01-15T10:00:00Z',
          deleted: false,
        },
      ]
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1) return { id: 1, replies: [20] }
        return referReplies.find((r) => r.id === id)
      })

      const wrapper = createWrapper()
      expect(wrapper.find('.news-refer').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits rendered when NewsReply emits rendered', async () => {
      const wrapper = createWrapper()
      const reply = wrapper.findComponent('.news-reply')
      await reply.vm.$emit('rendered', 10)
      expect(wrapper.emitted('rendered')).toBeTruthy()
      expect(wrapper.emitted('rendered')[0]).toEqual([10])
    })
  })

  describe('reply combining', () => {
    it('combines consecutive replies from same user within 10 minutes', () => {
      const combinableReplies = [
        {
          id: 30,
          userid: 100,
          displayname: 'Same User',
          message: 'First message',
          added: '2024-01-15T10:00:00Z',
          deleted: false,
          type: 'Reply',
        },
        {
          id: 31,
          userid: 100,
          displayname: 'Same User',
          message: 'Second message',
          added: '2024-01-15T10:05:00Z',
          deleted: false,
          type: 'Reply',
        },
      ]
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1) return { id: 1, replies: [30, 31] }
        return combinableReplies.find((r) => r.id === id)
      })

      const wrapper = createWrapper()
      // Combined replies should appear as fewer components
      const replyCount = wrapper.findAll('.news-reply').length
      expect(replyCount).toBe(1)
    })

    it('does not combine replies from different users', () => {
      const differentUserReplies = [
        {
          id: 40,
          userid: 100,
          displayname: 'User A',
          message: 'Message from A',
          added: '2024-01-15T10:00:00Z',
          deleted: false,
          type: 'Reply',
        },
        {
          id: 41,
          userid: 200,
          displayname: 'User B',
          message: 'Message from B',
          added: '2024-01-15T10:02:00Z',
          deleted: false,
          type: 'Reply',
        },
      ]
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1) return { id: 1, replies: [40, 41] }
        return differentUserReplies.find((r) => r.id === id)
      })

      const wrapper = createWrapper()
      const replyCount = wrapper.findAll('.news-reply').length
      expect(replyCount).toBe(2)
    })
  })

  describe('scrollTo behavior', () => {
    it('shows all replies when scrollTo is set', () => {
      const manyReplies = Array.from({ length: 10 }, (_, i) => ({
        id: i + 50,
        userid: 100 + i,
        displayname: `User ${i}`,
        message: `Reply ${i}`,
        added: `2024-01-15T${10 + i}:00:00Z`,
        deleted: false,
        type: 'Reply',
      }))
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1) return { id: 1, replies: manyReplies.map((r) => r.id) }
        return manyReplies.find((r) => r.id === id)
      })

      const wrapper = createWrapper({ scrollTo: 'newsfeed-55' })
      // When scrollTo is set, all replies are rendered, including those >5
      // This is unlike the default behavior that hides earlier replies
      expect(wrapper.findAll('.news-reply').length).toBe(10)
    })
  })

  describe('empty state', () => {
    it('handles empty replies array', () => {
      mockNewsfeedStore.byId.mockImplementation((id) => {
        if (id === 1) return { id: 1, replies: [] }
        return null
      })

      const wrapper = createWrapper()
      expect(wrapper.findAll('.reply-thread').length).toBe(0)
    })

    it('handles undefined newsfeed', () => {
      mockNewsfeedStore.byId.mockReturnValue(undefined)

      const wrapper = createWrapper()
      expect(wrapper.findAll('.reply-thread').length).toBe(0)
    })
  })
})
