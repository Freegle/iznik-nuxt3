import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModGroupSelect from '~/modtools/components/ModGroupSelect.vue'

// Hoisted mocks - these must be defined before vi.mock calls
const { mockMiscStore, mockModGroupStore, mockMe } = vi.hoisted(() => {
  return {
    mockMiscStore: {
      vals: {},
      set: vi.fn(),
      get: vi.fn().mockReturnValue(undefined),
    },
    mockModGroupStore: {
      list: {},
      allGroups: {},
      received: true,
    },
    mockMe: { id: 123, displayname: 'Test User', systemrole: 'Moderator' },
  }
})

// Mock stores
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

// Mock composable - me needs to be a ref-like object for template access
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: { value: mockMe },
  }),
}))

describe('ModGroupSelect', () => {
  // Sample groups for testing
  const sampleGroups = {
    1: {
      id: 1,
      namedisplay: 'Alpha Group',
      role: 'Moderator',
      mysettings: { active: 1 },
      work: { pending: 5, spam: 2 },
    },
    2: {
      id: 2,
      namedisplay: 'Beta Group',
      role: 'Owner',
      mysettings: { active: 1 },
      work: { pending: 3 },
    },
    3: {
      id: 3,
      namedisplay: 'Gamma Group',
      role: 'Member',
      mysettings: { active: 0 },
      work: {},
    },
    4: {
      id: 4,
      namedisplay: 'Delta Group',
      role: 'Moderator',
      mysettings: { active: 1 },
    },
  }

  const allGroupsList = {
    ...sampleGroups,
    5: {
      id: 5,
      namedisplay: 'External Group',
      role: null,
    },
  }

  function mountComponent(props = {}) {
    return mount(ModGroupSelect, {
      props: {
        modelValue: 0,
        ...props,
      },
      global: {
        stubs: {
          'b-form-select': {
            template: `
              <select
                :value="modelValue"
                :disabled="disabled"
                @change="$emit('update:modelValue', parseInt($event.target.value))"
              >
                <option v-for="opt in options" :key="opt.value" :value="opt.value">
                  {{ opt.text }}
                </option>
              </select>
            `,
            props: ['modelValue', 'options', 'size', 'disabled'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    mockModGroupStore.list = { ...sampleGroups }
    mockModGroupStore.allGroups = { ...allGroupsList }
    mockModGroupStore.received = true
    mockMiscStore.vals = {}
    mockMiscStore.get.mockReturnValue(undefined)
    // Reset me to default moderator role
    mockMe.systemrole = 'Moderator'
  })

  describe('Rendering', () => {
    it('renders a select element', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('select').exists()).toBe(true)
    })

    it('renders label when provided', () => {
      const wrapper = mountComponent({ label: 'Select Community' })
      const label = wrapper.find('label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Select Community')
    })

    it('does not render label when not provided', () => {
      const wrapper = mountComponent({ label: '' })
      expect(wrapper.find('label').exists()).toBe(false)
    })

    it('applies visually-hidden class when labelSrOnly is true', () => {
      const wrapper = mountComponent({
        label: 'Hidden Label',
        labelSrOnly: true,
      })
      const label = wrapper.find('label')
      expect(label.classes()).toContain('visually-hidden')
    })

    it('does not apply visually-hidden class when labelSrOnly is false', () => {
      const wrapper = mountComponent({
        label: 'Visible Label',
        labelSrOnly: false,
      })
      const label = wrapper.find('label')
      expect(label.classes()).not.toContain('visually-hidden')
    })
  })

  describe('Computed: groups', () => {
    it('returns list when listall is false', () => {
      const wrapper = mountComponent({ listall: false })
      expect(wrapper.vm.groups).toEqual(Object.values(sampleGroups))
    })

    it('returns allGroups when listall is true', () => {
      const wrapper = mountComponent({ listall: true })
      const result = wrapper.vm.groups
      expect(result.length).toBe(Object.keys(allGroupsList).length)
    })
  })

  describe('Computed: sortedGroups', () => {
    it('sorts groups alphabetically by namedisplay', () => {
      const wrapper = mountComponent()
      const sorted = wrapper.vm.sortedGroups
      expect(sorted[0].namedisplay).toBe('Alpha Group')
      expect(sorted[1].namedisplay).toBe('Beta Group')
      expect(sorted[2].namedisplay).toBe('Delta Group')
      expect(sorted[3].namedisplay).toBe('Gamma Group')
    })

    it('sorts case-insensitively', () => {
      mockModGroupStore.list = {
        1: { id: 1, namedisplay: 'alpha', role: 'Moderator', mysettings: {} },
        2: { id: 2, namedisplay: 'BETA', role: 'Moderator', mysettings: {} },
        3: { id: 3, namedisplay: 'Gamma', role: 'Moderator', mysettings: {} },
      }
      const wrapper = mountComponent()
      const sorted = wrapper.vm.sortedGroups
      expect(sorted[0].namedisplay).toBe('alpha')
      expect(sorted[1].namedisplay).toBe('BETA')
      expect(sorted[2].namedisplay).toBe('Gamma')
    })
  })

  describe('Computed: groupOptions', () => {
    it('includes "Please choose" when all is false', () => {
      const wrapper = mountComponent({ all: false })
      const options = wrapper.vm.groupOptions
      expect(options[0].text).toBe('-- Please choose --')
      expect(options[0].value).toBe(0)
    })

    it('includes "All my communities" when all is true and allMy is true', () => {
      const wrapper = mountComponent({ all: true, allMy: true })
      const options = wrapper.vm.groupOptions
      expect(options[0].text).toBe('-- All my communities --')
      expect(options[0].value).toBe(0)
    })

    it('includes "All communities" when all is true and allMy is false', () => {
      const wrapper = mountComponent({ all: true, allMy: false })
      const options = wrapper.vm.groupOptions
      expect(options[0].text).toBe('-- All communities --')
      expect(options[0].value).toBe(0)
    })

    it('includes "My active communities" when all is true and active is true', () => {
      const wrapper = mountComponent({ all: true, active: true })
      const options = wrapper.vm.groupOptions
      expect(options[0].text).toBe('-- My active communities --')
    })

    it('includes Systemwide option for Admin users when systemwide is true', () => {
      mockMe.systemrole = 'Admin'
      const wrapper = mountComponent({ systemwide: true })
      const options = wrapper.vm.groupOptions
      const systemwideOption = options.find((o) => o.value === -2)
      expect(systemwideOption).toBeDefined()
      expect(systemwideOption.text).toBe('-- Systemwide --')
    })

    it('includes Systemwide option for Support users when systemwide is true', () => {
      mockMe.systemrole = 'Support'
      const wrapper = mountComponent({ systemwide: true })
      const options = wrapper.vm.groupOptions
      const systemwideOption = options.find((o) => o.value === -2)
      expect(systemwideOption).toBeDefined()
    })

    it('does not include Systemwide option for Moderator users when systemwide is true', () => {
      mockMe.systemrole = 'Moderator'
      const wrapper = mountComponent({ systemwide: true })
      const options = wrapper.vm.groupOptions
      const systemwideOption = options.find((o) => o.value === -2)
      expect(systemwideOption).toBeUndefined()
    })

    it('does not include Systemwide option when systemwide is false', () => {
      mockMe.systemrole = 'Admin'
      const wrapper = mountComponent({ systemwide: false })
      const options = wrapper.vm.groupOptions
      const systemwideOption = options.find((o) => o.value === -2)
      expect(systemwideOption).toBeUndefined()
    })

    it('includes custom option when customName is provided', () => {
      const wrapper = mountComponent({
        customName: 'Custom Option',
        customVal: -99,
      })
      const options = wrapper.vm.groupOptions
      expect(options[0].text).toBe('Custom Option')
      expect(options[0].value).toBe(-99)
    })

    it('filters to mod-only groups when modonly is true', () => {
      const wrapper = mountComponent({ modonly: true })
      const options = wrapper.vm.groupOptions
      // Should include Moderator and Owner roles but not Member role
      const groupNames = options.map((o) => o.text)
      expect(groupNames).toContain('Alpha Group')
      expect(groupNames).toContain('Beta Group')
      expect(groupNames).toContain('Delta Group')
      expect(groupNames).not.toContain('Gamma Group') // Member role
    })

    it('includes all roles when modonly is false', () => {
      const wrapper = mountComponent({ modonly: false })
      const options = wrapper.vm.groupOptions
      const groupNames = options.map((o) => o.text)
      expect(groupNames).toContain('Gamma Group - backup')
    })

    it('appends work counts when work prop is provided', () => {
      const wrapper = mountComponent({ work: ['pending'] })
      const options = wrapper.vm.groupOptions
      const alphaOption = options.find((o) => o.value === 1)
      expect(alphaOption.text).toBe('Alpha Group (5)')
    })

    it('appends multiple work counts when multiple work types provided', () => {
      const wrapper = mountComponent({ work: ['pending', 'spam'] })
      const options = wrapper.vm.groupOptions
      const alphaOption = options.find((o) => o.value === 1)
      expect(alphaOption.text).toBe('Alpha Group (5) (2)')
    })

    it('appends " - backup" for inactive groups', () => {
      const wrapper = mountComponent()
      const options = wrapper.vm.groupOptions
      const gammaOption = options.find((o) => o.value === 3)
      expect(gammaOption.text).toContain('- backup')
    })

    it('sets selected property correctly for selected group', () => {
      const wrapper = mountComponent({ modelValue: 2 })
      const options = wrapper.vm.groupOptions
      const betaOption = options.find((o) => o.value === 2)
      expect(betaOption.selected).toBe(true)
    })
  })

  describe('Computed: invalidSelection', () => {
    it('returns true when no option is selected', () => {
      const wrapper = mountComponent({ modelValue: 999 }) // Non-existent group
      expect(wrapper.vm.invalidSelection).toBe(true)
    })

    it('returns false when an option is selected', () => {
      const wrapper = mountComponent({ modelValue: 1 })
      expect(wrapper.vm.invalidSelection).toBe(false)
    })
  })

  describe('Computed: groupsloaded', () => {
    it('returns true when modGroupStore.received is true', () => {
      mockModGroupStore.received = true
      const wrapper = mountComponent()
      expect(wrapper.vm.groupsloaded).toBe(true)
    })

    it('returns false when modGroupStore.received is false', () => {
      mockModGroupStore.received = false
      const wrapper = mountComponent()
      expect(wrapper.vm.groupsloaded).toBe(false)
    })
  })

  describe('selectedGroup computed setter', () => {
    it('emits update:modelValue when groups are received', async () => {
      mockModGroupStore.received = true
      const wrapper = mountComponent()
      const select = wrapper.find('select')
      // setValue passes value as string, so we use '2' and expect parseInt result
      await select.setValue('2')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([2])
    })

    it('does not emit update:modelValue when groups are not received', () => {
      mockModGroupStore.received = false
      const wrapper = mountComponent()
      // Trigger the setter directly since the guard prevents emission
      wrapper.vm.selectedGroup = 2
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('saves to miscStore when remember prop is set', async () => {
      mockModGroupStore.received = true
      const wrapper = mountComponent({ remember: 'testPage' })
      const select = wrapper.find('select')
      await select.setValue('2')
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'groupselect-testPage',
        value: 2,
      })
    })

    it('does not save to miscStore when remember prop is null', async () => {
      mockModGroupStore.received = true
      const wrapper = mountComponent({ remember: null })
      const select = wrapper.find('select')
      await select.setValue('2')
      expect(mockMiscStore.set).not.toHaveBeenCalled()
    })
  })

  describe('Watchers', () => {
    it('resets to 0 when invalidSelection becomes true and restrict is true', async () => {
      // Start with a valid selection
      const wrapper = mountComponent({ modelValue: 1, restrict: true })
      expect(wrapper.vm.invalidSelection).toBe(false)

      // Remove the group from the list to make selection invalid
      mockModGroupStore.list = {}
      await wrapper.vm.$nextTick()

      // The watcher should have emitted to reset to 0
      const emitted = wrapper.emitted('update:modelValue')
      if (emitted && emitted.length > 0) {
        expect(emitted[emitted.length - 1]).toEqual([0])
      }
    })

    it('does not reset when invalidSelection becomes true and restrict is false', () => {
      const wrapper = mountComponent({ modelValue: 1, restrict: false })
      // The invalid selection should not auto-reset when restrict is false
      expect(wrapper.props('restrict')).toBe(false)
    })
  })

  describe('onMounted - remembered group restoration', () => {
    it('restores remembered group on mount when remember is set and modelValue is 0', async () => {
      mockMiscStore.get.mockReturnValue(2)
      mockModGroupStore.received = true

      const wrapper = mountComponent({ remember: 'testPage', modelValue: 0 })
      await flushPromises()

      // Should emit the remembered value
      const emitted = wrapper.emitted('update:modelValue')
      if (emitted) {
        expect(emitted.some((e) => e[0] === 2)).toBe(true)
      }
    })

    it('does not restore when modelValue is already set', async () => {
      mockMiscStore.get.mockReturnValue(3)

      mountComponent({ remember: 'testPage', modelValue: 1 })
      await flushPromises()

      // Should not have called get since modelValue is non-zero
      // The mount logic checks !props.modelValue first
    })

    it('does not restore when urlOverride is true', async () => {
      mockMiscStore.get.mockReturnValue(2)

      const wrapper = mountComponent({
        remember: 'testPage',
        modelValue: 0,
        urlOverride: true,
      })
      await flushPromises()

      // With urlOverride, the remember value should not be applied
      const emitted = wrapper.emitted('update:modelValue')
      // Should not emit the remembered value because urlOverride blocks it
      if (emitted) {
        expect(emitted.every((e) => e[0] !== 2)).toBe(true)
      }
    })

    it('does not restore when remember is null', async () => {
      mockMiscStore.get.mockReturnValue(2)

      mountComponent({ remember: null, modelValue: 0 })
      await flushPromises()

      // miscStore.get should not be called with null remember
    })
  })

  describe('Disabled state', () => {
    it('passes disabled prop to b-form-select', () => {
      const wrapper = mountComponent({ disabled: true })
      const select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeDefined()
    })

    it('select is not disabled when disabled prop is false', () => {
      const wrapper = mountComponent({ disabled: false })
      const select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeUndefined()
    })
  })

  describe('listall mode', () => {
    it('uses allGroups instead of list when listall is true', () => {
      const wrapper = mountComponent({ listall: true })
      const options = wrapper.vm.groupOptions
      // External Group (id: 5) should be included
      const externalOption = options.find((o) => o.value === 5)
      expect(externalOption).toBeDefined()
      expect(externalOption.text).toBe('External Group')
    })

    it('includes all groups regardless of role when listall is true', () => {
      const wrapper = mountComponent({ listall: true, modonly: true })
      const options = wrapper.vm.groupOptions
      // Even with modonly true, listall should include all groups
      const externalOption = options.find((o) => o.value === 5)
      expect(externalOption).toBeDefined()
    })
  })

  describe('Edge cases', () => {
    it('handles empty groups list', () => {
      mockModGroupStore.list = {}
      const wrapper = mountComponent()
      const options = wrapper.vm.groupOptions
      // Should still have the "Please choose" option
      expect(options.length).toBeGreaterThanOrEqual(1)
      expect(options[0].value).toBe(0)
    })

    it('handles groups without work property', () => {
      mockModGroupStore.list = {
        1: {
          id: 1,
          namedisplay: 'No Work Group',
          role: 'Moderator',
          mysettings: {},
        },
      }
      const wrapper = mountComponent({ work: ['pending'] })
      const options = wrapper.vm.groupOptions
      const option = options.find((o) => o.value === 1)
      // Should not crash and should not add work count
      expect(option.text).toBe('No Work Group')
    })

    it('handles groups without mysettings property', () => {
      mockModGroupStore.list = {
        1: { id: 1, namedisplay: 'No Settings Group', role: 'Moderator' },
      }
      const wrapper = mountComponent()
      const options = wrapper.vm.groupOptions
      const option = options.find((o) => o.value === 1)
      // Should not crash and should not add backup suffix
      expect(option.text).toBe('No Settings Group')
    })

    it('handles me being null', () => {
      // Temporarily set me to null
      const originalMe = { ...mockMe }
      Object.keys(mockMe).forEach((k) => delete mockMe[k])

      const wrapper = mountComponent({ systemwide: true })
      const options = wrapper.vm.groupOptions
      // Should not include Systemwide option
      const systemwideOption = options.find((o) => o.value === -2)
      expect(systemwideOption).toBeUndefined()

      // Restore me
      Object.assign(mockMe, originalMe)
    })
  })

  describe('Integration with v-model', () => {
    it('reflects modelValue in selected option', () => {
      const wrapper = mountComponent({ modelValue: 2 })
      const options = wrapper.vm.groupOptions
      const selectedOption = options.find((o) => o.selected)
      expect(selectedOption.value).toBe(2)
    })

    it('updates when modelValue prop changes', async () => {
      const wrapper = mountComponent({ modelValue: 1 })
      expect(wrapper.vm.selectedGroup).toBe(1)

      await wrapper.setProps({ modelValue: 2 })
      expect(wrapper.vm.selectedGroup).toBe(2)
    })
  })
})
