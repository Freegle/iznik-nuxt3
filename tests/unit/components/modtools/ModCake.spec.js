import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockAuthStore } from '../../mocks/stores'
import ModCake from '~/modtools/components/ModCake.vue'

const mockAuthStore = createMockAuthStore()
const mockMe = ref({
  id: 1,
  settings: {
    modcake: false,
    modcakenotes: null,
  },
})

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
  }),
}))

describe('ModCake', () => {
  function mountComponent() {
    return mount(ModCake, {
      global: {
        stubs: {
          OurToggle: {
            template:
              '<div class="toggle" @click="$emit(\'update:modelValue\', !modelValue)"><slot /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          'b-form-textarea': {
            template: '<textarea v-model="modelValue" />',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\')"><slot /></button>',
            props: ['iconName', 'label', 'variant'],
            emits: ['handle'],
          },
          'external-link': {
            template: '<a><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = {
      id: 1,
      settings: {
        modcake: false,
        modcakenotes: null,
      },
    }
  })

  describe('rendering', () => {
    it('displays cake information text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('randomly select one member')
    })

    it('displays toggle for cake preference', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.toggle').exists()).toBe(true)
    })

    it('shows dietary requirements section when modcake is true', () => {
      mockMe.value.settings.modcake = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('dietary requirements')
    })

    it('hides dietary requirements section when modcake is false', () => {
      mockMe.value.settings.modcake = false
      const wrapper = mountComponent()
      expect(wrapper.find('textarea').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('gets modcake from user settings', () => {
      mockMe.value.settings.modcake = true
      const wrapper = mountComponent()
      expect(wrapper.vm.modcake).toBe(true)
    })

    it('defaults modcake to false when not in settings', () => {
      mockMe.value.settings = {}
      const wrapper = mountComponent()
      expect(wrapper.vm.modcake).toBe(false)
    })

    it('gets cakenotes from user settings', () => {
      mockMe.value.settings.modcakenotes = 'Vegan please'
      const wrapper = mountComponent()
      expect(wrapper.vm.cakenotes).toBe('Vegan please')
    })
  })

  describe('methods', () => {
    it('saveSetting calls authStore.saveAndGet', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.saveSetting('modcake', true)
      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })

    it('saveNotes saves the notes', async () => {
      const wrapper = mountComponent()
      wrapper.vm.notes = 'Gluten free'
      await wrapper.vm.saveNotes()
      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })
  })
})
