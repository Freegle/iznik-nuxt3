import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GroupSelect from '~/components/GroupSelect.vue'

const { mockMyGroups, mockMe } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMyGroups: ref([
      { id: 1, namedisplay: 'Test Group A', role: 'Member' },
      { id: 2, namedisplay: 'Test Group B', role: 'Moderator' },
      { id: 3, namedisplay: 'Test Group C', role: 'Owner' },
    ]),
    mockMe: ref({ id: 1, systemrole: 'User' }),
  }
})

const mockMiscStore = {
  get: vi.fn().mockReturnValue(undefined),
  set: vi.fn(),
}

const mockGroupStore = {
  list: {
    1: { id: 1, namedisplay: 'Group 1' },
    2: { id: 2, namedisplay: 'Group 2' },
  },
  summaryList: {},
  fetch: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myGroups: mockMyGroups,
  }),
}))

describe('GroupSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMyGroups.value = [
      { id: 1, namedisplay: 'Test Group A', role: 'Member' },
      { id: 2, namedisplay: 'Test Group B', role: 'Moderator' },
      { id: 3, namedisplay: 'Test Group C', role: 'Owner' },
    ]
    mockMe.value = { id: 1, systemrole: 'User' }
  })

  function createWrapper(props = {}) {
    return mount(GroupSelect, {
      props: {
        modelValue: 0,
        ...props,
      },
      global: {
        stubs: {
          'b-form-select': {
            name: 'b-form-select',
            template:
              '<select class="b-form-select" :value="modelValue" :disabled="disabled" @change="handleChange($event)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['id', 'modelValue', 'size', 'options', 'disabled'],
            emits: ['update:modelValue'],
            methods: {
              handleChange(event) {
                const val = event.target.value
                // Parse as integer if it looks like a number, otherwise keep as-is
                const parsed = /^-?\d+$/.test(val) ? parseInt(val, 10) : val
                this.$emit('update:modelValue', parsed)
              },
            },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders select element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-select').exists()).toBe(true)
    })

    it('renders label when provided', () => {
      const wrapper = createWrapper({ label: 'Select a group' })
      expect(wrapper.find('label').text()).toBe('Select a group')
    })

    it('hides label with visually-hidden class when labelSrOnly is true', () => {
      const wrapper = createWrapper({
        label: 'Select a group',
        labelSrOnly: true,
      })
      expect(wrapper.find('label.visually-hidden').exists()).toBe(true)
    })
  })

  describe('default option', () => {
    it('shows "Please choose" when all is false', () => {
      const wrapper = createWrapper({ all: false })
      expect(wrapper.text()).toContain('-- Please choose --')
    })

    it('shows "All my communities" when all is true and allMy is true', () => {
      const wrapper = createWrapper({ all: true, allMy: true })
      expect(wrapper.text()).toContain('-- All my communities --')
    })

    it('shows "All communities" when all is true and allMy is false', () => {
      const wrapper = createWrapper({ all: true, allMy: false })
      expect(wrapper.text()).toContain('-- All communities --')
    })

    it('shows "My active communities" when all is true and active is true', () => {
      const wrapper = createWrapper({ all: true, active: true })
      expect(wrapper.text()).toContain('-- My active communities --')
    })
  })

  describe('group options', () => {
    it('lists user groups sorted alphabetically', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      const indexA = text.indexOf('Test Group A')
      const indexB = text.indexOf('Test Group B')
      const indexC = text.indexOf('Test Group C')
      expect(indexA).toBeLessThan(indexB)
      expect(indexB).toBeLessThan(indexC)
    })

    it('filters to mod only when modonly is true', () => {
      const wrapper = createWrapper({ modonly: true })
      expect(wrapper.text()).not.toContain('Test Group A')
      expect(wrapper.text()).toContain('Test Group B')
      expect(wrapper.text()).toContain('Test Group C')
    })
  })

  describe('systemwide option', () => {
    it('does not show systemwide when user is not admin', () => {
      const wrapper = createWrapper({ systemwide: true })
      expect(wrapper.text()).not.toContain('-- Systemwide --')
    })

    it('shows systemwide when user is Admin', () => {
      mockMe.value = { id: 1, systemrole: 'Admin' }
      const wrapper = createWrapper({ systemwide: true })
      expect(wrapper.text()).toContain('-- Systemwide --')
    })

    it('shows systemwide when user is Support', () => {
      mockMe.value = { id: 1, systemrole: 'Support' }
      const wrapper = createWrapper({ systemwide: true })
      expect(wrapper.text()).toContain('-- Systemwide --')
    })
  })

  describe('custom option', () => {
    it('shows custom option when customName provided', () => {
      const wrapper = createWrapper({
        customName: 'Custom Option',
        customVal: -1,
      })
      expect(wrapper.text()).toContain('Custom Option')
    })
  })

  describe('v-model', () => {
    it('emits update:modelValue on selection change', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      await wrapper.find('.b-form-select').setValue('1')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('remember functionality', () => {
    it('stores selection when remember is set', async () => {
      const wrapper = createWrapper({ remember: 'test-key' })
      await flushPromises()
      await wrapper.find('.b-form-select').setValue('1')
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'groupselect-test-key',
        value: 1,
      })
    })

    it('restores remembered selection on mount', async () => {
      mockMiscStore.get.mockReturnValue(2)
      createWrapper({ remember: 'test-key' })
      await flushPromises()
      expect(mockMiscStore.get).toHaveBeenCalledWith('groupselect-test-key')
    })
  })

  describe('work counts', () => {
    it('shows work counts when work prop is provided', () => {
      mockMyGroups.value = [
        {
          id: 1,
          namedisplay: 'Test Group',
          role: 'Moderator',
          work: { pending: 5 },
          mysettings: { active: 1 },
        },
      ]
      const wrapper = createWrapper({ work: ['pending'] })
      expect(wrapper.text()).toContain('(5)')
    })

    it('shows backup indicator for inactive moderator', () => {
      mockMyGroups.value = [
        {
          id: 1,
          namedisplay: 'Test Group',
          role: 'Moderator',
          work: { pending: 5 },
          mysettings: { active: 0 },
        },
      ]
      const wrapper = createWrapper({ work: ['pending'] })
      expect(wrapper.text()).toContain('- backup')
    })
  })

  describe('disabled state', () => {
    it('passes disabled prop to select', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(
        wrapper.find('.b-form-select').attributes('disabled')
      ).toBeDefined()
    })
  })

  describe('listall mode', () => {
    it('fetches all groups when listall is true', async () => {
      createWrapper({ listall: true })
      await flushPromises()
      expect(mockGroupStore.fetch).toHaveBeenCalled()
    })
  })

  describe('size prop', () => {
    it('uses md size by default', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.findComponent({ name: 'b-form-select' }).props('size')
      ).toBe('md')
    })

    it('passes custom size', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(
        wrapper.findComponent({ name: 'b-form-select' }).props('size')
      ).toBe('lg')
    })
  })
})
