import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import UserSearch from '~/components/UserSearch.vue'

const mockDelete = vi.fn()
const mockUser = vi.fn()

vi.mock('~/stores/search', () => ({
  useSearchStore: () => ({
    delete: mockDelete,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get user() {
      return mockUser()
    },
  }),
}))

describe('UserSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.mockReturnValue({ id: 123 })
    mockDelete.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(UserSearch, {
      props: {
        search: {
          id: 1,
          term: 'bicycle',
          date: dayjs().toISOString(),
        },
        ...props,
      },
      global: {
        stubs: {
          'nuxt-link': {
            template:
              '<a :href="to" :class="[$attrs.class, \'nuxt-link\']"><slot /></a>',
            props: ['to'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders search chip container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.search-chip').exists()).toBe(true)
    })

    it('renders search term link', () => {
      const wrapper = createWrapper({
        search: { id: 1, term: 'table', date: new Date().toISOString() },
      })
      expect(wrapper.find('.search-term').text()).toBe('table')
    })

    it('links to browse page with search term', () => {
      const wrapper = createWrapper({
        search: { id: 1, term: 'chair', date: new Date().toISOString() },
      })
      const link = wrapper.find('a.search-term')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/browse/chair')
    })

    it('renders delete button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.search-delete').exists()).toBe(true)
    })

    it('renders icon in delete button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.search-delete .v-icon').exists()).toBe(true)
    })
  })

  describe('searchAgo computed', () => {
    it('shows "today" for searches from today', () => {
      const wrapper = createWrapper({
        search: { id: 1, term: 'test', date: dayjs().toISOString() },
      })
      expect(wrapper.find('.search-ago').text()).toBe('today')
    })

    it('shows "1d" for searches from yesterday', () => {
      const wrapper = createWrapper({
        search: {
          id: 1,
          term: 'test',
          date: dayjs().subtract(1, 'day').toISOString(),
        },
      })
      expect(wrapper.find('.search-ago').text()).toBe('1d')
    })

    it('shows days ago for older searches', () => {
      const wrapper = createWrapper({
        search: {
          id: 1,
          term: 'test',
          date: dayjs().subtract(5, 'day').toISOString(),
        },
      })
      expect(wrapper.find('.search-ago').text()).toBe('5d')
    })
  })

  describe('deleteSearch', () => {
    it('calls searchStore.delete with search id and user id', async () => {
      const wrapper = createWrapper({
        search: { id: 42, term: 'test', date: new Date().toISOString() },
      })
      await wrapper.find('.search-delete').trigger('click')
      expect(mockDelete).toHaveBeenCalledWith(42, 123)
    })

    it('uses current user id from auth store', async () => {
      mockUser.mockReturnValue({ id: 999 })
      const wrapper = createWrapper({
        search: { id: 1, term: 'test', date: new Date().toISOString() },
      })
      await wrapper.find('.search-delete').trigger('click')
      expect(mockDelete).toHaveBeenCalledWith(1, 999)
    })
  })

  describe('props', () => {
    it('requires search prop', () => {
      const search = { id: 99, term: 'lamp', date: new Date().toISOString() }
      const wrapper = createWrapper({ search })
      expect(wrapper.props('search')).toEqual(search)
    })
  })
})
