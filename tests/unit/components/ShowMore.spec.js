import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowMore from '~/components/ShowMore.vue'

describe('ShowMore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ShowMore, {
      props: {
        items: [],
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
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

    it('renders items using slot', () => {
      const items = [{ id: 1 }, { id: 2 }]
      const wrapper = mount(ShowMore, {
        props: { items },
        slots: {
          item: ({ item }) => `Item ${item.id}`,
        },
        global: {
          stubs: {
            'b-button': { template: '<button><slot /></button>' },
          },
        },
      })

      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).toContain('Item 2')
    })

    it('renders default slot content when no item slot provided', () => {
      const items = [{ id: 1 }, { id: 2 }]
      const wrapper = createWrapper({ items })

      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).toContain('Item 2')
    })
  })

  describe('limit behavior', () => {
    it('shows all items when under limit', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const wrapper = createWrapper({ items, limit: 10 })

      expect(wrapper.vm.itemsToShow.length).toBe(3)
    })

    it('limits items when over limit', () => {
      const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      expect(wrapper.vm.itemsToShow.length).toBe(10)
    })

    it('shows exactly limit items when at limit', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      // At the limit (10 items, limit 10), all items show because it's not > limit
      expect(wrapper.vm.itemsToShow.length).toBe(10)
    })
  })

  describe('show more button', () => {
    it('shows button when items exceed limit', () => {
      const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Show more...')
    })

    it('hides button when items under limit', () => {
      const items = [{ id: 1 }, { id: 2 }]
      const wrapper = createWrapper({ items, limit: 10 })

      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('hides button when expanded', async () => {
      const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      await wrapper.find('button').trigger('click')

      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('expansion', () => {
    it('starts not expanded', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.expanded).toBe(false)
    })

    it('expands when show more is clicked', async () => {
      const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      await wrapper.find('button').trigger('click')

      expect(wrapper.vm.expanded).toBe(true)
    })

    it('shows all items when expanded', async () => {
      const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      await wrapper.find('button').trigger('click')

      expect(wrapper.vm.itemsToShow.length).toBe(15)
    })
  })

  describe('props', () => {
    it('requires items prop', () => {
      const items = [{ id: 1 }]
      const wrapper = createWrapper({ items })
      expect(wrapper.props('items')).toEqual([{ id: 1 }])
    })

    it('has limit prop defaulting to 10', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('limit')).toBe(10)
    })

    it('has keyfield prop defaulting to id', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('keyfield')).toBe('id')
    })

    it('accepts custom limit', () => {
      const wrapper = createWrapper({ limit: 5 })
      expect(wrapper.props('limit')).toBe(5)
    })

    it('accepts custom keyfield', () => {
      const wrapper = createWrapper({ keyfield: 'name' })
      expect(wrapper.props('keyfield')).toBe('name')
    })
  })

  describe('computed itemsToShow', () => {
    it('returns all items when expanded is true', () => {
      const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      wrapper.vm.expanded = true

      expect(wrapper.vm.itemsToShow.length).toBe(15)
    })

    it('returns sliced items when not expanded and over limit', () => {
      const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ items, limit: 10 })

      expect(wrapper.vm.itemsToShow.length).toBe(10)
      expect(wrapper.vm.itemsToShow[0].id).toBe(1)
      expect(wrapper.vm.itemsToShow[9].id).toBe(10)
    })

    it('returns all items when under limit regardless of expanded', () => {
      const items = [{ id: 1 }, { id: 2 }]
      const wrapper = createWrapper({ items, limit: 10 })

      expect(wrapper.vm.itemsToShow.length).toBe(2)
    })
  })

  describe('keyfield usage', () => {
    it('uses custom keyfield for item keys', () => {
      const items = [{ name: 'Alice' }, { name: 'Bob' }]
      const wrapper = createWrapper({ items, keyfield: 'name' })

      expect(wrapper.text()).toContain('Item Alice')
      expect(wrapper.text()).toContain('Item Bob')
    })
  })
})
