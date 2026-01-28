import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModDashboardDiscourseTopic from '~/modtools/components/ModDashboardDiscourseTopic.vue'

// Mock timeago composable
vi.mock('~/composables/useDateFormat', () => ({
  useDateFormat: () => ({
    timeago: vi.fn((date) => `timeago: ${date}`),
  }),
}))

describe('ModDashboardDiscourseTopic', () => {
  const defaultProps = {
    topic: {
      name: 'Test User',
      updated_at: '2024-01-15T12:00:00Z',
      topic_title: 'Test Topic Title',
      topic_slug: 'test-topic-title',
      topic_id: 123,
      post_number: 5,
      avatar_template: '/user_avatar/{size}/test.png',
      raw: 'This is the raw content of the topic post.',
    },
  }

  function mountComponent(props = {}) {
    return mount(ModDashboardDiscourseTopic, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          ProfileImage: {
            template: '<img class="profile-image" :src="image" />',
            props: ['image', 'isThumbnail', 'size'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
        },
        mocks: {
          timeago: (date) => `timeago: ${date}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders topic name', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('renders topic title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Topic Title')
    })

    it('renders posted text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('posted')
    })

    it('renders profile image', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('renders snippet content', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('This is the raw content')
    })
  })

  describe('avatar computed property', () => {
    it('generates correct avatar URL', () => {
      const wrapper = mountComponent()
      // Avatar template starts with / so result has double slash after domain
      expect(wrapper.vm.avatar).toBe(
        'https://discourse.ilovefreegle.org//user_avatar/45/test.png'
      )
    })

    it('replaces size placeholder correctly', () => {
      const wrapper = mountComponent({
        topic: {
          ...defaultProps.topic,
          avatar_template: '/uploads/{size}/avatar.png',
        },
      })
      expect(wrapper.vm.avatar).toContain('/uploads/45/avatar.png')
    })
  })

  describe('snippet computed property', () => {
    it('removes image markdown', () => {
      const wrapper = mountComponent({
        topic: {
          ...defaultProps.topic,
          raw: 'Text with ![image description](url) included',
        },
      })
      expect(wrapper.vm.snippet).not.toContain('![image')
    })

    it('replaces quote tags with quotes', () => {
      const wrapper = mountComponent({
        topic: {
          ...defaultProps.topic,
          raw: '[quote="someone"]quoted text[/quote]',
        },
      })
      expect(wrapper.vm.snippet).toContain('"')
    })

    it('truncates to 120 chars plus ellipsis', () => {
      const longContent = 'a'.repeat(200)
      const wrapper = mountComponent({
        topic: {
          ...defaultProps.topic,
          raw: longContent,
        },
      })
      expect(wrapper.vm.snippet).toHaveLength(123) // 120 chars + '...'
    })

    it('truncates at > character', () => {
      const wrapper = mountComponent({
        topic: {
          ...defaultProps.topic,
          raw: 'Before > After',
        },
      })
      expect(wrapper.vm.snippet).toContain('Before')
      expect(wrapper.vm.snippet).not.toContain('After')
    })
  })

  describe('link computed property', () => {
    it('generates correct discourse link', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.link).toBe(
        'https://discourse.ilovefreegle.org/t/test-topic-title/123/5'
      )
    })

    it('uses topic slug and id correctly', () => {
      const wrapper = mountComponent({
        topic: {
          ...defaultProps.topic,
          topic_slug: 'another-topic',
          topic_id: 456,
          post_number: 10,
        },
      })
      expect(wrapper.vm.link).toBe(
        'https://discourse.ilovefreegle.org/t/another-topic/456/10'
      )
    })

    it('link is used in ExternalLink href', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a')
      expect(link.attributes('href')).toContain('discourse.ilovefreegle.org')
    })
  })
})
