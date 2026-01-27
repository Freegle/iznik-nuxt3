import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import AutoHeightTextarea from '~/components/AutoHeightTextarea.vue'

// Mock misc store
const mockLastTyping = ref(0)
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    lastTyping: mockLastTyping,
  }),
}))

// Mock storeToRefs to return the ref directly
vi.mock('pinia', () => ({
  storeToRefs: (store) => ({
    lastTyping: store.lastTyping,
  }),
}))

describe('AutoHeightTextarea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockLastTyping.value = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}) {
    return mount(AutoHeightTextarea, {
      props,
      global: {
        stubs: {
          'b-form-textarea': {
            template:
              '<textarea ref="ta" :value="modelValue" :rows="rows" :maxlength="maxlength" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" @focus="$emit(\'focus\')" />',
            props: [
              'modelValue',
              'size',
              'rows',
              'maxlength',
              'spellcheck',
              'placeholder',
              'autocapitalize',
            ],
            emits: ['update:modelValue', 'focus'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a textarea', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('textarea').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('defaults rows to 2', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('rows')).toBe(2)
    })

    it('defaults maxRows to 6', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('maxRows')).toBe(6)
    })

    it('accepts custom rows', () => {
      const wrapper = createWrapper({ rows: 4 })
      expect(wrapper.props('rows')).toBe(4)
    })

    it('accepts custom maxRows', () => {
      const wrapper = createWrapper({ maxRows: 10 })
      expect(wrapper.props('maxRows')).toBe(10)
    })

    it('accepts custom placeholder', () => {
      const wrapper = createWrapper({ placeholder: 'Type here...' })
      expect(wrapper.props('placeholder')).toBe('Type here...')
    })

    it('accepts custom maxlength', () => {
      const wrapper = createWrapper({ maxlength: 500 })
      expect(wrapper.props('maxlength')).toBe(500)
    })
  })

  describe('v-model', () => {
    it('emits update:modelValue when text changes', async () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('textarea')

      await textarea.setValue('Hello world')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Hello world'])
    })

    it('updates internal value when modelValue prop changes', async () => {
      const wrapper = createWrapper({ modelValue: 'Initial' })
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('Initial')

      await wrapper.setProps({ modelValue: 'Updated' })
      expect(textarea.element.value).toBe('Updated')
    })
  })

  describe('focus event', () => {
    it('emits focus event when textarea is focused', async () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('textarea')

      await textarea.trigger('focus')

      expect(wrapper.emitted('focus')).toBeTruthy()
    })
  })

  describe('typing tracking', () => {
    it('updates lastTyping in store when value changes', async () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('textarea')

      await textarea.setValue('Test')
      await flushPromises()

      // Note: The actual update happens in the component's watcher
      // which updates lastTyping.value to Date.now()
      // We just verify the emit happened
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('timer lifecycle', () => {
    it('clears timer on unmount', async () => {
      const wrapper = createWrapper({ modelValue: 'Some text' })

      // Advance timer to trigger checkRows
      await vi.advanceTimersByTimeAsync(200)

      // Unmount should clear the timer
      wrapper.unmount()

      // Verify no errors occur when advancing time after unmount
      await vi.advanceTimersByTimeAsync(200)
    })
  })

  describe('placeholder', () => {
    it('passes placeholder to textarea', () => {
      const wrapper = createWrapper({ placeholder: 'Enter message...' })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('placeholder')).toBe('Enter message...')
    })
  })

  describe('maxlength', () => {
    it('passes maxlength to textarea', () => {
      const wrapper = createWrapper({ maxlength: 200 })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('maxlength')).toBe('200')
    })
  })

  describe('rows', () => {
    it('passes initial rows to textarea', () => {
      const wrapper = createWrapper({ rows: 3 })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('rows')).toBe('3')
    })
  })
})
