import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ComposeGroup from '~/components/ComposeGroup.vue'

const mockComposeStore = {
  postcode: {
    name: 'SW1A 1AA',
    groupsnear: [
      { id: 1, namedisplay: 'London Central', nameshort: 'london-central' },
      { id: 2, namedisplay: 'Westminster', nameshort: 'westminster' },
    ],
  },
  group: null,
}

const mockAuthStore = {
  groups: [{ groupid: 3, namedisplay: 'My Group', nameshort: 'my-group' }],
  fetchUser: vi.fn().mockResolvedValue(undefined),
}

const mockApi = {
  location: {
    typeahead: vi.fn().mockResolvedValue([
      {
        name: 'SW1A 1AA',
        groupsnear: [
          { id: 1, namedisplay: 'London Central', nameshort: 'london-central' },
        ],
      },
    ]),
  },
}

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/api', () => ({
  default: () => mockApi,
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: {} }),
}))

describe('ComposeGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockComposeStore.postcode = {
      name: 'SW1A 1AA',
      groupsnear: [
        { id: 1, namedisplay: 'London Central', nameshort: 'london-central' },
        { id: 2, namedisplay: 'Westminster', nameshort: 'westminster' },
      ],
    }
    mockComposeStore.group = null
    mockAuthStore.groups = [
      { groupid: 3, namedisplay: 'My Group', nameshort: 'my-group' },
    ]
  })

  function createWrapper(props = {}) {
    return mount(ComposeGroup, {
      props,
      global: {
        stubs: {
          'b-form-select': {
            template:
              '<select class="form-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders form select', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.form-select').exists()).toBe(true)
    })

    it('applies width style when width prop is provided', () => {
      const wrapper = createWrapper({ width: 250 })
      expect(wrapper.find('.form-select').attributes('style')).toContain(
        'width: 250px'
      )
    })
  })

  describe('props', () => {
    it('has optional width prop', () => {
      const wrapper = createWrapper({ width: 200 })
      expect(wrapper.props('width')).toBe(200)
    })

    it('has null default for width', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('width')).toBe(null)
    })
  })

  describe('groupOptions computed', () => {
    it('includes groups from postcode.groupsnear', () => {
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')
      expect(options.some((o) => o.text().includes('London Central'))).toBe(
        true
      )
      expect(options.some((o) => o.text().includes('Westminster'))).toBe(true)
    })

    it('includes member groups', () => {
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')
      expect(options.some((o) => o.text().includes('My Group'))).toBe(true)
    })

    it('uses namedisplay when available', () => {
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')
      expect(options.some((o) => o.text() === 'London Central')).toBe(true)
    })

    it('falls back to nameshort when namedisplay is null', () => {
      mockComposeStore.postcode.groupsnear = [
        { id: 1, namedisplay: null, nameshort: 'london-central' },
      ]
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')
      expect(options.some((o) => o.text() === 'london-central')).toBe(true)
    })

    it('deduplicates groups by id', () => {
      mockAuthStore.groups = [
        { groupid: 1, namedisplay: 'London Central', nameshort: 'london' },
      ]
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')
      const londonOptions = options.filter((o) =>
        o.text().includes('London Central')
      )
      expect(londonOptions).toHaveLength(1)
    })

    it('returns empty array when no postcode or groups', () => {
      mockComposeStore.postcode = null
      mockAuthStore.groups = []
      const wrapper = createWrapper()
      expect(wrapper.findAll('option')).toHaveLength(0)
    })
  })

  describe('group computed (v-model)', () => {
    it('returns selected group from store', () => {
      mockComposeStore.group = 2
      const wrapper = createWrapper()
      expect(wrapper.vm.group).toBe(2)
    })

    it('falls back to first group from postcode when no group selected', () => {
      mockComposeStore.group = null
      const wrapper = createWrapper()
      expect(wrapper.vm.group).toBe(1)
    })

    it('sets group in store when changed', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.form-select').setValue('2')

      expect(mockComposeStore.group).toBe('2')
    })
  })

  describe('lifecycle', () => {
    it('fetches user on mount', async () => {
      createWrapper()
      await flushPromises()
      expect(mockAuthStore.fetchUser).toHaveBeenCalled()
    })

    it('fetches fresh postcode data on mount', async () => {
      createWrapper()
      await flushPromises()
      expect(mockApi.location.typeahead).toHaveBeenCalledWith('SW1A 1AA')
    })

    it('auto-selects first group when postcode has groups but no group selected', async () => {
      mockComposeStore.group = null
      createWrapper()
      await flushPromises()
      expect(mockComposeStore.group).toBe(1)
    })

    it('does not fetch when no postcode', async () => {
      mockComposeStore.postcode = null
      createWrapper()
      await flushPromises()
      expect(mockApi.location.typeahead).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles postcode fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.location.typeahead.mockRejectedValueOnce(
        new Error('Network error')
      )

      createWrapper()
      await flushPromises()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
