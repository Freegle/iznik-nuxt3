import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ModDashboardPopularPosts from '~/modtools/components/ModDashboardPopularPosts.vue'

// Mock the composable
const mockLoading = ref(false)
const mockPopularPosts = ref(null)

vi.mock('~/modtools/composables/useModDashboard', () => ({
  useModDashboard: () => ({
    loading: mockLoading,
    PopularPosts: mockPopularPosts,
  }),
}))

// Mock pluralise
vi.mock('~/composables/usePlural', () => ({
  usePlural: () => ({
    pluralise: (word, count, include) => {
      if (Array.isArray(word)) {
        const singular = word[0]
        const plural = word[1]
        return include
          ? `${count} ${count === 1 ? singular : plural}`
          : count === 1
          ? singular
          : plural
      }
      return include
        ? `${count} ${word}${count !== 1 ? 's' : ''}`
        : `${word}${count !== 1 ? 's' : ''}`
    },
  }),
}))

describe('ModDashboardPopularPosts', () => {
  const defaultProps = {
    groupid: 123,
    groupName: 'Test Group',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  }

  const mockPosts = [
    {
      id: 1,
      subject: 'OFFER: Bicycle',
      url: 'https://example.com/post/1',
      views: 100,
      replies: 5,
    },
    {
      id: 2,
      subject: 'WANTED: Garden tools',
      url: 'https://example.com/post/2',
      views: 50,
      replies: 3,
    },
    {
      id: 3,
      subject: 'OFFER: Books collection',
      url: 'https://example.com/post/3',
      views: 200,
      replies: 10,
    },
    {
      id: 4,
      subject: 'TAKEN: Sofa',
      url: 'https://example.com/post/4',
      views: 1,
      replies: 1,
    },
  ]

  function mountComponent(props = {}) {
    return mount(ModDashboardPopularPosts, {
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
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'sm'],
          },
          'v-icon': {
            template: '<span class="icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
        },
        mocks: {
          pluralise: (word, count, include) => {
            if (Array.isArray(word)) {
              const singular = word[0]
              const plural = word[1]
              return include
                ? `${count} ${count === 1 ? singular : plural}`
                : count === 1
                ? singular
                : plural
            }
            return include
              ? `${count} ${word}${count !== 1 ? 's' : ''}`
              : `${word}${count !== 1 ? 's' : ''}`
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockLoading.value = false
    mockPopularPosts.value = null
  })

  describe('rendering', () => {
    it('renders heading with group name', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Popular Posts')
      expect(wrapper.text()).toContain('Test Group')
    })

    it('renders descriptive paragraph', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('most viewed')
      expect(wrapper.text()).toContain('most replied to')
    })

    it('shows loading state when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')
    })

    it('shows pulsate class when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('shows text-faded class when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.text-faded').exists()).toBe(true)
    })

    it('hides loading state when not loading', () => {
      mockLoading.value = false
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Loading')
    })

    it('renders post list when data available', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('OFFER: Bicycle')
      expect(wrapper.text()).toContain('WANTED: Garden tools')
    })

    it('renders post subjects', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('OFFER: Bicycle')
      expect(wrapper.text()).toContain('OFFER: Books collection')
    })

    it('does not render when no data and not loading', () => {
      mockLoading.value = false
      mockPopularPosts.value = []
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('OFFER')
    })

    it('does not render card when PopularPosts is null and not loading', () => {
      mockLoading.value = false
      mockPopularPosts.value = null
      const wrapper = mountComponent()
      // No external links should be rendered
      expect(wrapper.findAll('.external-link')).toHaveLength(0)
    })
  })

  describe('post IDs and links', () => {
    it('renders post ids', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('2')
    })

    it('renders external links for each post', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      const links = wrapper.findAll('.external-link')
      expect(links.length).toBe(mockPosts.length)
    })

    it('links to correct URLs', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      const links = wrapper.findAll('.external-link')
      expect(links[0].attributes('href')).toBe('https://example.com/post/1')
      expect(links[1].attributes('href')).toBe('https://example.com/post/2')
    })

    it('renders hashtag icons for post ids', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-icon="hashtag"]')
      expect(icons.length).toBe(mockPosts.length)
    })
  })

  describe('views display', () => {
    it('displays view counts with icon', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      const eyeIcons = wrapper.findAll('[data-icon="eye"]')
      expect(eyeIcons.length).toBe(mockPosts.length)
    })

    it('displays correct view counts', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('100 views')
      expect(wrapper.text()).toContain('50 views')
      expect(wrapper.text()).toContain('200 views')
    })

    it('displays singular form for 1 view', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1 view')
      // Should not have "1 views"
      expect(wrapper.text()).not.toMatch(/\b1 views\b/)
    })

    it('displays "web" label with views', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('web')
    })
  })

  describe('replies display', () => {
    it('displays reply counts with icon', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      const replyIcons = wrapper.findAll('[data-icon="reply"]')
      expect(replyIcons.length).toBe(mockPosts.length)
    })

    it('displays correct reply counts', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('5 replies')
      expect(wrapper.text()).toContain('3 replies')
      expect(wrapper.text()).toContain('10 replies')
    })

    it('displays singular form for 1 reply', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1 reply')
      // Should not have "1 replies"
      expect(wrapper.text()).not.toMatch(/\b1 replies\b/)
    })
  })

  describe('props', () => {
    it('accepts groupid prop', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.props('groupid')).toBe(123)
    })

    it('accepts null groupid (default)', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.props('groupid')).toBeNull()
    })

    it('accepts groupName prop', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.props('groupName')).toBe('Test Group')
    })

    it('accepts start date prop', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.props('start')).toEqual(new Date('2024-01-01'))
    })

    it('accepts end date prop', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.props('end')).toEqual(new Date('2024-01-31'))
    })

    it('displays different group name', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent({ groupName: 'Another Group' })
      expect(wrapper.text()).toContain('Another Group')
    })
  })

  describe('edge cases', () => {
    it('handles empty posts array', () => {
      mockPopularPosts.value = []
      const wrapper = mountComponent()
      expect(wrapper.findAll('.external-link')).toHaveLength(0)
    })

    it('handles post with zero views', () => {
      mockPopularPosts.value = [
        {
          id: 1,
          subject: 'Test Post',
          url: 'https://example.com/post/1',
          views: 0,
          replies: 5,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('0 views')
    })

    it('handles post with zero replies', () => {
      mockPopularPosts.value = [
        {
          id: 1,
          subject: 'Test Post',
          url: 'https://example.com/post/1',
          views: 100,
          replies: 0,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('0 replies')
    })

    it('handles large view counts', () => {
      mockPopularPosts.value = [
        {
          id: 1,
          subject: 'Viral Post',
          url: 'https://example.com/post/1',
          views: 1000000,
          replies: 50000,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1000000 views')
      expect(wrapper.text()).toContain('50000 replies')
    })

    it('handles long subject lines', () => {
      const longSubject =
        'OFFER: This is a very long subject line that might cause layout issues if not handled properly'
      mockPopularPosts.value = [
        {
          id: 1,
          subject: longSubject,
          url: 'https://example.com/post/1',
          views: 10,
          replies: 5,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(longSubject)
    })
  })

  describe('loading and data transitions', () => {
    it('shows loading when loading with data', () => {
      mockLoading.value = true
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('shows data when loading completes', async () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')

      mockLoading.value = false
      mockPopularPosts.value = mockPosts
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('OFFER: Bicycle')
    })
  })

  describe('subject styling', () => {
    it('applies text-success class to subjects', () => {
      mockPopularPosts.value = mockPosts
      const wrapper = mountComponent()
      // The subject is in a col with text-success font-weight-bold class
      expect(wrapper.html()).toContain('text-success')
      expect(wrapper.html()).toContain('font-weight-bold')
    })
  })
})
