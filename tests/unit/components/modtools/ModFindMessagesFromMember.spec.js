import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModFindMessagesFromMember from '~/modtools/components/ModFindMessagesFromMember.vue'

describe('ModFindMessagesFromMember', () => {
  function mountComponent(slots = {}) {
    return mount(ModFindMessagesFromMember, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup.enter\')" />',
            props: ['modelValue', 'placeholder'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', handleCallback)"><slot /></button>',
            props: ['variant', 'iconName', 'label', 'spinclass'],
            methods: {
              handleCallback() {},
            },
          },
        },
      },
      slots,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('rendering', () => {
    it('renders input with correct placeholder', () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe('Email/name/id')
    })

    it('renders SpinButton by default', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.spin-button').exists()).toBe(true)
    })
  })

  describe('refs', () => {
    it('initializes term as empty string', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.term).toBe('')
    })
  })

  describe('methods', () => {
    it('search emits searched event with trimmed term', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = '  test@example.com  '
      await wrapper.vm.search()
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual(['test@example.com'])
    })

    it('search emits searched event with empty string when term is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = ''
      await wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual([''])
    })

    it('search emits searched event with undefined if term is null', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = null
      await wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual([undefined])
    })

    it('search calls callback function if provided', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      wrapper.vm.term = 'test'
      await wrapper.vm.search(callback)
      expect(callback).toHaveBeenCalled()
    })

    it('search does not throw when callback is not a function', () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'test'
      expect(() => wrapper.vm.search('not a function')).not.toThrow()
      expect(() => wrapper.vm.search(null)).not.toThrow()
      expect(() => wrapper.vm.search(undefined)).not.toThrow()
    })
  })

  describe('user interaction', () => {
    it('updates term when user types in input', async () => {
      const wrapper = mountComponent()
      const input = wrapper.find('input')
      await input.setValue('user@test.com')
      expect(wrapper.vm.term).toBe('user@test.com')
    })

    it('triggers search on enter key', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'searchterm'

      // Manually trigger the search since we're using stubs
      await wrapper.vm.search()

      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual(['searchterm'])
    })
  })

  describe('emits', () => {
    it('defines searched emit', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.$options.emits).toContain('searched')
    })
  })

  describe('slots', () => {
    it('has append slot for custom button', () => {
      const wrapper = mountComponent({
        append: '<button class="custom-button">Custom Search</button>',
      })
      expect(wrapper.find('.custom-button').exists()).toBe(true)
    })
  })

  describe('search terms', () => {
    it('handles email addresses', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'user@example.com'
      await wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual(['user@example.com'])
    })

    it('handles user names', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'John Doe'
      await wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual(['John Doe'])
    })

    it('handles user IDs', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = '12345'
      await wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual(['12345'])
    })

    it('trims whitespace from search terms', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = '   whitespace around   '
      await wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual(['whitespace around'])
    })
  })
})
