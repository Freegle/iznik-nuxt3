import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollGrid from '~/components/ScrollGrid.vue'

const { mockIsLandscape } = vi.hoisted(() => {
  const { ref: vueRef } = require('vue')
  return { mockIsLandscape: vueRef(false) }
})

vi.mock('~/composables/useOrientation', () => ({
  useOrientation: () => ({
    isLandscape: mockIsLandscape,
  }),
}))

describe('ScrollGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLandscape.value = false
  })

  function createWrapper(props = {}, slots = {}) {
    return mount(ScrollGrid, {
      props: {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' },
        ],
        ...props,
      },
      slots: {
        item: '<div class="test-item">{{ params.item.name }}</div>',
        ...slots,
      },
      global: {
        stubs: {
          VisibleWhen: {
            template: '<div class="visible-when"><slot /></div>',
            props: ['at', 'not'],
          },
          InfiniteLoading: {
            template: '<div class="infinite-loading" />',
            props: ['identifier', 'distance'],
          },
          'infinite-loading': {
            template: '<div class="infinite-loading" />',
            props: ['identifier', 'distance'],
          },
          'b-img': {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'lazy', 'width'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders scroll-grid when items exist', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.scroll-grid').exists()).toBe(true)
    })

    it('renders VisibleWhen components', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.visible-when').exists()).toBe(true)
    })

    it('renders infinite loading component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })
  })

  describe('empty state', () => {
    it('shows empty state when items array is empty', () => {
      const wrapper = createWrapper({ items: [], loading: false })
      expect(wrapper.find('.scroll-grid__empty').exists()).toBe(true)
    })

    it('shows default empty text', () => {
      const wrapper = createWrapper({ items: [], loading: false })
      expect(wrapper.text()).toContain('Nothing to show.')
    })

    it('shows custom empty text', () => {
      const wrapper = createWrapper({
        items: [],
        loading: false,
        emptyText: 'No results found',
      })
      expect(wrapper.text()).toContain('No results found')
    })

    it('shows empty icon', () => {
      const wrapper = createWrapper({ items: [], loading: false })
      expect(wrapper.find('.v-icon[data-icon="inbox"]').exists()).toBe(true)
    })

    it('shows custom empty icon', () => {
      const wrapper = createWrapper({
        items: [],
        loading: false,
        emptyIcon: 'search',
      })
      expect(wrapper.find('.v-icon[data-icon="search"]').exists()).toBe(true)
    })

    it('does not show empty state while loading', () => {
      const wrapper = createWrapper({ items: [], loading: true })
      expect(wrapper.find('.scroll-grid__empty').exists()).toBe(false)
    })
  })

  describe('slots', () => {
    it('renders header slot', () => {
      const wrapper = createWrapper(
        {},
        { header: '<div class="test-header">Header</div>' }
      )
      expect(wrapper.find('.test-header').exists()).toBe(true)
    })

    it('renders footer slot', () => {
      const wrapper = createWrapper(
        {},
        { footer: '<div class="test-footer">Footer</div>' }
      )
      expect(wrapper.find('.test-footer').exists()).toBe(true)
    })

    it('renders empty slot when provided', () => {
      const wrapper = createWrapper(
        { items: [], loading: false },
        { empty: '<div class="custom-empty">Custom empty</div>' }
      )
      expect(wrapper.find('.custom-empty').exists()).toBe(true)
    })
  })

  describe('visibleItems computed', () => {
    it('limits items to initialCount', () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }))
      const wrapper = createWrapper({ items, initialCount: 5 })
      expect(wrapper.vm.visibleItems.length).toBe(5)
    })

    it('shows all items when count exceeds initialCount', () => {
      const wrapper = createWrapper({ initialCount: 10 })
      expect(wrapper.vm.visibleItems.length).toBe(3)
    })
  })

  describe('itemKey function', () => {
    it('returns item id by default', () => {
      const wrapper = createWrapper()
      const result = wrapper.vm.itemKey({ id: 123, name: 'Test' }, 0)
      expect(result).toBe(123)
    })

    it('uses custom keyField', () => {
      const wrapper = createWrapper({
        items: [{ uid: 'abc', name: 'Test' }],
        keyField: 'uid',
      })
      const result = wrapper.vm.itemKey({ uid: 'abc', name: 'Test' }, 0)
      expect(result).toBe('abc')
    })

    it('returns index when key field is missing', () => {
      const wrapper = createWrapper({
        items: [{ name: 'Test' }],
        keyField: 'id',
      })
      const result = wrapper.vm.itemKey({ name: 'Test' }, 5)
      expect(result).toBe(5)
    })
  })

  describe('loadMore function', () => {
    it('increments toShow and calls loaded', () => {
      const items = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }))
      const wrapper = createWrapper({ items, initialCount: 10 })

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      wrapper.vm.loadMore(mockState)

      expect(mockState.loaded).toHaveBeenCalled()
      expect(wrapper.vm.visibleItems.length).toBe(20)
    })

    it('calls complete when all items shown', () => {
      const wrapper = createWrapper({ initialCount: 10 })

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      wrapper.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })

    it('emits loadMore event', () => {
      const items = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }))
      const wrapper = createWrapper({ items, initialCount: 10 })

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      wrapper.vm.loadMore(mockState)

      expect(wrapper.emitted('loadMore')).toBeTruthy()
      expect(wrapper.emitted('loadMore')[0]).toEqual([10])
    })
  })

  describe('props', () => {
    it('requires items array', () => {
      const wrapper = createWrapper({
        items: [{ id: 1 }, { id: 2 }],
      })
      expect(wrapper.props('items')).toHaveLength(2)
    })

    it('has keyField defaulting to id', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('keyField')).toBe('id')
    })

    it('has loading defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('loading')).toBe(false)
    })

    it('has distance defaulting to 1000', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('distance')).toBe(1000)
    })

    it('has emptyIcon defaulting to inbox', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('emptyIcon')).toBe('inbox')
    })

    it('has emptyText defaulting to Nothing to show.', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('emptyText')).toBe('Nothing to show.')
    })

    it('has initialCount defaulting to 10', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('initialCount')).toBe(10)
    })
  })

  describe('two-column layout', () => {
    it('renders twocolumn class for mobile/tablet', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.twocolumn').exists()).toBe(true)
    })

    it('renders onecolumn class for items', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.onecolumn').exists()).toBe(true)
    })
  })

  describe('single-column layout', () => {
    it('renders singlecolumn class for desktop', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.singlecolumn').exists()).toBe(true)
    })
  })
})
