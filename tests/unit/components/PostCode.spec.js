import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PostCode from '~/components/PostCode.vue'

const mockTypeahead = vi.fn()
const mockFetchByLatLng = vi.fn()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: null,
  }),
}))

vi.mock('~/stores/location', () => ({
  useLocationStore: () => ({
    typeahead: mockTypeahead,
    fetchByLatLng: mockFetchByLatLng,
  }),
}))

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => ({
    postcode: null,
  }),
}))

vi.mock('~/composables/useId', () => ({
  uid: vi.fn(() => 'postcode-123'),
}))

vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRuntimeConfig: () => ({
      public: {
        APIv2: 'https://api.example.com',
      },
    }),
  }
})

describe('PostCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTypeahead.mockResolvedValue([])
    mockFetchByLatLng.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(PostCode, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          AutoComplete: {
            template:
              '<div class="autocomplete"><input ref="input" class="autocomplete-input" :id="id" :placeholder="placeholder" @input="$emit(\'input\', $event.target.value)" /></div>',
            props: [
              'id',
              'initValue',
              'restrict',
              'url',
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
              'notFoundMessage',
            ],
            emits: ['invalid', 'input'],
            methods: {
              setValue(val) {
                this.$refs.input.value = val
              },
            },
          },
          SpinButton: {
            template:
              '<button class="spin-button" :title="buttonTitle" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: [
              'variant',
              'flex',
              'buttonTitle',
              'doneIcon',
              'iconName',
              'size',
            ],
            emits: ['handle'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-popover': {
            template: '<div class="b-popover" v-if="show"><slot /></div>',
            props: [
              'content',
              'target',
              'placement',
              'variant',
              'show',
              'skidding',
            ],
          },
        },
        directives: {
          'b-tooltip': {},
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders autocomplete input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.autocomplete').exists()).toBe(true)
    })

    it('shows label when provided', () => {
      const wrapper = createWrapper({ label: 'Your postcode' })
      expect(wrapper.find('label').exists()).toBe(true)
      expect(wrapper.find('label').text()).toBe('Your postcode')
    })

    it('hides label when not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('label').exists()).toBe(false)
    })

    it('shows find location button by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.spin-button').exists()).toBe(true)
    })

    it('hides find location button when find is false', () => {
      const wrapper = createWrapper({ find: false })
      expect(wrapper.find('.spin-button').exists()).toBe(false)
    })

    it('shows validation tick when valid', async () => {
      const wrapper = createWrapper()
      wrapper.vm.isValid = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.validation-tick').exists()).toBe(true)
    })
  })

  describe('placeholder', () => {
    it('shows postcode placeholder when pconly is true', () => {
      const wrapper = createWrapper({ pconly: true })
      const input = wrapper.find('.autocomplete-input')
      expect(input.attributes('placeholder')).toBe('Type postcode')
    })

    it('shows location placeholder when pconly is false', () => {
      const wrapper = createWrapper({ pconly: false })
      const input = wrapper.find('.autocomplete-input')
      expect(input.attributes('placeholder')).toBe('Type location')
    })
  })

  describe('props', () => {
    it('has value prop defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('value')).toBeNull()
    })

    it('has label prop defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('label')).toBeNull()
    })

    it('has focus prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('focus')).toBe(false)
    })

    it('has find prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('find')).toBe(true)
    })

    it('has size prop defaulting to lg', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('lg')
    })

    it('has pconly prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('pconly')).toBe(true)
    })

    it('has noStore prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('noStore')).toBe(true)
    })

    it('has variant prop defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('variant')).toBeNull()
    })

    it('accepts custom value', () => {
      const wrapper = createWrapper({ value: 'SW1A 1AA' })
      expect(wrapper.props('value')).toBe('SW1A 1AA')
    })

    it('accepts custom size', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.props('size')).toBe('sm')
    })
  })

  describe('find location button', () => {
    it('has correct title', () => {
      const wrapper = createWrapper()
      const spinBtn = wrapper.find('.spin-button')
      expect(spinBtn.attributes('title')).toContain("Find my device's location")
    })
  })

  describe('process function', () => {
    it('limits results to 5 unique names', () => {
      const wrapper = createWrapper()
      const mockResults = [
        { name: 'SW1A 1AA' },
        { name: 'SW1A 1AB' },
        { name: 'SW1A 1AA' }, // duplicate
        { name: 'SW1A 1AC' },
        { name: 'SW1A 1AD' },
        { name: 'SW1A 1AE' },
        { name: 'SW1A 1AF' }, // should be excluded (limit 5)
      ]

      const processed = wrapper.vm.process(mockResults)
      expect(processed.length).toBe(5)
    })

    it('removes duplicates', () => {
      const wrapper = createWrapper()
      const mockResults = [
        { name: 'SW1A 1AA' },
        { name: 'SW1A 1AA' },
        { name: 'SW1A 1AB' },
      ]

      const processed = wrapper.vm.process(mockResults)
      expect(processed.length).toBe(2)
    })

    it('handles null results', () => {
      const wrapper = createWrapper()
      const processed = wrapper.vm.process(null)
      expect(processed).toEqual([])
    })
  })

  describe('invalid function', () => {
    it('emits cleared event', async () => {
      const wrapper = createWrapper()
      wrapper.vm.invalid()
      await flushPromises()

      expect(wrapper.emitted('cleared')).toBeTruthy()
    })

    it('resets wip to null', () => {
      const wrapper = createWrapper({ value: 'SW1A' })
      wrapper.vm.invalid()
      expect(wrapper.vm.wip).toBeNull()
    })

    it('sets isValid to false', () => {
      const wrapper = createWrapper()
      wrapper.vm.isValid = true
      wrapper.vm.invalid()
      expect(wrapper.vm.isValid).toBe(false)
    })
  })

  describe('select function', () => {
    it('emits selected event with postcode data', async () => {
      const wrapper = createWrapper()
      const pc = { name: 'SW1A 1AA', id: 123 }

      await wrapper.vm.select(pc)
      await flushPromises()

      expect(wrapper.emitted('selected')).toBeTruthy()
      expect(wrapper.emitted('selected')[0]).toEqual([pc])
    })

    it('sets isValid to true on successful selection', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.select({ name: 'SW1A 1AA', id: 123 })

      expect(wrapper.vm.isValid).toBe(true)
    })

    it('emits cleared when null is selected', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.select(null)
      await flushPromises()

      expect(wrapper.emitted('cleared')).toBeTruthy()
    })

    it('sets isValid to false when null is selected', async () => {
      const wrapper = createWrapper()
      wrapper.vm.isValid = true
      await wrapper.vm.select(null)

      expect(wrapper.vm.isValid).toBe(false)
    })

    it('looks up location when pc has name but no id', async () => {
      mockTypeahead.mockResolvedValue([{ name: 'SW1A 1AA', id: 456 }])

      const wrapper = createWrapper()
      await wrapper.vm.select({ name: 'SW1A 1AA' })
      await flushPromises()

      expect(mockTypeahead).toHaveBeenCalledWith('SW1A 1AA')
    })
  })

  describe('source computed', () => {
    it('returns API typeahead URL', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.source).toBe(
        'https://api.example.com/location/typeahead'
      )
    })
  })

  describe('unique id', () => {
    it('generates unique id for input', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.id).toBe('postcode-123')
    })
  })
})
