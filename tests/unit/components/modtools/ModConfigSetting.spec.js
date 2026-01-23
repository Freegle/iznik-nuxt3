import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModConfigSetting from '~/modtools/components/ModConfigSetting.vue'

// Mock the modconfig store
const mockModConfigStore = {
  current: null,
  updateConfig: vi.fn(),
}

vi.mock('~/stores/modconfig', () => ({
  useModConfigStore: () => mockModConfigStore,
}))

describe('ModConfigSetting', () => {
  const defaultProps = {
    name: 'testSetting',
    configid: 123,
    label: 'Test Label',
  }

  function mountComponent(props = {}, slots = {}) {
    return mount(ModConfigSetting, {
      props: { ...defaultProps, ...props },
      slots,
      global: {
        stubs: {
          'b-form-group': {
            template:
              '<div class="form-group"><label v-if="label">{{ label }}</label><slot /></div>',
            props: ['label'],
          },
          'b-form-text': {
            template: '<small class="form-text"><slot /></small>',
          },
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input class="form-input" :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'disabled'],
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
          },
          'b-form-textarea': {
            template:
              '<textarea class="form-textarea" :value="modelValue" :rows="rows" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows', 'disabled'],
          },
          'b-form-select': {
            template:
              '<select class="form-select" :value="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value); $emit(\'change\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options', 'disabled'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', handleCallback)">{{ label }}</button>',
            props: ['variant', 'iconName', 'label'],
            emits: ['handle'],
            setup(props, { emit }) {
              const handleCallback = () => {}
              return { handleCallback }
            },
          },
          OurToggle: {
            template:
              '<div class="our-toggle" :class="{ disabled }"><input type="checkbox" :checked="modelValue" :disabled="disabled" @change="handleChange($event)" /><span class="label">{{ modelValue ? labels.checked : labels.unchecked }}</span></div>',
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
            emits: ['change', 'update:modelValue'],
            setup(props, { emit }) {
              const handleChange = (event) => {
                emit('update:modelValue', event.target.checked)
                emit('change', event.target.checked)
              }
              return { handleChange }
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockModConfigStore.current = null
    mockModConfigStore.updateConfig.mockResolvedValue()
  })

  describe('rendering', () => {
    describe('input type (default)', () => {
      it('renders input type by default or when explicit, with save button when not disabled', () => {
        // Default (no type prop)
        const wrapper1 = mountComponent()
        expect(wrapper1.find('.input-group').exists()).toBe(true)
        expect(wrapper1.find('.form-input').exists()).toBe(true)
        expect(wrapper1.find('.spin-button').exists()).toBe(true)
        expect(wrapper1.find('.spin-button').text()).toBe('Save')

        // Explicit type='input'
        const wrapper2 = mountComponent({ type: 'input' })
        expect(wrapper2.find('.input-group').exists()).toBe(true)
        expect(wrapper2.find('.form-input').exists()).toBe(true)
      })
    })

    describe('textarea type', () => {
      it('renders textarea with save button, rows default to 3 or custom', () => {
        // Default rows
        const wrapper1 = mountComponent({ type: 'textarea' })
        expect(wrapper1.find('.form-textarea').exists()).toBe(true)
        expect(wrapper1.find('.form-textarea').attributes('rows')).toBe('3')
        expect(wrapper1.find('.spin-button').exists()).toBe(true)

        // Custom rows
        const wrapper2 = mountComponent({ type: 'textarea', rows: 5 })
        expect(wrapper2.find('.form-textarea').attributes('rows')).toBe('5')
      })
    })

    describe('toggle type', () => {
      it('renders toggle type', () => {
        const wrapper = mountComponent({ type: 'toggle' })
        expect(wrapper.find('.our-toggle').exists()).toBe(true)
      })

      it('renders toggle with custom labels', () => {
        const wrapper = mountComponent({
          type: 'toggle',
          toggleChecked: 'Enabled',
          toggleUnchecked: 'Disabled',
        })
        expect(wrapper.find('.our-toggle').exists()).toBe(true)
      })
    })

    describe('select type', () => {
      it('renders select type', () => {
        const wrapper = mountComponent({
          type: 'select',
          options: [
            { value: 'a', text: 'Option A' },
            { value: 'b', text: 'Option B' },
          ],
        })
        expect(wrapper.find('.form-select').exists()).toBe(true)
      })

      it('renders select with options', () => {
        const wrapper = mountComponent({
          type: 'select',
          options: [
            { value: 'a', text: 'Option A' },
            { value: 'b', text: 'Option B' },
          ],
        })
        const options = wrapper.findAll('option')
        expect(options.length).toBe(2)
        expect(options[0].text()).toBe('Option A')
        expect(options[1].text()).toBe('Option B')
      })

      it('renders disabled select when disabled prop is true', () => {
        const wrapper = mountComponent({
          type: 'select',
          options: [{ value: 'a', text: 'Option A' }],
          disabled: true,
        })
        expect(
          wrapper.find('.form-select').attributes('disabled')
        ).toBeDefined()
      })
    })

    describe('label and description', () => {
      it('renders the label', () => {
        const wrapper = mountComponent({ label: 'My Setting Label' })
        expect(wrapper.text()).toContain('My Setting Label')
      })

      it('renders description when provided', () => {
        const wrapper = mountComponent({
          description: 'This is a helpful description',
        })
        expect(wrapper.find('.form-text').exists()).toBe(true)
        expect(wrapper.text()).toContain('This is a helpful description')
      })

      it('does not render description when not provided', () => {
        const wrapper = mountComponent({ description: null })
        expect(wrapper.find('.form-text').exists()).toBe(false)
      })
    })
  })

  describe('props handling', () => {
    it('accepts all required props', () => {
      const wrapper = mountComponent({
        name: 'mySettingName',
        configid: 456,
        label: 'My Label',
      })
      expect(wrapper.props('name')).toBe('mySettingName')
      expect(wrapper.props('configid')).toBe(456)
      expect(wrapper.props('label')).toBe('My Label')
    })

    it('has correct default values for optional props', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('description')).toBe(null)
      expect(wrapper.props('type')).toBe('input')
      expect(wrapper.props('rows')).toBe(3)
      expect(wrapper.props('toggleWidth')).toBe(150)
      expect(wrapper.props('toggleChecked')).toBe(null)
      expect(wrapper.props('toggleUnchecked')).toBe(null)
      expect(wrapper.props('valueChecked')).toBe(null)
      expect(wrapper.props('valueUnchecked')).toBe(null)
      expect(wrapper.props('options')).toEqual([])
      expect(wrapper.props('disabled')).toBe(false)
      expect(wrapper.props('required')).toBe(false)
    })

    it('accepts custom toggle props', () => {
      const wrapper = mountComponent({
        type: 'toggle',
        toggleWidth: 200,
        toggleChecked: 'Yes',
        toggleUnchecked: 'No',
        valueChecked: 'TRUE',
        valueUnchecked: 'FALSE',
      })
      expect(wrapper.props('toggleWidth')).toBe(200)
      expect(wrapper.props('toggleChecked')).toBe('Yes')
      expect(wrapper.props('toggleUnchecked')).toBe('No')
      expect(wrapper.props('valueChecked')).toBe('TRUE')
      expect(wrapper.props('valueUnchecked')).toBe('FALSE')
    })
  })

  describe('computed properties', () => {
    describe('config', () => {
      it('returns current config from store', () => {
        mockModConfigStore.current = { testSetting: 'stored value' }
        const wrapper = mountComponent()
        expect(wrapper.vm.config).toEqual({ testSetting: 'stored value' })
      })

      it('returns null when store has no current config', () => {
        mockModConfigStore.current = null
        const wrapper = mountComponent()
        expect(wrapper.vm.config).toBe(null)
      })
    })

    describe('value computed property', () => {
      it('returns value from config by name', () => {
        mockModConfigStore.current = { testSetting: 'my value' }
        const wrapper = mountComponent({ name: 'testSetting' })
        expect(wrapper.vm.value).toBe('my value')
      })

      it('returns null when config is null', () => {
        mockModConfigStore.current = null
        const wrapper = mountComponent()
        expect(wrapper.vm.value).toBe(null)
      })

      it('handles toggle type with valueChecked comparison', () => {
        mockModConfigStore.current = { testSetting: 'enabled' }
        const wrapper = mountComponent({
          name: 'testSetting',
          type: 'toggle',
          valueChecked: 'enabled',
        })
        expect(wrapper.vm.value).toBe(true)
      })

      it('handles toggle type with valueChecked not matching', () => {
        mockModConfigStore.current = { testSetting: 'disabled' }
        const wrapper = mountComponent({
          name: 'testSetting',
          type: 'toggle',
          valueChecked: 'enabled',
        })
        expect(wrapper.vm.value).toBe(false)
      })

      it('handles toggle type without valueChecked', () => {
        mockModConfigStore.current = { testSetting: true }
        const wrapper = mountComponent({
          name: 'testSetting',
          type: 'toggle',
        })
        expect(wrapper.vm.value).toBe(true)
      })
    })

    describe('toggleValue computed property', () => {
      it.each([
        ['truthy', true, 'truthy string'],
        [null, false, 'null'],
        ['', false, 'empty string'],
        [0, false, 'zero'],
        [1, true, 'number 1'],
      ])('converts %s to %s (%s)', (configValue, expected) => {
        mockModConfigStore.current = { testSetting: configValue }
        const wrapper = mountComponent({ name: 'testSetting', type: 'toggle' })
        expect(wrapper.vm.toggleValue).toBe(expected)
      })
    })

    describe('setifrequired computed property', () => {
      it('returns true when required is false', () => {
        const wrapper = mountComponent({ required: false })
        expect(wrapper.vm.setifrequired).toBe(true)
      })

      it('returns true when required and forSave has content', async () => {
        const wrapper = mountComponent({ required: true })
        wrapper.vm.value = 'some content'
        await flushPromises()
        expect(wrapper.vm.setifrequired).toBe(true)
      })

      it('returns falsy when required and forSave is empty', async () => {
        const wrapper = mountComponent({ required: true })
        wrapper.vm.value = ''
        await flushPromises()
        // Empty string is falsy - the && returns empty string
        expect(wrapper.vm.setifrequired).toBeFalsy()
      })

      it('returns falsy when required and forSave is only whitespace', async () => {
        const wrapper = mountComponent({ required: true })
        wrapper.vm.value = '   '
        await flushPromises()
        // Whitespace-only string has length 0 after trim, returns false
        expect(wrapper.vm.setifrequired).toBeFalsy()
      })

      it('returns falsy when required and forSave is null', () => {
        const wrapper = mountComponent({ required: true })
        // When forSave.value is null, && short-circuits and returns null
        expect(wrapper.vm.setifrequired).toBeFalsy()
      })
    })
  })

  describe('save method', () => {
    describe('for input type', () => {
      it('calls updateConfig with correct data', async () => {
        mockModConfigStore.current = { testSetting: 'original' }
        const wrapper = mountComponent({ name: 'testSetting', configid: 123 })
        wrapper.vm.value = 'new value'
        await wrapper.vm.save()
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 123,
          testSetting: 'new value',
        })
      })

      it('uses config value when forSave is null', async () => {
        mockModConfigStore.current = { testSetting: 'config value' }
        const wrapper = mountComponent({ name: 'testSetting', configid: 123 })
        await wrapper.vm.save()
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 123,
          testSetting: 'config value',
        })
      })

      it('calls callback function when provided', async () => {
        mockModConfigStore.current = { testSetting: 'value' }
        const wrapper = mountComponent({ name: 'testSetting', configid: 123 })
        const callback = vi.fn()
        await wrapper.vm.save(callback)
        expect(callback).toHaveBeenCalled()
      })

      it('does not throw when callback is not a function', async () => {
        mockModConfigStore.current = { testSetting: 'value' }
        const wrapper = mountComponent({ name: 'testSetting', configid: 123 })
        await expect(wrapper.vm.save('not a function')).resolves.not.toThrow()
      })
    })

    describe('for textarea type', () => {
      it('calls updateConfig with textarea value', async () => {
        mockModConfigStore.current = { testSetting: 'original' }
        const wrapper = mountComponent({
          name: 'testSetting',
          configid: 456,
          type: 'textarea',
        })
        wrapper.vm.value = 'multi\nline\ntext'
        await wrapper.vm.save()
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 456,
          testSetting: 'multi\nline\ntext',
        })
      })
    })

    describe('for toggle type', () => {
      it('calls updateConfig with checked value when toggled on', async () => {
        mockModConfigStore.current = { testSetting: false }
        const wrapper = mountComponent({
          name: 'testSetting',
          configid: 789,
          type: 'toggle',
          valueChecked: 'ON',
          valueUnchecked: 'OFF',
        })
        await wrapper.vm.save(true)
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 789,
          testSetting: 'ON',
        })
      })

      it('calls updateConfig with unchecked value when toggled off', async () => {
        mockModConfigStore.current = { testSetting: true }
        const wrapper = mountComponent({
          name: 'testSetting',
          configid: 789,
          type: 'toggle',
          valueChecked: 'ON',
          valueUnchecked: 'OFF',
        })
        await wrapper.vm.save(false)
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 789,
          testSetting: 'OFF',
        })
      })

      it('uses boolean true when valueChecked not specified', async () => {
        mockModConfigStore.current = { testSetting: false }
        const wrapper = mountComponent({
          name: 'testSetting',
          configid: 789,
          type: 'toggle',
        })
        await wrapper.vm.save(true)
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 789,
          testSetting: true,
        })
      })

      it('uses boolean false when valueUnchecked not specified', async () => {
        mockModConfigStore.current = { testSetting: true }
        const wrapper = mountComponent({
          name: 'testSetting',
          configid: 789,
          type: 'toggle',
        })
        await wrapper.vm.save(false)
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 789,
          testSetting: false,
        })
      })
    })

    describe('for select type', () => {
      it('calls updateConfig with selected value', async () => {
        mockModConfigStore.current = { testSetting: 'a' }
        const wrapper = mountComponent({
          name: 'testSetting',
          configid: 111,
          type: 'select',
          options: [
            { value: 'a', text: 'Option A' },
            { value: 'b', text: 'Option B' },
          ],
        })
        wrapper.vm.value = 'b'
        await wrapper.vm.save()
        expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
          id: 111,
          testSetting: 'b',
        })
      })
    })
  })

  describe('required field validation', () => {
    it('hides save button when required and value is empty', async () => {
      const wrapper = mountComponent({ required: true })
      wrapper.vm.value = ''
      await flushPromises()
      // The save button is hidden via v-if on setifrequired (falsy value)
      expect(wrapper.vm.setifrequired).toBeFalsy()
    })

    it('shows save button when required and value has content', async () => {
      const wrapper = mountComponent({ required: true })
      wrapper.vm.value = 'valid content'
      await flushPromises()
      expect(wrapper.vm.setifrequired).toBe(true)
    })

    it('always shows save button when not required', async () => {
      const wrapper = mountComponent({ required: false })
      wrapper.vm.value = ''
      await flushPromises()
      expect(wrapper.vm.setifrequired).toBe(true)
    })
  })

  describe('disabled state', () => {
    it.each([
      ['input', '.form-input', 'attributes', null],
      ['textarea', '.form-textarea', 'attributes', null],
      ['toggle', '.our-toggle.disabled', 'exists', null],
      ['select', '.form-select', 'attributes', [{ value: 'a', text: 'A' }]],
    ])(
      '%s type is disabled and hides save button when disabled=true',
      (type, selector, checkMethod, options) => {
        const props = { type, disabled: true }
        if (options) props.options = options
        const wrapper = mountComponent(props)

        if (checkMethod === 'exists') {
          expect(wrapper.find(selector).exists()).toBe(true)
        } else {
          expect(wrapper.find(selector).attributes('disabled')).toBeDefined()
        }

        // Input and textarea have save buttons that should be hidden
        if (type === 'input' || type === 'textarea') {
          expect(wrapper.find('.spin-button').exists()).toBe(false)
        }
      }
    )
  })

  describe('slot support', () => {
    it('supports append slot for input type', () => {
      const wrapper = mountComponent(
        { type: 'input' },
        { append: '<button class="custom-button">Custom</button>' }
      )
      // Default SpinButton is replaced by custom slot content
      expect(wrapper.find('.custom-button').exists()).toBe(true)
    })
  })

  describe('user interactions', () => {
    it('triggers save when SpinButton clicked for input', async () => {
      mockModConfigStore.current = { testSetting: 'initial' }
      const wrapper = mountComponent({ name: 'testSetting', configid: 123 })
      wrapper.vm.value = 'updated'
      await wrapper.find('.spin-button').trigger('click')
      await flushPromises()
      expect(mockModConfigStore.updateConfig).toHaveBeenCalled()
    })

    it('triggers save when SpinButton clicked for textarea', async () => {
      mockModConfigStore.current = { testSetting: 'initial' }
      const wrapper = mountComponent({
        name: 'testSetting',
        configid: 123,
        type: 'textarea',
      })
      wrapper.vm.value = 'updated text'
      await wrapper.find('.spin-button').trigger('click')
      await flushPromises()
      expect(mockModConfigStore.updateConfig).toHaveBeenCalled()
    })

    it('triggers save on toggle change', async () => {
      mockModConfigStore.current = { testSetting: false }
      const wrapper = mountComponent({
        name: 'testSetting',
        configid: 123,
        type: 'toggle',
      })
      const toggle = wrapper.find('.our-toggle input[type="checkbox"]')
      await toggle.setValue(true)
      await flushPromises()
      expect(mockModConfigStore.updateConfig).toHaveBeenCalled()
    })

    it('triggers save on select change', async () => {
      mockModConfigStore.current = { testSetting: 'a' }
      const wrapper = mountComponent({
        name: 'testSetting',
        configid: 123,
        type: 'select',
        options: [
          { value: 'a', text: 'A' },
          { value: 'b', text: 'B' },
        ],
      })
      const select = wrapper.find('.form-select')
      await select.setValue('b')
      await flushPromises()
      expect(mockModConfigStore.updateConfig).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles undefined config value gracefully', () => {
      mockModConfigStore.current = {}
      const wrapper = mountComponent({ name: 'nonexistent' })
      expect(wrapper.vm.value).toBeUndefined()
    })

    it('handles empty options array for select', () => {
      const wrapper = mountComponent({ type: 'select', options: [] })
      expect(wrapper.findAll('option').length).toBe(0)
    })

    it('handles numeric configid', () => {
      const wrapper = mountComponent({ configid: 999 })
      expect(wrapper.props('configid')).toBe(999)
    })
  })
})
