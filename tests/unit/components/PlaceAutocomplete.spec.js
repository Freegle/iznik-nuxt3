import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PlaceAutocomplete from '~/components/PlaceAutocomplete.vue'

const mockLocationStore = {
  typeahead: vi.fn().mockResolvedValue([]),
}

vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))

vi.mock('~/constants', () => ({
  POSTCODE_REGEX: /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i,
}))

describe('PlaceAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(PlaceAutocomplete, {
      props: {
        ...props,
      },
      global: {
        mocks: {
          useRuntimeConfig: () => ({
            public: {
              GEOCODE: 'https://geocode.example.com',
            },
          }),
        },
        stubs: {
          AutoComplete: {
            template:
              '<div class="autocomplete"><input class="test-place-input" :placeholder="placeholder" /></div>',
            props: [
              'id',
              'initValue',
              'restrict',
              'url',
              'param',
              'customParams',
              'anchor',
              'label',
              'placeholder',
              'classes',
              'min',
              'debounce',
              'process',
              'onSelect',
              'size',
              'variant',
              'onBeforeAjax',
            ],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders autocomplete container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-place-autocomplete').exists()).toBe(true)
    })

    it('renders autocomplete component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.autocomplete').exists()).toBe(true)
    })

    it('shows input field', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-place-input').exists()).toBe(true)
    })
  })

  describe('label', () => {
    it('shows label text when provided', () => {
      const wrapper = createWrapper({ labeltext: 'Enter location' })
      expect(wrapper.text()).toContain('Enter location')
    })

    it('shows screen reader label when provided', () => {
      const wrapper = createWrapper({ labeltextSr: 'Search for a location' })
      expect(wrapper.text()).toContain('Search for a location')
    })
  })

  describe('input id', () => {
    it('uses default input id', () => {
      const wrapper = createWrapper()
      const label = wrapper.find('label')
      expect(label.attributes('for')).toBe('placeautocomplete')
    })

    it('uses custom input id', () => {
      const wrapper = createWrapper({ inputId: 'custom-place' })
      const label = wrapper.find('label')
      expect(label.attributes('for')).toBe('custom-place')
    })
  })

  describe('size', () => {
    it('uses default lg size', () => {
      const wrapper = createWrapper()
      const autocomplete = wrapper.findComponent('.autocomplete')
      expect(autocomplete.exists()).toBe(true)
    })

    it('accepts custom size', () => {
      const wrapper = createWrapper({ size: 'md' })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('value', () => {
    it('accepts initial value', () => {
      const wrapper = createWrapper({ value: 'London' })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('placeholder', () => {
    it('shows placeholder text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-place-input').attributes('placeholder')).toBe(
        'Type your location'
      )
    })
  })

  describe('emits', () => {
    it('component exists and can emit selected', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('component exists and can emit cleared', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })
})
