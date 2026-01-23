import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MicroVolunteeringSimilarTerm from '~/components/MicroVolunteeringSimilarTerm.vue'

describe('MicroVolunteeringSimilarTerm', () => {
  function createWrapper(props = {}) {
    return mount(MicroVolunteeringSimilarTerm, {
      props: {
        term: { id: 1, term: 'Test Term' },
        similarTerms: [],
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="[$attrs.class, variant, size]" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
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

    it('renders button with term text', () => {
      const wrapper = createWrapper({ term: { id: 1, term: 'Bicycle' } })
      expect(wrapper.find('button').text()).toBe('Bicycle')
    })
  })

  describe('when term is NOT in similarTerms (unselected)', () => {
    it('shows unselected button', () => {
      const wrapper = createWrapper({
        term: { id: 1, term: 'Chair' },
        similarTerms: [],
      })
      expect(wrapper.find('button').classes()).toContain('unselected')
    })

    it('does not show selected class', () => {
      const wrapper = createWrapper({
        term: { id: 1, term: 'Chair' },
        similarTerms: [],
      })
      expect(wrapper.find('button').classes()).not.toContain('selected')
    })

    it('emits similar when clicked', async () => {
      const wrapper = createWrapper({
        term: { id: 1, term: 'Chair' },
        similarTerms: [],
      })
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('similar')).toBeTruthy()
      expect(wrapper.emitted('not')).toBeFalsy()
    })
  })

  describe('when term IS in similarTerms (selected)', () => {
    it('shows selected button', () => {
      const wrapper = createWrapper({
        term: { id: 1, term: 'Chair' },
        similarTerms: [{ id: 1, term: 'Chair' }],
      })
      expect(wrapper.find('button').classes()).toContain('selected')
    })

    it('does not show unselected class', () => {
      const wrapper = createWrapper({
        term: { id: 1, term: 'Chair' },
        similarTerms: [{ id: 1, term: 'Chair' }],
      })
      expect(wrapper.find('button').classes()).not.toContain('unselected')
    })

    it('emits not when clicked', async () => {
      const wrapper = createWrapper({
        term: { id: 1, term: 'Chair' },
        similarTerms: [{ id: 1, term: 'Chair' }],
      })
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('not')).toBeTruthy()
      expect(wrapper.emitted('similar')).toBeFalsy()
    })
  })

  describe('similar computed', () => {
    it('returns term when found in similarTerms by id', () => {
      const wrapper = createWrapper({
        term: { id: 42, term: 'Table' },
        similarTerms: [
          { id: 1, term: 'Chair' },
          { id: 42, term: 'Table' },
        ],
      })
      expect(wrapper.vm.similar).toEqual({ id: 42, term: 'Table' })
    })

    it('returns undefined when not found in similarTerms', () => {
      const wrapper = createWrapper({
        term: { id: 42, term: 'Table' },
        similarTerms: [{ id: 1, term: 'Chair' }],
      })
      expect(wrapper.vm.similar).toBeUndefined()
    })
  })

  describe('props', () => {
    it('requires term prop', () => {
      const wrapper = createWrapper({ term: { id: 99, term: 'Lamp' } })
      expect(wrapper.props('term')).toEqual({ id: 99, term: 'Lamp' })
    })

    it('requires similarTerms prop', () => {
      const similarTerms = [{ id: 1, term: 'Test' }]
      const wrapper = createWrapper({ similarTerms })
      expect(wrapper.props('similarTerms')).toEqual(similarTerms)
    })
  })

  describe('button styling', () => {
    it('all buttons have font-weight-bold class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').classes()).toContain('font-weight-bold')
    })

    it('all buttons have white variant', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').classes()).toContain('white')
    })

    it('all buttons have lg size', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').classes()).toContain('lg')
    })
  })
})
