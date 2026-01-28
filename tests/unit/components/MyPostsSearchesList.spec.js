import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import MyPostsSearchesList from '~/components/MyPostsSearchesList.vue'

const mockSearchList = vi.fn()

vi.mock('~/stores/search', () => ({
  useSearchStore: () => ({
    list: mockSearchList(),
  }),
}))

describe('MyPostsSearchesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchList.mockReturnValue([])
  })

  function createWrapper() {
    return mount(MyPostsSearchesList, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'nuxt-link': {
            template: '<a :href="to" :class="$attrs.class"><slot /></a>',
            props: ['to'],
          },
          UserSearch: {
            template: '<div class="user-search" :data-id="search.id" />',
            props: ['search'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders searches section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.searches-section').exists()).toBe(true)
    })

    it('shows header with search icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.searches-header').exists()).toBe(true)
      expect(wrapper.find('.v-icon[data-icon="search"]').exists()).toBe(true)
    })

    it('shows title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Your Searches')
    })
  })

  describe('empty state', () => {
    it('shows empty message when no searches', () => {
      mockSearchList.mockReturnValue([])
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('No saved searches yet')
    })

    it('shows link to find page', () => {
      mockSearchList.mockReturnValue([])
      const wrapper = createWrapper()
      const link = wrapper.find('.search-link')
      expect(link.attributes('href')).toBe('/find')
      expect(link.text()).toContain('Ask for something')
    })
  })

  describe('with searches', () => {
    it('renders UserSearch for each search', () => {
      mockSearchList.mockReturnValue([
        { id: 1, date: dayjs().subtract(1, 'day').toISOString(), daysago: 1 },
        { id: 2, date: dayjs().subtract(2, 'day').toISOString(), daysago: 2 },
        { id: 3, date: dayjs().subtract(3, 'day').toISOString(), daysago: 3 },
      ])
      const wrapper = createWrapper()
      expect(wrapper.findAll('.user-search').length).toBe(3)
    })

    it('hides empty message when searches exist', () => {
      mockSearchList.mockReturnValue([
        { id: 1, date: dayjs().toISOString(), daysago: 0 },
      ])
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('No saved searches yet')
    })

    it('filters out searches older than 90 days', () => {
      mockSearchList.mockReturnValue([
        { id: 1, date: dayjs().subtract(10, 'day').toISOString(), daysago: 10 },
        {
          id: 2,
          date: dayjs().subtract(100, 'day').toISOString(),
          daysago: 100,
        },
      ])
      const wrapper = createWrapper()
      // Only the 10-day-old search should show (within 90 days)
      expect(wrapper.findAll('.user-search').length).toBe(1)
    })

    it('includes searches exactly 90 days old', () => {
      mockSearchList.mockReturnValue([
        { id: 1, date: dayjs().subtract(90, 'day').toISOString(), daysago: 90 },
      ])
      const wrapper = createWrapper()
      expect(wrapper.findAll('.user-search').length).toBe(1)
    })

    it('excludes searches 91 days old', () => {
      mockSearchList.mockReturnValue([
        { id: 1, date: dayjs().subtract(91, 'day').toISOString(), daysago: 91 },
      ])
      const wrapper = createWrapper()
      expect(wrapper.findAll('.user-search').length).toBe(0)
    })

    it('sorts searches by daysago ascending', () => {
      mockSearchList.mockReturnValue([
        { id: 3, date: dayjs().subtract(30, 'day').toISOString(), daysago: 30 },
        { id: 1, date: dayjs().subtract(5, 'day').toISOString(), daysago: 5 },
        { id: 2, date: dayjs().subtract(15, 'day').toISOString(), daysago: 15 },
      ])
      const wrapper = createWrapper()
      const searches = wrapper.findAll('.user-search')
      // Should be sorted by daysago: 5, 15, 30
      expect(searches[0].attributes('data-id')).toBe('1')
      expect(searches[1].attributes('data-id')).toBe('2')
      expect(searches[2].attributes('data-id')).toBe('3')
    })
  })

  describe('null handling', () => {
    it('handles null search list', () => {
      mockSearchList.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('No saved searches yet')
    })

    it('handles undefined search list', () => {
      mockSearchList.mockReturnValue(undefined)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('No saved searches yet')
    })
  })
})
