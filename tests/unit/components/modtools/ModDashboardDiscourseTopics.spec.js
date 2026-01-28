import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ModDashboardDiscourseTopics from '~/modtools/components/ModDashboardDiscourseTopics.vue'

// Mock the composable
const mockDiscourseTopics = ref(null)
const mockMaybeFetch = vi.fn()

vi.mock('~/modtools/composables/useModDashboard', () => ({
  useModDashboard: () => ({
    DiscourseTopics: mockDiscourseTopics,
    maybeFetch: mockMaybeFetch,
  }),
}))

describe('ModDashboardDiscourseTopics', () => {
  const defaultProps = {
    groupid: 123,
    groupName: 'Test Group',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  }

  const mockTopicsData = {
    latest_posts: [
      {
        id: 1,
        name: 'User One',
        topic_title: 'Topic One',
        topic_slug: 'topic-one',
        topic_id: 101,
        post_number: 1,
        avatar_template: '/avatar/{size}/user1.png',
        raw: 'Content one',
        updated_at: '2024-01-15T12:00:00Z',
      },
      {
        id: 2,
        name: 'User Two',
        topic_title: 'Topic Two',
        topic_slug: 'topic-two',
        topic_id: 102,
        post_number: 2,
        avatar_template: '/avatar/{size}/user2.png',
        raw: 'Content two',
        updated_at: '2024-01-16T12:00:00Z',
      },
      {
        id: 3,
        name: 'User Three',
        topic_title: 'Topic Three',
        topic_slug: 'topic-three',
        topic_id: 103,
        post_number: 3,
        avatar_template: '/avatar/{size}/user3.png',
        raw: 'Content three',
        updated_at: '2024-01-17T12:00:00Z',
      },
      {
        id: 4,
        name: 'User Four',
        topic_title: 'Topic Four',
        topic_slug: 'topic-four',
        topic_id: 104,
        post_number: 4,
        avatar_template: '/avatar/{size}/user4.png',
        raw: 'Content four',
        updated_at: '2024-01-18T12:00:00Z',
      },
      {
        id: 5,
        name: 'User Five',
        topic_title: 'Topic Five',
        topic_slug: 'topic-five',
        topic_id: 105,
        post_number: 5,
        avatar_template: '/avatar/{size}/user5.png',
        raw: 'Content five',
        updated_at: '2024-01-19T12:00:00Z',
      },
      {
        id: 6,
        name: 'User Six',
        topic_title: 'Topic Six - Should Not Display',
        topic_slug: 'topic-six',
        topic_id: 106,
        post_number: 6,
        avatar_template: '/avatar/{size}/user6.png',
        raw: 'Content six',
        updated_at: '2024-01-20T12:00:00Z',
      },
    ],
  }

  function mountComponent(props = {}) {
    return mount(ModDashboardDiscourseTopics, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-card-title': {
            template: '<h3 class="card-title"><slot /></h3>',
          },
          ModDashboardDiscourseTopic: {
            template:
              '<div class="discourse-topic">{{ topic.topic_title }}</div>',
            props: ['topic'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    setActivePinia(createPinia())
    mockDiscourseTopics.value = null
    mockMaybeFetch.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('does not render when DiscourseTopics is null', () => {
      mockDiscourseTopics.value = null
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(false)
    })

    it('renders when DiscourseTopics is available', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('renders card title', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Latest Discourse Topics')
    })

    it('renders descriptive text about Discourse', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Discourse is where we can chat')
    })

    it('renders NoticeMessage about WhatsApp groups', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('WhatsApp')
    })

    it('renders WhatsApp chat link', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      const chatLink = wrapper.findAll('a').find((a) => a.text() === 'chat')
      expect(chatLink).toBeDefined()
      expect(chatLink.attributes('href')).toContain('chat.whatsapp.com')
    })

    it('renders WhatsApp announcements link', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      const announcementsLink = wrapper
        .findAll('a')
        .find((a) => a.text() === 'announcements')
      expect(announcementsLink).toBeDefined()
      expect(announcementsLink.attributes('href')).toContain(
        'chat.whatsapp.com'
      )
    })
  })

  describe('top5 computed property', () => {
    it('limits topics to 5', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      const topics = wrapper.findAll('.discourse-topic')
      expect(topics).toHaveLength(5)
    })

    it('displays first 5 topics in order', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      const topics = wrapper.findAll('.discourse-topic')
      expect(topics[0].text()).toContain('Topic One')
      expect(topics[4].text()).toContain('Topic Five')
    })

    it('does not display 6th topic', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Topic Six')
    })

    it('returns empty array when no latest_posts', () => {
      mockDiscourseTopics.value = JSON.stringify({})
      const wrapper = mountComponent()
      const topics = wrapper.findAll('.discourse-topic')
      expect(topics).toHaveLength(0)
    })

    it('handles fewer than 5 topics', () => {
      const fewTopics = {
        latest_posts: mockTopicsData.latest_posts.slice(0, 2),
      }
      mockDiscourseTopics.value = JSON.stringify(fewTopics)
      const wrapper = mountComponent()
      const topics = wrapper.findAll('.discourse-topic')
      expect(topics).toHaveLength(2)
    })

    it('handles empty latest_posts array', () => {
      mockDiscourseTopics.value = JSON.stringify({ latest_posts: [] })
      const wrapper = mountComponent()
      const topics = wrapper.findAll('.discourse-topic')
      expect(topics).toHaveLength(0)
    })
  })

  describe('refresh timer', () => {
    it('sets up refresh timer on mount', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      mountComponent()
      expect(vi.getTimerCount()).toBe(1)
    })

    it('calls maybeFetch after 10 minutes', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      mountComponent()

      // Initial timer hasn't fired yet
      expect(mockMaybeFetch).not.toHaveBeenCalled()

      // Advance 10 minutes
      vi.advanceTimersByTime(10 * 60 * 1000)

      expect(mockMaybeFetch).toHaveBeenCalledTimes(1)
    })

    it('sets up new timer after refresh', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      mountComponent()

      // First timer
      vi.advanceTimersByTime(10 * 60 * 1000)
      expect(mockMaybeFetch).toHaveBeenCalledTimes(1)

      // Second timer should be set
      vi.advanceTimersByTime(10 * 60 * 1000)
      expect(mockMaybeFetch).toHaveBeenCalledTimes(2)
    })

    it('clears timer on unmount', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent()

      wrapper.unmount()

      // Timer should be cleared
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('props', () => {
    it('accepts null groupid (default)', () => {
      mockDiscourseTopics.value = JSON.stringify(mockTopicsData)
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.props('groupid')).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('handles null latest_posts', () => {
      mockDiscourseTopics.value = JSON.stringify({ latest_posts: null })
      const wrapper = mountComponent()
      const topics = wrapper.findAll('.discourse-topic')
      expect(topics).toHaveLength(0)
    })

    it('handles undefined latest_posts', () => {
      mockDiscourseTopics.value = JSON.stringify({ other: 'data' })
      const wrapper = mountComponent()
      const topics = wrapper.findAll('.discourse-topic')
      expect(topics).toHaveLength(0)
    })
  })
})
