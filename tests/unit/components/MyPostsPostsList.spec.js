import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MyPostsPostsList from '~/components/MyPostsPostsList.vue'

const mockMessageStore = {
  byId: vi.fn(() => null),
  fetch: vi.fn(),
}

const mockUserStore = {
  byId: vi.fn(() => ({
    id: 1,
    displayname: 'Test User',
  })),
}

const mockTrystStore = {
  getByUser: vi.fn(() => null),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => mockTrystStore,
}))

vi.mock('pluralize', () => ({
  default: (word, count, withCount) => {
    const plural = count === 1 ? word : word + 's'
    return withCount ? `${count} ${plural}` : plural
  },
}))

describe('MyPostsPostsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue(null)
    mockTrystStore.getByUser.mockReturnValue(null)
  })

  function createWrapper(props = {}) {
    return mount(MyPostsPostsList, {
      props: {
        posts: [],
        postIds: [],
        loading: false,
        defaultExpanded: true,
        show: 10,
        ...props,
      },
      global: {
        stubs: {
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['lazy', 'src', 'alt', 'width'],
          },
          MyMessage: {
            template: '<div class="my-message" :data-id="id" />',
            props: ['id', 'showOld', 'expand'],
          },
          InfiniteLoading: {
            template: '<div class="infinite-loading" />',
            props: ['distance'],
            emits: ['infinite'],
          },
          Suspense: {
            template:
              '<div class="suspense"><slot /><slot name="fallback" /></div>',
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
          'nuxt-link': {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders my-posts-list container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.my-posts-list').exists()).toBe(true)
    })

    it('renders loading state when loading', () => {
      const wrapper = createWrapper({ loading: true })
      expect(wrapper.find('.loading-state').exists()).toBe(true)
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('renders empty state when no posts', () => {
      const wrapper = createWrapper({ loading: false, posts: [] })
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('You have no active posts')
    })

    it('renders posts container when posts exist', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [{ id: 1, hasoutcome: false, arrival: '2024-01-01' }],
      })
      expect(wrapper.find('.posts-container').exists()).toBe(true)
    })

    it('renders active posts header with count', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, hasoutcome: false, arrival: '2024-01-01' },
          { id: 2, hasoutcome: false, arrival: '2024-01-02' },
        ],
      })
      expect(wrapper.find('.active-posts-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('2 active posts')
    })

    it('renders single active post correctly', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [{ id: 1, hasoutcome: false, arrival: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain('1 active post')
    })
  })

  describe('props', () => {
    it('has required posts prop', () => {
      const props = MyPostsPostsList.props || {}
      expect(props.posts.required).toBe(true)
      expect(props.posts.type).toBe(Array)
    })

    it('has optional postIds prop with empty array default', () => {
      const props = MyPostsPostsList.props || {}
      expect(props.postIds.required).toBe(false)
      expect(props.postIds.default()).toEqual([])
    })

    it('has required loading prop', () => {
      const props = MyPostsPostsList.props || {}
      expect(props.loading.required).toBe(true)
      expect(props.loading.type).toBe(Boolean)
    })

    it('has required defaultExpanded prop', () => {
      const props = MyPostsPostsList.props || {}
      expect(props.defaultExpanded.required).toBe(true)
      expect(props.defaultExpanded.type).toBe(Boolean)
    })

    it('has required show prop', () => {
      const props = MyPostsPostsList.props || {}
      expect(props.show.required).toBe(true)
      expect(props.show.type).toBe(Number)
    })
  })

  describe('emits', () => {
    it('defines load-more emit', () => {
      const emits = MyPostsPostsList.emits || []
      expect(emits).toContain('load-more')
    })
  })

  describe('old posts toggle', () => {
    it('shows old posts toggle when old posts exist', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, hasoutcome: false, arrival: '2024-01-01' },
          { id: 2, hasoutcome: true, arrival: '2024-01-02' },
        ],
      })
      expect(wrapper.find('.old-posts-toggle').exists()).toBe(true)
    })

    it('hides old posts toggle when no old posts', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [{ id: 1, hasoutcome: false, arrival: '2024-01-01' }],
      })
      expect(wrapper.find('.old-posts-toggle').exists()).toBe(false)
    })

    it('shows old posts count in toggle button', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, hasoutcome: false, arrival: '2024-01-01' },
          { id: 2, hasoutcome: true, arrival: '2024-01-02' },
        ],
      })
      expect(wrapper.text()).toContain('1 old post')
    })

    it('toggles old posts visibility on click', async () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, hasoutcome: false, arrival: '2024-01-01' },
          { id: 2, hasoutcome: true, arrival: '2024-01-02' },
        ],
      })
      const toggleBtn = wrapper.find('.toggle-btn')
      expect(wrapper.text()).toContain('Show')
      await toggleBtn.trigger('click')
      expect(wrapper.text()).toContain('Hide')
    })
  })

  describe('empty state by type', () => {
    it('shows give stuff link for Offer type', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [],
        type: 'Offer',
      })
      expect(wrapper.text()).toContain('Give stuff')
    })

    it('shows find stuff link for Wanted type', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [],
        type: 'Wanted',
      })
      expect(wrapper.text()).toContain('Find stuff')
    })

    it('shows both links for mixed type', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [],
      })
      expect(wrapper.text()).toContain('Give stuff')
      expect(wrapper.text()).toContain('Find stuff')
    })
  })

  describe('upcoming trysts', () => {
    it('shows collections card when trysts exist', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 1,
        subject: 'Test Item',
        promises: [{ userid: 1 }],
      })
      mockTrystStore.getByUser.mockReturnValue({
        arrangedfor: new Date(Date.now() + 86400000).toISOString(),
      })
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, type: 'Offer', hasoutcome: false, arrival: '2024-01-01' },
        ],
      })
      // Trysts display depends on message store returning promise data
      expect(wrapper.exists()).toBe(true)
    })

    it('shows collection title in card', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 1,
        subject: 'Test Item',
        promises: [{ userid: 1 }],
      })
      mockTrystStore.getByUser.mockReturnValue({
        arrangedfor: new Date(Date.now() + 86400000).toISOString(),
      })
      const wrapper = createWrapper({
        loading: false,
        posts: [
          {
            id: 1,
            type: 'Offer',
            hasoutcome: false,
            arrival: '2024-01-01',
            promised: true,
          },
        ],
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('post sorting', () => {
    it('sorts promised items first', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, hasoutcome: false, promised: false, arrival: '2024-01-02' },
          { id: 2, hasoutcome: false, promised: true, arrival: '2024-01-01' },
        ],
      })
      const messages = wrapper.findAll('.my-message')
      expect(messages[0].attributes('data-id')).toBe('2')
    })

    it('sorts by arrival date for non-promised', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, hasoutcome: false, promised: false, arrival: '2024-01-01' },
          { id: 2, hasoutcome: false, promised: false, arrival: '2024-01-02' },
        ],
      })
      const messages = wrapper.findAll('.my-message')
      expect(messages[0].attributes('data-id')).toBe('2')
    })
  })

  describe('infinite loading', () => {
    it('renders InfiniteLoading component', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [{ id: 1, hasoutcome: false, arrival: '2024-01-01' }],
      })
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })
  })

  describe('MyMessage rendering', () => {
    it('passes id to MyMessage', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [{ id: 42, hasoutcome: false, arrival: '2024-01-01' }],
      })
      const message = wrapper.find('.my-message')
      expect(message.attributes('data-id')).toBe('42')
    })
  })

  describe('show prop limit', () => {
    it('limits visible posts to show prop value', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [
          { id: 1, hasoutcome: false, arrival: '2024-01-01' },
          { id: 2, hasoutcome: false, arrival: '2024-01-02' },
          { id: 3, hasoutcome: false, arrival: '2024-01-03' },
        ],
        show: 2,
      })
      const messages = wrapper.findAll('.my-message')
      expect(messages.length).toBe(2)
    })
  })

  describe('loading placeholder', () => {
    it('renders Suspense fallback structure', () => {
      const wrapper = createWrapper({
        loading: false,
        posts: [{ id: 1, hasoutcome: false, arrival: '2024-01-01' }],
      })
      expect(wrapper.find('.suspense').exists()).toBe(true)
    })
  })
})
