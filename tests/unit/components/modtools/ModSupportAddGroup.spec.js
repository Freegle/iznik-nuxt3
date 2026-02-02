import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModSupportAddGroup from '~/modtools/components/ModSupportAddGroup.vue'

// Mock the group store
const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue({}),
  get: vi.fn().mockReturnValue(null),
  addgroup: vi.fn().mockResolvedValue(123),
  $state: {
    allGroups: {},
  },
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('ModSupportAddGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock store state
    mockGroupStore.fetch.mockResolvedValue({})
    mockGroupStore.get.mockReturnValue(null)
    mockGroupStore.addgroup.mockResolvedValue(123)
    mockGroupStore.$state.allGroups = {}
  })

  function mountComponent(props = {}) {
    return mount(ModSupportAddGroup, {
      props: { ...props },
      global: {
        stubs: {
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
          },
          'b-form-text': {
            template: '<small class="form-text"><slot /></small>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :type="type || \'text\'" :placeholder="placeholder" />',
            props: ['modelValue', 'type', 'placeholder'],
            emits: ['update:modelValue'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :rows="rows" :placeholder="placeholder" />',
            props: ['modelValue', 'rows', 'placeholder'],
            emits: ['update:modelValue'],
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          SpinButton: {
            template:
              '<button :disabled="disabled" @click="handleClick"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'disabled', 'spinclass'],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows disclaimer text about not being tested in MT3', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('NOT TESTED IN MT3')
    })

    it('shows warning notice about overlapping groups', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("don't check whether this overlaps")
    })

    it('has short name input field', () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder*="EdinburghFreegle"]')
      expect(input.exists()).toBe(true)
    })

    it('has full name input field', () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder*="Edinburgh Freegle"]')
      expect(input.exists()).toBe(true)
    })

    it('has latitude input field', () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Latitude"]')
      expect(input.exists()).toBe(true)
    })

    it('has longitude input field', () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Longitude"]')
      expect(input.exists()).toBe(true)
    })

    it('has Core Group Area textarea', () => {
      const wrapper = mountComponent()
      const textarea = wrapper.find('textarea[placeholder*="Core Group Area"]')
      expect(textarea.exists()).toBe(true)
    })

    it('has Default Posting Area textarea', () => {
      const wrapper = mountComponent()
      const textarea = wrapper.find(
        'textarea[placeholder*="Default Posting Area"]'
      )
      expect(textarea.exists()).toBe(true)
    })

    it('has Add Group button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Add Group')
    })

    it('shows link to WKT drawing tool', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Draw with')
      const link = wrapper.find('a[href*="Wicket"]')
      expect(link.exists()).toBe(true)
    })
  })

  describe('form validation', () => {
    it('is falsy when no fields are filled', () => {
      const wrapper = mountComponent()
      // The computed returns the last && value, which is falsy when any field is missing
      expect(wrapper.vm.valid).toBeFalsy()
    })

    it('is falsy when only nameshort is filled', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      await nextTick()
      expect(wrapper.vm.valid).toBeFalsy()
    })

    it('is falsy when namefull is missing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'
      await nextTick()
      expect(wrapper.vm.valid).toBeFalsy()
    })

    it('is falsy when lat is missing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.namefull = 'Test Freegle Group'
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'
      await nextTick()
      expect(wrapper.vm.valid).toBeFalsy()
    })

    it('is falsy when lng is missing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.namefull = 'Test Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.cga = 'POLYGON((...))'
      await nextTick()
      expect(wrapper.vm.valid).toBeFalsy()
    })

    it('is falsy when cga is missing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.namefull = 'Test Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      await nextTick()
      expect(wrapper.vm.valid).toBeFalsy()
    })

    it('is truthy when all required fields are filled', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.namefull = 'Test Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'
      await nextTick()
      // The computed returns the last truthy value (cga), which is truthy
      expect(wrapper.vm.valid).toBeTruthy()
    })

    it('is truthy with optional dpa field also filled', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.namefull = 'Test Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'
      wrapper.vm.dpa = 'POLYGON((...))'
      await nextTick()
      expect(wrapper.vm.valid).toBeTruthy()
    })
  })

  describe('button state', () => {
    it('disables button when form is invalid', async () => {
      const wrapper = mountComponent()
      await nextTick()

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('disables button when creating', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.namefull = 'Test Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'
      wrapper.vm.creating = true
      await nextTick()

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('enables button when form is valid and not creating', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'TestGroup'
      wrapper.vm.namefull = 'Test Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'
      wrapper.vm.creating = false
      await nextTick()

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
    })
  })

  describe('checkGroupExists', () => {
    it('returns true when group exists via store.get', async () => {
      const wrapper = mountComponent()
      mockGroupStore.get.mockReturnValue({ id: 1, nameshort: 'ExistingGroup' })

      const result = await wrapper.vm.checkGroupExists('ExistingGroup')
      expect(result).toBe(true)
    })

    it('returns true when group exists in allGroups state', async () => {
      const wrapper = mountComponent()
      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {
        existinggroup: { id: 1, nameshort: 'ExistingGroup' },
      }

      const result = await wrapper.vm.checkGroupExists('ExistingGroup')
      expect(result).toBe(true)
    })

    it('returns false when group does not exist', async () => {
      const wrapper = mountComponent()
      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}

      const result = await wrapper.vm.checkGroupExists('NewGroup')
      expect(result).toBe(false)
    })

    it('performs case-insensitive check for allGroups', async () => {
      const wrapper = mountComponent()
      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {
        testgroup: { id: 1, nameshort: 'TestGroup' },
      }

      const result = await wrapper.vm.checkGroupExists('TESTGROUP')
      expect(result).toBe(true)
    })

    it('returns false if fetch fails', async () => {
      const wrapper = mountComponent()
      mockGroupStore.fetch.mockRejectedValue(new Error('Network error'))

      const result = await wrapper.vm.checkGroupExists('TestGroup')
      expect(result).toBe(false)
    })
  })

  describe('add method', () => {
    it('prevents double-clicking', async () => {
      const wrapper = mountComponent()
      wrapper.vm.creating = true
      const callback = vi.fn()

      await wrapper.vm.add(callback)

      expect(mockGroupStore.addgroup).not.toHaveBeenCalled()
      expect(callback).toHaveBeenCalled()
    })

    it('sets creating flag during add', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      const addPromise = wrapper.vm.add(() => {})

      expect(wrapper.vm.creating).toBe(true)

      await addPromise
    })

    it('clears previous messages before adding', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'
      wrapper.vm.groupAdded = 999
      wrapper.vm.errorMessage = 'Old error'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}

      await wrapper.vm.add(() => {})

      // After add, groupAdded should be set to the new ID
      expect(wrapper.vm.groupAdded).toBe(123)
      expect(wrapper.vm.errorMessage).toBeNull()
    })

    it('shows error when group already exists', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'ExistingGroup'
      wrapper.vm.namefull = 'Existing Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      mockGroupStore.get.mockReturnValue({ id: 1 })

      await wrapper.vm.add(() => {})

      expect(wrapper.vm.errorMessage).toContain('already exists')
      expect(wrapper.vm.creating).toBe(false)
      expect(mockGroupStore.addgroup).not.toHaveBeenCalled()
    })

    it('calls addgroup with correct parameters', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((cga))'
      wrapper.vm.dpa = 'POLYGON((dpa))'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}

      await wrapper.vm.add(() => {})

      expect(mockGroupStore.addgroup).toHaveBeenCalledWith({
        nameshort: 'NewGroup',
        namefull: 'New Freegle Group',
        cga: 'POLYGON((cga))',
        dpa: 'POLYGON((dpa))',
        lat: 55.9533,
        lng: -3.1883,
      })
    })

    it('sets groupAdded on success', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}
      mockGroupStore.addgroup.mockResolvedValue(456)

      await wrapper.vm.add(() => {})

      expect(wrapper.vm.groupAdded).toBe(456)
      expect(wrapper.vm.creating).toBe(false)
    })

    it('shows error when addgroup returns falsy', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}
      mockGroupStore.addgroup.mockResolvedValue(null)

      await wrapper.vm.add(() => {})

      expect(wrapper.vm.errorMessage).toContain('Failed to create group')
    })

    it('handles Create failed error', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}
      mockGroupStore.addgroup.mockRejectedValue(new Error('Create failed'))

      await wrapper.vm.add(() => {})

      expect(wrapper.vm.errorMessage).toContain('already exists')
      expect(wrapper.vm.creating).toBe(false)
    })

    it('handles API error response', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}
      const apiError = new Error('API Error')
      apiError.response = { data: { status: 'Invalid coordinates' } }
      mockGroupStore.addgroup.mockRejectedValue(apiError)

      await wrapper.vm.add(() => {})

      expect(wrapper.vm.errorMessage).toContain('Invalid coordinates')
    })

    it('handles generic error', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}
      mockGroupStore.addgroup.mockRejectedValue(new Error('Network error'))

      await wrapper.vm.add(() => {})

      expect(wrapper.vm.errorMessage).toContain('Network error')
    })

    it('calls callback when finished', async () => {
      const wrapper = mountComponent()
      wrapper.vm.nameshort = 'NewGroup'
      wrapper.vm.namefull = 'New Freegle Group'
      wrapper.vm.lat = 55.9533
      wrapper.vm.lng = -3.1883
      wrapper.vm.cga = 'POLYGON((...))'

      mockGroupStore.get.mockReturnValue(null)
      mockGroupStore.$state.allGroups = {}

      const callback = vi.fn()
      await wrapper.vm.add(callback)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('success message', () => {
    it('shows success message when group is added', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupAdded = 123
      wrapper.vm.namefull = 'Test Group'
      await nextTick()

      expect(wrapper.text()).toContain('successfully created')
      expect(wrapper.text()).toContain('Test Group')
      expect(wrapper.text()).toContain('123')
    })

    it('hides success message when groupAdded is null', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupAdded = null
      await nextTick()

      expect(wrapper.text()).not.toContain('successfully created')
    })
  })

  describe('error message', () => {
    it('shows error message when errorMessage is set', async () => {
      const wrapper = mountComponent()
      wrapper.vm.errorMessage = 'Something went wrong'
      await nextTick()

      expect(wrapper.text()).toContain('Something went wrong')
    })

    it('hides error message when errorMessage is null', async () => {
      const wrapper = mountComponent()
      wrapper.vm.errorMessage = null
      await nextTick()

      const dangerNotice = wrapper
        .findAll('.notice-message')
        .filter((n) => n.classes().includes('danger'))
      expect(dangerNotice.length).toBe(0)
    })
  })

  describe('data binding', () => {
    it('updates nameshort when input changes', async () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder*="EdinburghFreegle"]')

      await input.setValue('TestGroup')
      expect(wrapper.vm.nameshort).toBe('TestGroup')
    })

    it('updates namefull when input changes', async () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder*="Edinburgh Freegle"]')

      await input.setValue('Test Freegle Group')
      expect(wrapper.vm.namefull).toBe('Test Freegle Group')
    })

    it('updates lat when input changes', async () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Latitude"]')

      await input.setValue('55.9533')
      expect(wrapper.vm.lat).toBe('55.9533')
    })

    it('updates lng when input changes', async () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Longitude"]')

      await input.setValue('-3.1883')
      expect(wrapper.vm.lng).toBe('-3.1883')
    })

    it('updates cga when textarea changes', async () => {
      const wrapper = mountComponent()
      const textarea = wrapper.find('textarea[placeholder*="Core Group Area"]')

      await textarea.setValue('POLYGON((...))')
      expect(wrapper.vm.cga).toBe('POLYGON((...))')
    })

    it('updates dpa when textarea changes', async () => {
      const wrapper = mountComponent()
      const textarea = wrapper.find(
        'textarea[placeholder*="Default Posting Area"]'
      )

      await textarea.setValue('POLYGON((...))')
      expect(wrapper.vm.dpa).toBe('POLYGON((...))')
    })
  })
})
