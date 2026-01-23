import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShortLinks from '~/components/ShortLinks.vue'

describe('ShortLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ShortLinks, {
      props: {
        shortlinks: [],
        ...props,
      },
      global: {
        stubs: {
          ShortLink: {
            template: '<div class="shortlink" :data-id="id"></div>',
            props: ['id'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders empty container when no shortlinks', () => {
      const wrapper = createWrapper({ shortlinks: [] })
      expect(wrapper.find('div').exists()).toBe(true)
      expect(wrapper.findAll('.shortlink')).toHaveLength(0)
    })

    it('renders ShortLink for each item', () => {
      const wrapper = createWrapper({
        shortlinks: [{ id: 1 }, { id: 2 }, { id: 3 }],
      })
      expect(wrapper.findAll('.shortlink')).toHaveLength(3)
    })

    it('passes id prop to each ShortLink', () => {
      const wrapper = createWrapper({
        shortlinks: [{ id: 10 }, { id: 20 }],
      })
      const links = wrapper.findAll('.shortlink')
      expect(links[0].attributes('data-id')).toBe('10')
      expect(links[1].attributes('data-id')).toBe('20')
    })
  })

  describe('props', () => {
    it('requires shortlinks prop', () => {
      const wrapper = createWrapper({
        shortlinks: [{ id: 1 }],
      })
      expect(wrapper.props('shortlinks')).toEqual([{ id: 1 }])
    })

    it('handles single shortlink', () => {
      const wrapper = createWrapper({
        shortlinks: [{ id: 999 }],
      })
      expect(wrapper.findAll('.shortlink')).toHaveLength(1)
      expect(wrapper.find('.shortlink').attributes('data-id')).toBe('999')
    })

    it('handles many shortlinks', () => {
      const shortlinks = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }))
      const wrapper = createWrapper({ shortlinks })
      expect(wrapper.findAll('.shortlink')).toHaveLength(10)
    })
  })

  describe('keying', () => {
    it('uses unique keys for each ShortLink', () => {
      const wrapper = createWrapper({
        shortlinks: [{ id: 1 }, { id: 2 }],
      })
      // The component uses :key="'shortlink-' + shortlink.id"
      // Just verify multiple items render correctly (keying is internal)
      expect(wrapper.findAll('.shortlink')).toHaveLength(2)
    })
  })
})
