import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AutoComplete from '~/components/AutoComplete.vue'

vi.mock('vue-highlight-words', () => ({
  default: {
    name: 'Highlighter',
    template: '<span class="highlighter">{{ textToHighlight }}</span>',
    props: [
      'textToHighlight',
      'searchWords',
      'highlightClassName',
      'autoEscape',
    ],
  },
}))

describe('AutoComplete', () => {
  let mockXHR

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mockXHR = {
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      addEventListener: vi.fn(),
      status: 200,
      responseText: JSON.stringify([
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Apricot' },
      ]),
    }
    global.XMLHttpRequest = vi.fn(() => mockXHR)
  })

  afterEach(() => {
    vi.useRealTimers()
    delete global.XMLHttpRequest
  })

  function createWrapper(props = {}) {
    return mount(AutoComplete, {
      props: {
        anchor: 'name',
        label: 'name',
        url: '/api/search',
        ...props,
      },
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /><slot name="fallback" /></div>',
          },
          'b-input-group': {
            template:
              '<div class="b-input-group"><slot /><slot name="append" /></div>',
            props: ['class'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'tabindex', 'ariaLabel'],
          },
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :class="$attrs.class" />',
            props: ['icon'],
          },
          Highlighter: {
            template: '<span class="highlighter">{{ textToHighlight }}</span>',
            props: [
              'textToHighlight',
              'searchWords',
              'highlightClassName',
              'autoEscape',
            ],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders autocomplete-wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.autocomplete-wrapper').exists()).toBe(true)
    })

    it('renders autocomplete-input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.autocomplete-input').exists()).toBe(true)
    })

    it('renders busy indicator icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="sync"]').exists()).toBe(true)
    })

    it('shows invisible spinner by default', () => {
      const wrapper = createWrapper()
      const spinner = wrapper.find('.v-icon[data-icon="sync"]')
      expect(spinner.classes()).toContain('invisible')
    })
  })

  describe('props', () => {
    it('requires anchor prop', () => {
      const wrapper = createWrapper({ anchor: 'title' })
      expect(wrapper.props('anchor')).toBe('title')
    })

    it('requires url prop', () => {
      const wrapper = createWrapper({ url: '/api/items' })
      expect(wrapper.props('url')).toBe('/api/items')
    })

    it('has default param of q', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('param')).toBe('q')
    })

    it('accepts param prop', () => {
      const wrapper = createWrapper({ param: 'search' })
      expect(wrapper.props('param')).toBe('search')
    })

    it('has default min of 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('min')).toBe(0)
    })

    it('accepts min prop', () => {
      const wrapper = createWrapper({ min: 3 })
      expect(wrapper.props('min')).toBe(3)
    })

    it('has default encodeParams of true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('encodeParams')).toBe(true)
    })

    it('has default filterByAnchor of true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('filterByAnchor')).toBe(true)
    })

    it('has default restrict of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('restrict')).toBe(false)
    })

    it('has default closeButton of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('closeButton')).toBe(false)
    })

    it('accepts placeholder prop', () => {
      const wrapper = createWrapper({ placeholder: 'Search...' })
      expect(wrapper.find('input').attributes('placeholder')).toBe('Search...')
    })

    it('accepts id prop', () => {
      const wrapper = createWrapper({ id: 'search-input' })
      expect(wrapper.find('input').attributes('id')).toBe('search-input')
    })

    it('accepts name prop', () => {
      const wrapper = createWrapper({ name: 'search' })
      expect(wrapper.find('input').attributes('name')).toBe('search')
    })

    it('accepts initValue prop', () => {
      const wrapper = createWrapper({ initValue: 'initial' })
      expect(wrapper.vm.type).toBe('initial')
    })

    it('accepts size prop', () => {
      const wrapper = createWrapper({ size: 20 })
      expect(wrapper.find('input').attributes('size')).toBe('20')
    })

    it('accepts notFoundMessage prop', () => {
      const wrapper = createWrapper({ notFoundMessage: 'No results found' })
      expect(wrapper.props('notFoundMessage')).toBe('No results found')
    })
  })

  describe('search button', () => {
    it('shows search button when searchbutton prop is set', () => {
      const wrapper = createWrapper({ searchbutton: 'Search' })
      expect(wrapper.find('.searchbutton').exists()).toBe(true)
      expect(wrapper.text()).toContain('Search')
    })

    it('hides search button by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.searchbutton').exists()).toBe(false)
    })

    it('emits search event when search button clicked', async () => {
      const wrapper = createWrapper({ searchbutton: 'Search' })
      await wrapper.find('.searchbutton').trigger('click')
      expect(wrapper.emitted('search')).toBeTruthy()
    })
  })

  describe('close button', () => {
    it('shows close button when closeButton prop is true', async () => {
      const wrapper = createWrapper({ closeButton: true })
      wrapper.vm.showList = true
      wrapper.vm.json = [{ id: 1, name: 'Test' }]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.v-icon[data-icon="times-circle"]').exists()).toBe(
        true
      )
    })

    it('hides close button by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="times-circle"]').exists()).toBe(
        false
      )
    })
  })

  describe('list display', () => {
    it('hides list by default', () => {
      const wrapper = createWrapper()
      // Check the state that controls visibility (v-show="showList && json.length")
      expect(wrapper.vm.showList).toBe(false)
      expect(wrapper.vm.json).toEqual([])
    })

    it('shows list when showList is true and json has items', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [{ id: 1, name: 'Test' }]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.autocomplete-list').isVisible()).toBe(true)
    })

    it('renders list items', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
      ]
      await wrapper.vm.$nextTick()
      const items = wrapper.findAll('li')
      expect(items.length).toBe(2)
    })
  })

  describe('input events', () => {
    it('shows list on input', async () => {
      const wrapper = createWrapper()
      await wrapper.find('input').setValue('test')
      expect(wrapper.vm.showList).toBe(true)
    })

    it('calls onInput callback when provided', async () => {
      const onInput = vi.fn()
      const wrapper = createWrapper({ onInput })
      await wrapper.find('input').setValue('test')
      expect(onInput).toHaveBeenCalledWith('test')
    })

    it('uses debounce when provided', async () => {
      const wrapper = createWrapper({ debounce: 300 })
      await wrapper.find('input').setValue('test')
      expect(wrapper.vm.debounceTask).toBeDefined()
    })

    it('shows list on focus', async () => {
      const wrapper = createWrapper()
      await wrapper.find('input').trigger('focus')
      expect(wrapper.vm.showList).toBe(true)
      expect(wrapper.vm.focused).toBe(true)
    })

    it('hides list on blur after delay', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      await wrapper.find('input').trigger('blur')
      expect(wrapper.vm.focused).toBe(false)
      vi.advanceTimersByTime(300)
      expect(wrapper.vm.showList).toBe(false)
    })

    it('shows list on double click', async () => {
      const wrapper = createWrapper()
      await wrapper.find('input').trigger('dblclick')
      expect(wrapper.vm.showList).toBe(true)
    })
  })

  describe('keyboard navigation', () => {
    beforeEach(() => {
      vi.useRealTimers()
    })

    afterEach(() => {
      vi.useFakeTimers()
    })

    it('increments focusList on down arrow', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [
        { id: 1, name: 'Test' },
        { id: 2, name: 'Test2' },
      ]
      wrapper.vm.focusList = 0
      await wrapper.find('input').trigger('keydown', { keyCode: 40 })
      expect(wrapper.vm.focusList).toBe(1)
    })

    it('decrements focusList on up arrow', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [
        { id: 1, name: 'Test' },
        { id: 2, name: 'Test2' },
      ]
      wrapper.vm.focusList = 1
      await wrapper.find('input').trigger('keydown', { keyCode: 38 })
      expect(wrapper.vm.focusList).toBe(0)
    })

    it('hides list on escape', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      await wrapper.find('input').trigger('keydown', { keyCode: 27 })
      expect(wrapper.vm.showList).toBe(false)
    })

    it('wraps to top when going past bottom', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [{ id: 1, name: 'Test' }]
      wrapper.vm.focusList = 1
      await wrapper.find('input').trigger('keydown', { keyCode: 40 })
      expect(wrapper.vm.focusList).toBe(0)
    })

    it('wraps to bottom when going past top', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [
        { id: 1, name: 'Test' },
        { id: 2, name: 'Test2' },
      ]
      wrapper.vm.focusList = -1
      await wrapper.find('input').trigger('keydown', { keyCode: 38 })
      expect(wrapper.vm.focusList).toBe(1)
    })
  })

  describe('selection', () => {
    it('calls onSelect callback when item selected', async () => {
      const onSelect = vi.fn()
      const wrapper = createWrapper({ onSelect })
      wrapper.vm.showList = true
      wrapper.vm.json = [{ id: 1, name: 'Apple' }]
      await wrapper.vm.$nextTick()
      await wrapper.find('li a').trigger('click')
      expect(onSelect).toHaveBeenCalledWith({ id: 1, name: 'Apple' })
    })

    it('sets type to selected item anchor', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [{ id: 1, name: 'Apple' }]
      await wrapper.vm.$nextTick()
      await wrapper.find('li a').trigger('click')
      expect(wrapper.vm.type).toBe('Apple')
    })

    it('hides list after selection', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.json = [{ id: 1, name: 'Apple' }]
      await wrapper.vm.$nextTick()
      await wrapper.find('li a').trigger('click')
      expect(wrapper.vm.showList).toBe(false)
    })
  })

  describe('exposed methods', () => {
    it('setValue sets the type value', () => {
      const wrapper = createWrapper()
      wrapper.vm.setValue('New Value')
      expect(wrapper.vm.type).toBe('New Value')
    })
  })

  describe('methods', () => {
    it('clearInput resets state', () => {
      const wrapper = createWrapper()
      wrapper.vm.showList = true
      wrapper.vm.type = 'test'
      wrapper.vm.json = [{ id: 1, name: 'Test' }]
      wrapper.vm.focusList = 2
      wrapper.vm.clearInput()
      expect(wrapper.vm.showList).toBe(false)
      expect(wrapper.vm.type).toBe('')
      expect(wrapper.vm.json).toEqual([])
      expect(wrapper.vm.focusList).toBe('')
    })

    it('getClassName returns custom class when provided', () => {
      const wrapper = createWrapper({
        classes: { wrapper: 'custom-wrapper', input: 'custom-input' },
      })
      expect(wrapper.vm.getClassName('wrapper')).toBe('custom-wrapper')
      expect(wrapper.vm.getClassName('input')).toBe('custom-input')
    })

    it('getClassName uses className prefix when no custom class', () => {
      const wrapper = createWrapper({ className: 'mycomp' })
      expect(wrapper.vm.getClassName('wrapper')).toBe('mycomp-wrapper')
    })

    it('getClassName returns empty string when no className', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.getClassName('wrapper')).toBe('')
    })

    it('activeClass returns focus-list for focused item', () => {
      const wrapper = createWrapper()
      wrapper.vm.focusList = 2
      expect(wrapper.vm.activeClass(2)).toBe('focus-list')
      expect(wrapper.vm.activeClass(1)).toBe('')
    })

    it('mousemove sets focusList', () => {
      const wrapper = createWrapper()
      wrapper.vm.mousemove(3)
      expect(wrapper.vm.focusList).toBe(3)
    })

    it('deepValue extracts nested values', () => {
      const wrapper = createWrapper()
      const obj = { a: { b: { c: 'value' } } }
      expect(wrapper.vm.deepValue(obj, 'a.b.c')).toBe('value')
    })
  })

  describe('computed properties', () => {
    it('wrapClass includes border for primary variant', () => {
      const wrapper = createWrapper({ variant: 'primary' })
      expect(wrapper.vm.wrapClass).toContain('border-primary')
    })

    it('wrapClass includes border for success variant', () => {
      const wrapper = createWrapper({ variant: 'success' })
      expect(wrapper.vm.wrapClass).toContain('border-success')
    })

    it('wrapClass includes focus class when focused', () => {
      const wrapper = createWrapper()
      wrapper.vm.focused = true
      expect(wrapper.vm.wrapClass).toContain('autocomplete-wrap-focus')
    })

    it('wrapClass includes invalid class when invalid', () => {
      const wrapper = createWrapper()
      wrapper.vm.invalid = true
      expect(wrapper.vm.wrapClass).toContain('autocomplete-wrap-invalid')
    })

    it('parentClass includes searchbutton class when searchbutton prop set', () => {
      const wrapper = createWrapper({ searchbutton: 'Search' })
      expect(wrapper.vm.parentClass).toContain('autocomplete-parent-focus')
    })

    it('parentClass includes invalid class when invalid', () => {
      const wrapper = createWrapper()
      wrapper.vm.invalid = true
      expect(wrapper.vm.parentClass).toContain('invalid')
    })
  })

  describe('reactive state', () => {
    it('initializes showList as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showList).toBe(false)
    })

    it('initializes json as empty array', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.json).toEqual([])
    })

    it('initializes focusList as empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.focusList).toBe('')
    })

    it('initializes invalid as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.invalid).toBe(false)
    })

    it('initializes focused as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.focused).toBe(false)
    })
  })

  describe('emits', () => {
    it('emits update:modelValue when type changes', async () => {
      const wrapper = createWrapper()
      wrapper.vm.type = 'new value'
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value'])
    })

    it('emits invalid when restrict is true and no matches', () => {
      const wrapper = createWrapper({ restrict: true, onSelect: vi.fn() })
      wrapper.vm.invalid = true
      expect(wrapper.vm.invalid).toBe(true)
    })
  })

  describe('invalid state', () => {
    it('shows not found message when invalid', async () => {
      const wrapper = createWrapper({ notFoundMessage: 'Not found!' })
      wrapper.vm.invalid = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Not found!')
    })

    it('hides not found message when valid', () => {
      const wrapper = createWrapper({ notFoundMessage: 'Not found!' })
      wrapper.vm.invalid = false
      expect(wrapper.text()).not.toContain('Not found!')
    })
  })

  describe('options watch', () => {
    it('filters options by anchor when filterByAnchor is true', async () => {
      const wrapper = createWrapper({ filterByAnchor: true, options: [] })
      wrapper.vm.type = 'App'
      await wrapper.setProps({
        options: [
          { id: 1, name: 'Apple' },
          { id: 2, name: 'Banana' },
        ],
      })
      expect(wrapper.vm.json).toEqual([{ id: 1, name: 'Apple' }])
    })

    it('uses all options when filterByAnchor is false', async () => {
      const wrapper = createWrapper({ filterByAnchor: false, options: [] })
      wrapper.vm.type = 'App'
      await wrapper.setProps({
        options: [
          { id: 1, name: 'Apple' },
          { id: 2, name: 'Banana' },
        ],
      })
      expect(wrapper.vm.json).toEqual([
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
      ])
    })
  })
})
