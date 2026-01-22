import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModDiff from '~/modtools/components/ModDiff.vue'

describe('ModDiff', () => {
  function mountModDiff(props = {}) {
    return mount(ModDiff, {
      props: {
        old: '',
        new: '',
        ...props,
      },
      global: {
        stubs: {
          DiffPart: {
            template:
              '<span class="diff-part" :data-added="part.added" :data-removed="part.removed">{{ part.value }}</span>',
            props: ['part'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a div container', () => {
      const wrapper = mountModDiff({ old: 'a', new: 'b' })
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders DiffPart components for each diff segment', () => {
      const wrapper = mountModDiff({ old: 'hello', new: 'hallo' })
      const parts = wrapper.findAll('.diff-part')
      expect(parts.length).toBeGreaterThan(0)
    })
  })

  describe('diff computation', () => {
    it('returns null diff when old is empty', () => {
      const wrapper = mountModDiff({ old: '', new: 'test' })
      expect(wrapper.findAll('.diff-part').length).toBe(0)
    })

    it('returns null diff when new is empty', () => {
      const wrapper = mountModDiff({ old: 'test', new: '' })
      expect(wrapper.findAll('.diff-part').length).toBe(0)
    })

    it('shows unchanged text for identical strings', () => {
      const wrapper = mountModDiff({ old: 'same', new: 'same' })
      const parts = wrapper.findAll('.diff-part')
      expect(parts.length).toBe(1)
      expect(parts[0].text()).toBe('same')
    })

    it('shows added characters', () => {
      const wrapper = mountModDiff({ old: 'hllo', new: 'hello' })
      const parts = wrapper.findAll('.diff-part')
      const addedPart = parts.find((p) => p.attributes('data-added') === 'true')
      expect(addedPart).toBeTruthy()
    })

    it('shows removed characters', () => {
      const wrapper = mountModDiff({ old: 'hello', new: 'hllo' })
      const parts = wrapper.findAll('.diff-part')
      const removedPart = parts.find(
        (p) => p.attributes('data-removed') === 'true'
      )
      expect(removedPart).toBeTruthy()
    })
  })

  describe('props', () => {
    it('accepts old and new string props', () => {
      const wrapper = mountModDiff({ old: 'original', new: 'modified' })
      expect(wrapper.props('old')).toBe('original')
      expect(wrapper.props('new')).toBe('modified')
    })

    it('handles missing props gracefully', () => {
      const wrapper = mount(ModDiff)
      expect(wrapper.findAll('.diff-part').length).toBe(0)
    })
  })
})
