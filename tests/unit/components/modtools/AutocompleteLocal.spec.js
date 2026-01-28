import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AutocompleteLocal from '~/modtools/components/AutocompleteLocal.vue'

describe('AutocompleteLocal', () => {
  let addEventListenerSpy
  let removeEventListenerSpy

  function mountAutocomplete(props = {}) {
    return mount(AutocompleteLocal, {
      props: {
        items: [],
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  describe('rendering', () => {
    it('renders an input element', () => {
      const wrapper = mountAutocomplete()
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('applies form-control class to input', () => {
      const wrapper = mountAutocomplete()
      expect(wrapper.find('input.form-control').exists()).toBe(true)
    })

    it('renders autocomplete-results list', () => {
      const wrapper = mountAutocomplete()
      expect(wrapper.find('.autocomplete-results').exists()).toBe(true)
    })

    it('has isOpen false initially', () => {
      const wrapper = mountAutocomplete()
      // v-show binds to isOpen state
      expect(wrapper.vm.isOpen).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts items array', () => {
      const items = ['apple', 'banana', 'cherry']
      const wrapper = mountAutocomplete({ items })
      expect(wrapper.props('items')).toEqual(items)
    })
  })

  describe('filtering', () => {
    it('filters items based on input (case insensitive)', async () => {
      const items = ['Apple', 'Banana', 'Apricot', 'Cherry']
      const wrapper = mountAutocomplete({ items })

      const input = wrapper.find('input')
      await input.setValue('ap')
      await input.trigger('input')

      // Results should be visible and filtered
      expect(wrapper.vm.isOpen).toBe(true)
      expect(wrapper.vm.results).toContain('Apple')
      expect(wrapper.vm.results).toContain('Apricot')
      expect(wrapper.vm.results).not.toContain('Banana')
      expect(wrapper.vm.results).not.toContain('Cherry')
    })

    it('shows all matching items in dropdown', async () => {
      const items = ['test1', 'test2', 'other']
      const wrapper = mountAutocomplete({ items })

      await wrapper.find('input').setValue('test')
      await wrapper.find('input').trigger('input')

      const resultItems = wrapper.findAll('.autocomplete-result')
      expect(resultItems.length).toBe(2)
    })
  })

  describe('selection', () => {
    it('sets input value when result is clicked', async () => {
      const items = ['Apple', 'Banana']
      const wrapper = mountAutocomplete({ items })

      // Type to show results
      await wrapper.find('input').setValue('a')
      await wrapper.find('input').trigger('input')

      // Click first result
      const firstResult = wrapper.find('.autocomplete-result')
      await firstResult.trigger('click')

      expect(wrapper.vm.search).toBe('Apple')
      expect(wrapper.vm.isOpen).toBe(false)
    })

    it('emits update:modelValue when result is selected', async () => {
      const items = ['Apple', 'Banana']
      const wrapper = mountAutocomplete({ items })

      await wrapper.find('input').setValue('a')
      await wrapper.find('input').trigger('input')

      const firstResult = wrapper.find('.autocomplete-result')
      await firstResult.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('keyboard navigation', () => {
    it('moves selection down with arrow down', async () => {
      const items = ['Apple', 'Banana', 'Cherry']
      const wrapper = mountAutocomplete({ items })

      await wrapper.find('input').setValue('a')
      await wrapper.find('input').trigger('input')

      expect(wrapper.vm.arrowCounter).toBe(0)

      await wrapper.find('input').trigger('keydown.down')
      expect(wrapper.vm.arrowCounter).toBe(1)
    })

    it('moves selection up with arrow up', async () => {
      const items = ['Apple', 'Banana', 'Cherry']
      const wrapper = mountAutocomplete({ items })

      await wrapper.find('input').setValue('a')
      await wrapper.find('input').trigger('input')

      // Move down first
      await wrapper.find('input').trigger('keydown.down')
      await wrapper.find('input').trigger('keydown.down')
      expect(wrapper.vm.arrowCounter).toBe(2)

      // Then move up
      await wrapper.find('input').trigger('keydown.up')
      expect(wrapper.vm.arrowCounter).toBe(1)
    })

    it('selects highlighted item on enter', async () => {
      const items = ['Apple', 'Banana']
      const wrapper = mountAutocomplete({ items })

      await wrapper.find('input').setValue('a')
      await wrapper.find('input').trigger('input')

      // Move to first result and press enter
      await wrapper.find('input').trigger('keydown.down')
      await wrapper.find('input').trigger('keydown.enter')

      expect(wrapper.vm.isOpen).toBe(false)
    })
  })

  describe('click outside', () => {
    it('adds click listener on mount', () => {
      mountAutocomplete()
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )
    })

    it('removes click listener on unmount', () => {
      const wrapper = mountAutocomplete()
      wrapper.unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })

  describe('async mode', () => {
    it('shows loading when isAsync and typing', async () => {
      const wrapper = mountAutocomplete({ isAsync: true, items: [] })

      await wrapper.find('input').setValue('test')
      await wrapper.find('input').trigger('input')

      expect(wrapper.vm.isLoading).toBe(true)
    })

    it('updates results when items prop changes in async mode', async () => {
      const wrapper = mountAutocomplete({ isAsync: true, items: [] })

      // Trigger loading
      await wrapper.find('input').setValue('test')
      await wrapper.find('input').trigger('input')
      expect(wrapper.vm.isLoading).toBe(true)

      // Simulate async response by updating items
      await wrapper.setProps({ items: ['result1', 'result2'] })

      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.results).toEqual(['result1', 'result2'])
    })
  })
})
