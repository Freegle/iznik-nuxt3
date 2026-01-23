import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowMore from '~/components/ShowMore.vue'

describe('ShowMore', () => {
  const shortList = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]

  const longList = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }))

  function createWrapper(props = {}, slots = {}) {
    return mount(ShowMore, {
      props: {
        items: shortList,
        ...props,
      },
      slots,
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
    it('renders all items when count is under limit', () => {
      const wrapper = createWrapper({ items: shortList, limit: 10 })
      expect(wrapper.findAll('div').length).toBeGreaterThanOrEqual(
        shortList.length
      )
    })

    it('renders only limited items when count exceeds limit', () => {
      const wrapper = createWrapper({ items: longList, limit: 5 })
      // Should show 5 items initially plus wrapper and button
      const text = wrapper.text()
      expect(text).toContain('Item 1')
      expect(text).toContain('Item 5')
      expect(text).not.toContain('Item 6')
    })

    it('shows "Show more..." button when items exceed limit', () => {
      const wrapper = createWrapper({ items: longList, limit: 5 })
      expect(wrapper.text()).toContain('Show more...')
    })

    it('does not show "Show more..." button when items under limit', () => {
      const wrapper = createWrapper({ items: shortList, limit: 10 })
      expect(wrapper.text()).not.toContain('Show more...')
    })
  })

  describe('props', () => {
    it('defaults limit to 10', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('limit')).toBe(10)
    })

    it('defaults keyfield to "id"', () => {
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

  describe('expand functionality', () => {
    it('expands to show all items when button is clicked', async () => {
      const wrapper = createWrapper({ items: longList, limit: 5 })

      // Initially shows limited items
      expect(wrapper.text()).not.toContain('Item 15')

      // Click the button
      const button = wrapper.find('button')
      await button.trigger('click')

      // Should now show all items
      expect(wrapper.text()).toContain('Item 15')
    })

    it('hides "Show more..." button after expanding', async () => {
      const wrapper = createWrapper({ items: longList, limit: 5 })

      // Click the button
      const button = wrapper.find('button')
      await button.trigger('click')

      // Button should be hidden
      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('slots', () => {
    it('uses default slot content when no item slot provided', () => {
      const wrapper = createWrapper({ items: shortList })
      expect(wrapper.text()).toContain('Item 1')
    })

    it('uses custom item slot when provided', () => {
      const wrapper = mount(ShowMore, {
        props: { items: shortList },
        slots: {
          item: '<template #item="{ item }"><span class="custom">{{ item.name }}</span></template>',
        },
        global: {
          stubs: {
            'b-button': {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
            },
          },
        },
      })
      expect(wrapper.findAll('.custom').length).toBe(shortList.length)
    })
  })

  describe('edge cases', () => {
    it('handles empty items array', () => {
      const wrapper = createWrapper({ items: [] })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('handles items exactly at limit', () => {
      const exactList = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }))
      const wrapper = createWrapper({ items: exactList, limit: 10 })
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('handles items one over limit', () => {
      const overByOne = Array.from({ length: 11 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }))
      const wrapper = createWrapper({ items: overByOne, limit: 10 })
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('uses custom keyfield for keying', () => {
      const customKeyItems = [
        { customId: 'a', name: 'Item A' },
        { customId: 'b', name: 'Item B' },
      ]
      const wrapper = createWrapper({
        items: customKeyItems,
        keyfield: 'customId',
      })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
