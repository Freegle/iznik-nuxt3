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

  const defaultStubs = {
    'b-form-group': {
      template: '<div class="form-group"><slot /></div>',
      props: ['label'],
    },
    'b-form-text': {
      template: '<div class="form-text"><slot /></div>',
    },
    'b-input-group': {
      template: '<div class="input-group"><slot /><slot name="append" /></div>',
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
  }

  const simpleStubs = {
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
  }

  function mountComponent(props = {}, groupOverrides = {}) {
    const group = { ...defaultGroup, ...groupOverrides }
    mockModGroupStore.get.mockReturnValue(group)

    return mount(ModGroupSetting, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: defaultStubs,
      },
    })
  }

  function mountWithNullGroup(props = {}) {
    mockModGroupStore.get = vi.fn().mockReturnValue(null)
    return mount(ModGroupSetting, {
      props: { ...defaultProps, ...props },
      global: { stubs: simpleStubs },
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

    it('renders description text only when provided', () => {
      const withDescription = mountComponent({
        description: 'This is a helpful description',
      })
      expect(withDescription.find('.form-text').exists()).toBe(true)
      expect(withDescription.text()).toContain('This is a helpful description')

      const withoutDescription = mountComponent({ description: null })
      expect(withoutDescription.find('.form-text').exists()).toBe(false)
    })
  })

  describe('input type rendering', () => {
    it.each([
      ['input', '.form-input', 'text'],
      ['number', '.form-input', 'number'],
      ['textarea', '.form-textarea', null],
      ['toggle', '.our-toggle', null],
      [undefined, '.form-input', 'text'], // default type
    ])(
      'renders correct element for type="%s"',
      async (type, selector, expectedInputType) => {
        const wrapper = mountComponent(type ? { type } : {})
        await wrapper.vm.$nextTick()

        expect(wrapper.find(selector).exists()).toBe(true)

        if (expectedInputType && selector === '.form-input') {
          expect(wrapper.find(selector).attributes('type')).toBe(
            expectedInputType
          )
        }
      }
    )
  })

  describe('props', () => {
    it.each([
      ['name', { name: 'testname' }, 'testname'],
      ['groupid', { groupid: 456 }, 456],
      ['label', { label: 'Test Label' }, 'Test Label'],
      ['description', { description: 'Test description' }, 'Test description'],
    ])('accepts %s prop', (propName, propsOverride, expected) => {
      const wrapper = mountComponent(propsOverride)
      expect(wrapper.props(propName)).toBe(expected)
    })

    it.each([
      ['step', 'number', {}, 1],
      ['step', 'number', { step: 0.1 }, 0.1],
      ['rows', 'textarea', {}, 3],
      ['rows', 'textarea', { rows: 10 }, 10],
    ])(
      '%s prop for %s type defaults to %s or accepts custom value',
      (propName, type, extraProps, expected) => {
        const wrapper = mountComponent({ type, ...extraProps })
        expect(wrapper.props(propName)).toBe(expected)
      }
    )
  })

  describe('computed properties', () => {
    it('gets group from store using groupid prop', () => {
      mountComponent({ groupid: 789 })
      expect(mockModGroupStore.get).toHaveBeenCalledWith(789)
    })

    it.each([
      ['Moderator', true],
      ['Owner', false],
    ])('readonly is %s when myrole is %s', (myrole, expectedReadonly) => {
      const wrapper = mountComponent({}, { myrole })
      expect(wrapper.vm.readonly).toBe(expectedReadonly)
    })

    it('readonly is true and value is null when group is null', async () => {
      const wrapper = mountWithNullGroup()
      await flushPromises()
      expect(wrapper.vm.readonly).toBe(true)
      expect(wrapper.vm.value).toBeNull()
    })
  })

  describe('getValueFromGroup', () => {
    it.each([
      ['nameshort', { nameshort: 'MyGroup' }, 'MyGroup'],
      ['settings.autoapprove', { settings: { autoapprove: 5 } }, 5],
      [
        'settings.autopost.delay',
        { settings: { autopost: { delay: 30 } } },
        30,
      ],
    ])(
      'gets value for path "%s" using dot notation',
      async (name, groupOverrides, expected) => {
        const wrapper = mountComponent({ name }, groupOverrides)
        await flushPromises()
        expect(wrapper.vm.value).toBe(expected)
      }
    )

    it.each([
      ['1', true],
      ['0', false],
      [true, true],
      [false, false],
    ])(
      'converts value %s to %s for toggle type',
      async (inputValue, expected) => {
        const wrapper = mountComponent(
          { name: 'settings.flag', type: 'toggle' },
          { settings: { flag: inputValue } }
        )
        await flushPromises()
        expect(wrapper.vm.value).toBe(expected)
      }
    )

    it('handles missing group gracefully', async () => {
      const wrapper = mountWithNullGroup()
      await flushPromises()
      expect(wrapper.vm.value).toBeNull()
    })
  })

  describe('save method', () => {
    it('does not call updateMT before mounted is true', async () => {
      const wrapper = mountComponent({ name: 'nameshort' })
      wrapper.vm.mounted = false
      await wrapper.vm.save()
      expect(mockModGroupStore.updateMT).not.toHaveBeenCalled()
    })

    it('calls updateMT with groupid and top-level property', async () => {
      const wrapper = mountComponent({ name: 'nameshort', groupid: 123 })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      await wrapper.vm.save('NewName')

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
        id: 123,
        nameshort: 'NewName',
      })
    })

    it.each([
      [true, 'boolean true'],
      [false, 'boolean false'],
    ])('handles %s value when saving toggle', async (value) => {
      const wrapper = mountComponent({
        name: 'settings.autoapprove',
        type: 'toggle',
        groupid: 123,
      })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      await wrapper.vm.save(value)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith(
        expect.objectContaining({ id: 123 })
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

    it('calls callback function if provided, otherwise uses value directly', async () => {
      const wrapper = mountComponent({ name: 'nameshort', groupid: 123 })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      // Test callback function
      const callback = vi.fn()
      await wrapper.vm.save(callback)
      expect(callback).toHaveBeenCalled()

      // Test direct value
      mockModGroupStore.updateMT.mockClear()
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

    it.each([
      ['input', 'nameshort', '.spin-button'],
      ['textarea', 'description', '.spin-button'],
      ['toggle', 'settings.autoapprove', '.our-toggle'],
    ])(
      'calls save when %s type control is activated',
      async (type, name, selector) => {
        const groupOverrides =
          type === 'toggle' ? { settings: { autoapprove: false } } : {}
        const wrapper = mountComponent({ name, type }, groupOverrides)
        await flushPromises()
        vi.runAllTimers()
        await flushPromises()

        const control = wrapper.find(selector)
        await control.trigger('click')

        expect(mockModGroupStore.updateMT).toHaveBeenCalled()
      }
    )

    it('disables controls when readonly (non-Owner role)', async () => {
      // Test save button disabled
      const inputWrapper = mountComponent(
        { name: 'nameshort', type: 'input' },
        { myrole: 'Moderator' }
      )
      await flushPromises()
      expect(
        inputWrapper.find('.spin-button').attributes('disabled')
      ).toBeDefined()

      // Test toggle disabled
      const toggleWrapper = mountComponent(
        { name: 'settings.autoapprove', type: 'toggle' },
        { myrole: 'Moderator' }
      )
      await flushPromises()
      expect(
        toggleWrapper.find('.our-toggle').attributes('data-disabled')
      ).toBe('true')
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

      mockModGroupStore.get = vi.fn().mockReturnValue(group)
      mockModGroupStore.updateMT = vi.fn().mockResolvedValue({})

      const wrapper = mount(ModGroupSetting, {
        props: {
          name: 'settings.level1.level2.level3',
          groupid: 123,
          label: 'Test Label',
          type: 'input',
        },
        global: { stubs: simpleStubs },
      })
      await flushPromises()
      vi.runAllTimers()
      await flushPromises()

      await wrapper.vm.save('newvalue')

      expect(mockModGroupStore.updateMT).toHaveBeenCalled()
      const updateCall = mockModGroupStore.updateMT.mock.calls[0][0]
      expect(updateCall.settings.level1.level2.level3).toBe('newvalue')
    })
  })

  describe('mounted lifecycle', () => {
    it('loads value from group on mount and sets mounted to true', async () => {
      const wrapper = mountComponent(
        { name: 'nameshort' },
        { nameshort: 'MountedValue' }
      )
      await flushPromises()
      expect(wrapper.vm.value).toBe('MountedValue')

      vi.runAllTimers()
      await flushPromises()
      expect(wrapper.vm.mounted).toBe(true)
    })
  })

  describe('edge cases', () => {
    it.each([
      [
        'undefined nested property',
        { name: 'settings.nonexistent.deep' },
        { settings: {} },
        null,
      ],
      ['empty string value', { name: 'nameshort' }, { nameshort: '' }, ''],
      [
        'zero as valid number',
        { name: 'settings.delay', type: 'number' },
        { settings: { delay: 0 } },
        0,
      ],
    ])(
      'handles %s gracefully',
      async (description, props, groupOverrides, expected) => {
        const wrapper = mountComponent(props, groupOverrides)
        await flushPromises()
        expect(wrapper.vm.value).toBe(expected)
      }
    )
  })
})
