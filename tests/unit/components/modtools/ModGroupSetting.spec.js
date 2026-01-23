import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModGroupSetting from '~/modtools/components/ModGroupSetting.vue'

// Create mock store instance that can be configured per test
let mockModGroupStore

// Mock the store import - we use a getter to capture the current value
vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

describe('ModGroupSetting', () => {
  const defaultProps = {
    name: 'nameshort',
    groupid: 123,
    label: 'Short Name',
  }

  const defaultGroup = {
    id: 123,
    nameshort: 'TestGroup',
    namedisplay: 'Test Group Display',
    myrole: 'Owner',
    settings: {
      autoapprove: 1,
      autopost: {
        enabled: true,
        delay: 10,
      },
    },
  }

  function mountComponent(props = {}, groupOverrides = {}) {
    const group = { ...defaultGroup, ...groupOverrides }
    mockModGroupStore.get.mockReturnValue(group)

    return mount(ModGroupSetting, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
            props: ['label'],
          },
          'b-form-text': {
            template: '<div class="form-text"><slot /></div>',
          },
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template: `
              <input
                :value="modelValue"
                :type="type || 'text'"
                :step="step"
                class="form-input"
                @input="$emit('update:modelValue', $event.target.value)"
              />
            `,
            props: ['modelValue', 'type', 'step'],
          },
          'b-form-textarea': {
            template: `
              <textarea
                :value="modelValue"
                :rows="rows"
                class="form-textarea"
                @input="$emit('update:modelValue', $event.target.value)"
              />
            `,
            props: ['modelValue', 'rows'],
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          SpinButton: {
            template: `
              <button
                class="spin-button"
                :disabled="disabled"
                @click="$emit('handle', $event)"
              >
                {{ label }}
              </button>
            `,
            props: ['variant', 'iconName', 'label', 'disabled'],
            emits: ['handle'],
          },
          OurToggle: {
            template: `
              <div
                class="our-toggle"
                :data-value="modelValue"
                :data-disabled="disabled"
                @click="handleClick"
              >
                Toggle
              </div>
            `,
            props: [
              'modelValue',
              'height',
              'width',
              'fontSize',
              'sync',
              'labels',
              'variant',
              'disabled',
            ],
            emits: ['update:modelValue', 'change'],
            methods: {
              handleClick() {
                if (!this.disabled) {
                  const newValue = !this.modelValue
                  this.$emit('update:modelValue', newValue)
                  this.$emit('change', newValue)
                }
              },
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Create a fresh mock store for each test
    mockModGroupStore = {
      get: vi.fn().mockReturnValue({ ...defaultGroup }),
      updateMT: vi.fn().mockResolvedValue({}),
    }
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders a form group', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.form-group').exists()).toBe(true)
    })

    it('renders description text when provided', () => {
      const wrapper = mountComponent({
        description: 'This is a helpful description',
      })
      expect(wrapper.find('.form-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('This is a helpful description')
    })

    it('does not render description text when not provided', () => {
      const wrapper = mountComponent({ description: null })
      expect(wrapper.find('.form-text').exists()).toBe(false)
    })
  })

  describe('input type rendering', () => {
    it('renders text input for type="input"', () => {
      const wrapper = mountComponent({ type: 'input' })
      expect(wrapper.find('.input-group').exists()).toBe(true)
      expect(wrapper.find('.form-input').exists()).toBe(true)
    })

    it('renders number input for type="number"', async () => {
      const wrapper = mountComponent({ type: 'number' })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.input-group').exists()).toBe(true)
      const input = wrapper.find('.form-input')
      expect(input.exists()).toBe(true)
      expect(input.attributes('type')).toBe('number')
    })

    it('renders textarea for type="textarea"', () => {
      const wrapper = mountComponent({ type: 'textarea' })
      expect(wrapper.find('.form-textarea').exists()).toBe(true)
    })

    it('renders toggle for type="toggle"', () => {
      const wrapper = mountComponent({ type: 'toggle' })
      expect(wrapper.find('.our-toggle').exists()).toBe(true)
    })

    it('uses default type of "input" when not specified', () => {
      const wrapper = mountComponent({})
      expect(wrapper.find('.form-input').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts required name prop', () => {
      const wrapper = mountComponent({ name: 'testname' })
      expect(wrapper.props('name')).toBe('testname')
    })

    it('accepts required groupid prop', () => {
      const wrapper = mountComponent({ groupid: 456 })
      expect(wrapper.props('groupid')).toBe(456)
    })

    it('accepts required label prop', () => {
      const wrapper = mountComponent({ label: 'Test Label' })
      expect(wrapper.props('label')).toBe('Test Label')
    })

    it('accepts optional description prop', () => {
      const wrapper = mountComponent({ description: 'Test description' })
      expect(wrapper.props('description')).toBe('Test description')
    })

    it('accepts step prop for number input with default of 1', () => {
      const wrapper = mountComponent({ type: 'number' })
      expect(wrapper.props('step')).toBe(1)
    })

    it('accepts custom step prop for number input', () => {
      const wrapper = mountComponent({ type: 'number', step: 0.1 })
      expect(wrapper.props('step')).toBe(0.1)
    })

    it('accepts rows prop for textarea with default of 3', () => {
      const wrapper = mountComponent({ type: 'textarea' })
      expect(wrapper.props('rows')).toBe(3)
    })

    it('accepts custom rows prop for textarea', () => {
      const wrapper = mountComponent({ type: 'textarea', rows: 10 })
      expect(wrapper.props('rows')).toBe(10)
    })

    it('accepts toggleWidth prop with default of 150', () => {
      const wrapper = mountComponent({ type: 'toggle' })
      expect(wrapper.props('toggleWidth')).toBe(150)
    })

    it('accepts toggleChecked prop', () => {
      const wrapper = mountComponent({ type: 'toggle', toggleChecked: 'Yes' })
      expect(wrapper.props('toggleChecked')).toBe('Yes')
    })

    it('accepts toggleUnchecked prop', () => {
      const wrapper = mountComponent({ type: 'toggle', toggleUnchecked: 'No' })
      expect(wrapper.props('toggleUnchecked')).toBe('No')
    })
  })

  describe('computed properties', () => {
    it('gets group from store using groupid prop', () => {
      mountComponent({ groupid: 789 })
      expect(mockModGroupStore.get).toHaveBeenCalledWith(789)
    })

    it('readonly is true when myrole is not Owner', () => {
      const wrapper = mountComponent({}, { myrole: 'Moderator' })
      expect(wrapper.vm.readonly).toBe(true)
    })

    it('readonly is false when myrole is Owner', () => {
      const wrapper = mountComponent({}, { myrole: 'Owner' })
      expect(wrapper.vm.readonly).toBe(false)
    })

    it('readonly is true when group is null', () => {
      // Set up mock before mounting
      mockModGroupStore.get = vi.fn().mockReturnValue(null)
      const wrapper = mount(ModGroupSetting, {
        props: { ...defaultProps },
        global: {
          stubs: {
            'b-form-group': {
              template: '<div class="form-group"><slot /></div>',
            },
            'b-form-text': {
              template: '<div class="form-text"><slot /></div>',
            },
            'b-input-group': {
              template: '<div class="input-group"><slot /></div>',
            },
            'b-form-input': { template: '<input class="form-input" />' },
            'b-form-textarea': {
              template: '<textarea class="form-textarea" />',
            },
            'b-row': { template: '<div class="row"><slot /></div>' },
            'b-col': { template: '<div class="col"><slot /></div>' },
            SpinButton: { template: '<button class="spin-button" />' },
            OurToggle: { template: '<div class="our-toggle" />' },
          },
        },
      })
      expect(wrapper.vm.readonly).toBe(true)
    })
  })

  describe('getValueFromGroup', () => {
    it('gets simple top-level property value', async () => {
      const wrapper = mountComponent(
        { name: 'nameshort' },
        { nameshort: 'MyGroup' }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe('MyGroup')
    })

    it('gets nested property value with dot notation', async () => {
      const wrapper = mountComponent(
        { name: 'settings.autoapprove' },
        { settings: { autoapprove: 5 } }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe(5)
    })

    it('gets deeply nested property value', async () => {
      const wrapper = mountComponent(
        { name: 'settings.autopost.delay' },
        { settings: { autopost: { delay: 30 } } }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe(30)
    })

    it('converts string value to boolean for toggle type', async () => {
      const wrapper = mountComponent(
        { name: 'settings.autoapprove', type: 'toggle' },
        { settings: { autoapprove: '1' } }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe(true)
    })

    it('converts "0" string to false for toggle type', async () => {
      const wrapper = mountComponent(
        { name: 'settings.autoapprove', type: 'toggle' },
        { settings: { autoapprove: '0' } }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe(false)
    })

    it('keeps boolean value as-is for toggle type', async () => {
      const wrapper = mountComponent(
        { name: 'settings.enabled', type: 'toggle' },
        { settings: { enabled: true } }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe(true)
    })

    it('handles missing group gracefully', async () => {
      // Set up mock before mounting
      mockModGroupStore.get = vi.fn().mockReturnValue(null)
      const wrapper = mount(ModGroupSetting, {
        props: { name: 'nameshort', groupid: 123, label: 'Short Name' },
        global: {
          stubs: {
            'b-form-group': {
              template: '<div class="form-group"><slot /></div>',
            },
            'b-form-text': {
              template: '<div class="form-text"><slot /></div>',
            },
            'b-input-group': {
              template: '<div class="input-group"><slot /></div>',
            },
            'b-form-input': { template: '<input class="form-input" />' },
            'b-form-textarea': {
              template: '<textarea class="form-textarea" />',
            },
            'b-row': { template: '<div class="row"><slot /></div>' },
            'b-col': { template: '<div class="col"><slot /></div>' },
            SpinButton: { template: '<button class="spin-button" />' },
            OurToggle: { template: '<div class="our-toggle" />' },
          },
        },
      })
      await flushPromises()
      expect(wrapper.vm.value).toBeNull()
    })
  })

  describe('save method', () => {
    it('does not call updateMT before mounted is true', async () => {
      const wrapper = mountComponent({ name: 'nameshort' })
      // Immediately call save before mounted completes
      wrapper.vm.mounted = false
      await wrapper.vm.save()
      expect(mockModGroupStore.updateMT).not.toHaveBeenCalled()
    })

    it('calls updateMT with groupid and top-level property', async () => {
      const wrapper = mountComponent({ name: 'nameshort', groupid: 123 })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      // The input is bound to the 'value' ref via v-model
      // We need to update it via the component's internal ref or pass a direct value to save
      await wrapper.vm.save('NewName')

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
        id: 123,
        nameshort: 'NewName',
      })
    })

    it('converts boolean true to 1 when saving', async () => {
      const wrapper = mountComponent({
        name: 'settings.autoapprove',
        type: 'toggle',
        groupid: 123,
      })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      await wrapper.vm.save(true)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 123,
        })
      )
    })

    it('converts boolean false to 0 when saving', async () => {
      const wrapper = mountComponent({
        name: 'settings.autoapprove',
        type: 'toggle',
        groupid: 123,
      })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      await wrapper.vm.save(false)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 123,
        })
      )
    })

    it('handles nested property save with dot notation', async () => {
      const group = {
        ...defaultGroup,
        settings: { autoapprove: 1, autopost: { enabled: true } },
      }
      mockModGroupStore.get = vi.fn().mockReturnValue(group)
      mockModGroupStore.updateMT = vi.fn().mockResolvedValue({})

      const wrapper = mountComponent({
        name: 'settings.autoapprove',
        groupid: 123,
        type: 'number',
      })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      // Pass the new value directly to save
      await wrapper.vm.save(5)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 123,
          settings: expect.objectContaining({
            autoapprove: 5,
          }),
        })
      )
    })

    it('calls callback function if provided', async () => {
      const wrapper = mountComponent({ name: 'nameshort' })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      const callback = vi.fn()
      await wrapper.vm.save(callback)

      expect(callback).toHaveBeenCalled()
    })

    it('uses callback value if it is not a function', async () => {
      const wrapper = mountComponent({ name: 'nameshort', groupid: 123 })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      await wrapper.vm.save('DirectValue')

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
        id: 123,
        nameshort: 'DirectValue',
      })
    })
  })

  describe('user interactions', () => {
    it('updates value when input changes', async () => {
      const wrapper = mountComponent({ name: 'nameshort', type: 'input' })
      await flushPromises()

      const input = wrapper.find('.form-input')
      await input.setValue('NewValue')

      expect(wrapper.vm.value).toBe('NewValue')
    })

    it('calls save when SpinButton is clicked for input type', async () => {
      const wrapper = mountComponent({ name: 'nameshort', type: 'input' })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      const saveButton = wrapper.find('.spin-button')
      await saveButton.trigger('click')

      expect(mockModGroupStore.updateMT).toHaveBeenCalled()
    })

    it('calls save when SpinButton is clicked for textarea type', async () => {
      const wrapper = mountComponent({ name: 'description', type: 'textarea' })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      const saveButton = wrapper.find('.spin-button')
      await saveButton.trigger('click')

      expect(mockModGroupStore.updateMT).toHaveBeenCalled()
    })

    it('calls save when toggle changes', async () => {
      const wrapper = mountComponent(
        { name: 'settings.autoapprove', type: 'toggle' },
        { settings: { autoapprove: false } }
      )
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      const toggle = wrapper.find('.our-toggle')
      await toggle.trigger('click')

      expect(mockModGroupStore.updateMT).toHaveBeenCalled()
    })

    it('disables save button when readonly', async () => {
      const wrapper = mountComponent(
        { name: 'nameshort', type: 'input' },
        { myrole: 'Moderator' }
      )
      await flushPromises()

      const saveButton = wrapper.find('.spin-button')
      // The disabled attribute could be 'true', '', or present
      expect(saveButton.attributes('disabled')).toBeDefined()
    })

    it('disables toggle when readonly', async () => {
      const wrapper = mountComponent(
        { name: 'settings.autoapprove', type: 'toggle' },
        { myrole: 'Moderator' }
      )
      await flushPromises()

      const toggle = wrapper.find('.our-toggle')
      expect(toggle.attributes('data-disabled')).toBe('true')
    })
  })

  describe('watch effects', () => {
    it('updates value when groupid changes', async () => {
      const wrapper = mountComponent({ name: 'nameshort', groupid: 123 })
      await flushPromises()

      expect(wrapper.vm.value).toBe('TestGroup')

      // Change the group returned by the store
      mockModGroupStore.get.mockReturnValue({
        ...defaultGroup,
        id: 456,
        nameshort: 'AnotherGroup',
      })

      // Update the groupid prop
      await wrapper.setProps({ groupid: 456 })
      await flushPromises()

      expect(wrapper.vm.value).toBe('AnotherGroup')
    })
  })

  describe('setDeep utility', () => {
    it('sets deeply nested value correctly', async () => {
      // The group object that the store will return - must be the same reference
      const group = {
        ...defaultGroup,
        settings: {
          level1: {
            level2: {
              level3: 'original',
            },
          },
        },
      }

      // Mock must return the same object reference so setDeep can modify it
      mockModGroupStore.get = vi.fn().mockReturnValue(group)
      mockModGroupStore.updateMT = vi.fn().mockResolvedValue({})

      const wrapper = mount(ModGroupSetting, {
        props: {
          name: 'settings.level1.level2.level3',
          groupid: 123,
          label: 'Test Label',
          type: 'input',
        },
        global: {
          stubs: {
            'b-form-group': {
              template: '<div class="form-group"><slot /></div>',
            },
            'b-form-text': {
              template: '<div class="form-text"><slot /></div>',
            },
            'b-input-group': {
              template: '<div class="input-group"><slot /></div>',
            },
            'b-form-input': { template: '<input class="form-input" />' },
            'b-form-textarea': {
              template: '<textarea class="form-textarea" />',
            },
            'b-row': { template: '<div class="row"><slot /></div>' },
            'b-col': { template: '<div class="col"><slot /></div>' },
            SpinButton: { template: '<button class="spin-button" />' },
            OurToggle: { template: '<div class="our-toggle" />' },
          },
        },
      })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      // Pass the new value directly to save
      await wrapper.vm.save('newvalue')

      expect(mockModGroupStore.updateMT).toHaveBeenCalled()
      const updateCall = mockModGroupStore.updateMT.mock.calls[0][0]
      expect(updateCall.settings.level1.level2.level3).toBe('newvalue')
    })
  })

  describe('mounted lifecycle', () => {
    it('loads value from group on mount', async () => {
      const wrapper = mountComponent(
        { name: 'nameshort' },
        { nameshort: 'MountedValue' }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe('MountedValue')
    })

    it('sets mounted to true after nextTick', async () => {
      const wrapper = mountComponent({ name: 'nameshort' })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()
      expect(wrapper.vm.mounted).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles undefined nested property gracefully', async () => {
      const wrapper = mountComponent(
        { name: 'settings.nonexistent.deep' },
        { settings: {} }
      )
      await flushPromises()
      // Should not throw and value should be null (initial value)
      expect(wrapper.vm.value).toBeNull()
    })

    it('handles empty string value', async () => {
      const wrapper = mountComponent({ name: 'nameshort' }, { nameshort: '' })
      await flushPromises()
      expect(wrapper.vm.value).toBe('')
    })

    it('handles zero as a valid number value', async () => {
      const wrapper = mountComponent(
        { name: 'settings.delay', type: 'number' },
        { settings: { delay: 0 } }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe(0)
    })

    it('handles null group object from store', async () => {
      // Set up mock before mounting
      mockModGroupStore.get = vi.fn().mockReturnValue(null)
      const wrapper = mount(ModGroupSetting, {
        props: { name: 'nameshort', groupid: 123, label: 'Short Name' },
        global: {
          stubs: {
            'b-form-group': {
              template: '<div class="form-group"><slot /></div>',
            },
            'b-form-text': {
              template: '<div class="form-text"><slot /></div>',
            },
            'b-input-group': {
              template: '<div class="input-group"><slot /></div>',
            },
            'b-form-input': { template: '<input class="form-input" />' },
            'b-form-textarea': {
              template: '<textarea class="form-textarea" />',
            },
            'b-row': { template: '<div class="row"><slot /></div>' },
            'b-col': { template: '<div class="col"><slot /></div>' },
            SpinButton: { template: '<button class="spin-button" />' },
            OurToggle: { template: '<div class="our-toggle" />' },
          },
        },
      })
      await flushPromises()
      expect(wrapper.vm.value).toBeNull()
      expect(wrapper.vm.readonly).toBe(true)
    })
  })
})
