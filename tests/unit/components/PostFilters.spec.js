import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import PostFilters from '~/components/PostFilters.vue'

const mockMiscStore = {
  set: vi.fn(),
}

const mockMessageStore = {
  fetchCount: vi.fn(),
}

const mockIsochroneStore = {
  list: [],
}

const mockAuthStore = {
  saveAndGet: vi.fn().mockResolvedValue({}),
}

const mockMe = ref({
  id: 1,
  settings: {
    browseView: 'nearby',
    browseSort: 'Unseen',
  },
})

const mockMyGroups = ref([{ id: 1, nameshort: 'TestGroup' }])

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/isochrone', () => ({
  useIsochroneStore: () => mockIsochroneStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myGroups: mockMyGroups,
  }),
}))

vi.mock('#imports', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    ref: actual.ref,
    watch: actual.watch,
    computed: actual.computed,
  }
})

describe('PostFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = {
      id: 1,
      settings: {
        browseView: 'nearby',
        browseSort: 'Unseen',
      },
    }
    mockMyGroups.value = [{ id: 1, nameshort: 'TestGroup' }]
    mockIsochroneStore.list = []
  })

  function createWrapper(props = {}) {
    return mount(PostFilters, {
      props: {
        selectedGroup: 0,
        selectedType: 'All',
        selectedSort: 'Unseen',
        forceShowFilters: false,
        ...props,
      },
      global: {
        stubs: {
          'b-collapse': {
            template:
              '<div class="b-collapse" :class="{ show: modelValue }"><slot /></div>',
            props: ['modelValue'],
          },
          GroupSelect: {
            template: '<select class="group-select" />',
            props: [
              'modelValue',
              'label',
              'all',
              'allMy',
              'customName',
              'customVal',
            ],
            emits: ['update:modelValue'],
          },
          'b-form-select': {
            template:
              '<select class="b-form-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['id', 'modelValue', 'options'],
            emits: ['update:modelValue'],
          },
          'b-form-input': {
            template:
              '<input class="b-form-input" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup\')" />',
            props: [
              'modelValue',
              'type',
              'placeholder',
              'autocomplete',
              'size',
            ],
            emits: ['update:modelValue', 'keyup'],
          },
          'b-input-group': {
            template:
              '<div class="b-input-group"><slot /><slot name="append" /></div>',
          },
          'b-button': {
            template:
              '<button class="b-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'title'],
            emits: ['click'],
          },
          IsoChrone: {
            template: '<div class="isochrone" />',
            props: ['id', 'addButton', 'last'],
            emits: ['add', 'added', 'cancel'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
          'nuxt-link': {
            template: '<a class="nuxt-link"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders search input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input').exists()).toBe(true)
    })

    it('renders search button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-button').exists()).toBe(true)
    })

    it('renders filters toggle button when filters hidden', () => {
      const wrapper = createWrapper({ forceShowFilters: false })
      const buttons = wrapper.findAll('.b-button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders collapse when forceShowFilters is true', async () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      await flushPromises()
      expect(wrapper.find('.b-collapse').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('has selectedGroup prop with 0 default', () => {
      const props = PostFilters.props || {}
      expect(props.selectedGroup.default).toBe(0)
    })

    it('has selectedType prop with All default', () => {
      const props = PostFilters.props || {}
      expect(props.selectedType.default).toBe('All')
    })

    it('has selectedSort prop with Unseen default', () => {
      const props = PostFilters.props || {}
      expect(props.selectedSort.default).toBe('Unseen')
    })

    it('has forceShowFilters prop with false default', () => {
      const props = PostFilters.props || {}
      expect(props.forceShowFilters.default).toBe(false)
    })
  })

  describe('emits', () => {
    it('defines update:search emit', () => {
      const emits = PostFilters.emits || []
      expect(emits).toContain('update:search')
    })

    it('defines update:selectedGroup emit', () => {
      const emits = PostFilters.emits || []
      expect(emits).toContain('update:selectedGroup')
    })

    it('defines update:selectedType emit', () => {
      const emits = PostFilters.emits || []
      expect(emits).toContain('update:selectedType')
    })

    it('defines update:selectedSort emit', () => {
      const emits = PostFilters.emits || []
      expect(emits).toContain('update:selectedSort')
    })
  })

  describe('filters expanded state', () => {
    it('filters collapsed by default', () => {
      const wrapper = createWrapper()
      const collapse = wrapper.find('.b-collapse')
      expect(collapse.classes()).not.toContain('show')
    })

    it('filters expanded when forceShowFilters is true', async () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      await flushPromises()
      const collapse = wrapper.find('.b-collapse')
      expect(collapse.classes()).toContain('show')
    })

    it('toggles filters on button click', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.b-button')
      const toggleBtn = buttons.find((btn) => btn.text().includes('Map'))
      if (toggleBtn) {
        await toggleBtn.trigger('click')
        await flushPromises()
        expect(wrapper.find('.b-collapse').classes()).toContain('show')
      }
    })
  })

  describe('misc store integration', () => {
    it('sets hidepostmap on showFilters change', async () => {
      createWrapper({ forceShowFilters: true })
      await flushPromises()
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'hidepostmap',
        value: false,
      })
    })
  })

  describe('type options', () => {
    it('has All type option', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('OFFERs & WANTEDs')
    })

    it('has Offer type option', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('Just OFFERs')
    })

    it('has Wanted type option', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('Just WANTEDs')
    })
  })

  describe('sort options', () => {
    it('has Unseen sort option', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('Unseen posts first')
    })

    it('has Newest sort option', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('Newest posts first')
    })
  })

  describe('group select', () => {
    it('shows GroupSelect when user logged in', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.find('.group-select').exists()).toBe(true)
    })

    it('hides GroupSelect when no user', () => {
      mockMe.value = null
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.find('.group-select').exists()).toBe(false)
    })
  })

  describe('isochrones', () => {
    it('shows isochrones section when browseView is nearby', () => {
      mockIsochroneStore.list = [{ id: 1 }]
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.find('.isochrone').exists()).toBe(true)
    })

    it('renders help text for isochrones', () => {
      mockIsochroneStore.list = [{ id: 1 }]
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('Change postcode')
    })
  })

  describe('search functionality', () => {
    it('renders search placeholder', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.b-form-input')
      expect(input.attributes('placeholder')).toBe('Search posts')
    })
  })

  describe('labels', () => {
    it('shows type label', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('Show these posts')
    })

    it('shows sort label', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.text()).toContain('Sort by')
    })

    it('shows group label', () => {
      const wrapper = createWrapper({ forceShowFilters: true })
      expect(wrapper.find('.group-select').exists()).toBe(true)
    })
  })
})
