import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockAuthStore } from '../../mocks/stores'
import ModBouncing from '~/modtools/components/ModBouncing.vue'

const mockAuthStore = createMockAuthStore()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: ref(false),
  }),
}))

describe('ModBouncing', () => {
  const defaultUser = {
    id: 123,
    email: 'test@example.com',
    role: 'Member',
  }

  function mountComponent(props = {}) {
    return mount(ModBouncing, {
      props: { user: defaultUser, ...props },
      global: {
        stubs: {
          NoticeMessage: {
            template: '<div class="notice" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays bouncing notice when not unbounced', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('is bouncing')
    })

    it('displays user email', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('shows Reactivate button for Members', () => {
      const wrapper = mountComponent({
        user: { ...defaultUser, role: 'Member' },
      })
      expect(wrapper.text()).toContain('Reactivate')
    })

    it('shows warning notice when unbounced', async () => {
      const wrapper = mountComponent()
      wrapper.vm.unbounced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain("We'll try sending them mail again")
    })
  })

  describe('unbounce method', () => {
    it('calls authStore.unbounceMT with user id', async () => {
      const wrapper = mountComponent({ user: { ...defaultUser, id: 456 } })
      await wrapper.vm.unbounce()
      expect(mockAuthStore.unbounceMT).toHaveBeenCalledWith(456)
    })

    it('sets unbouncing to true then false', async () => {
      const wrapper = mountComponent()
      const promise = wrapper.vm.unbounce()
      expect(wrapper.vm.unbouncing).toBe(true)
      await promise
      expect(wrapper.vm.unbouncing).toBe(false)
    })

    it('sets unbounced to true after completion', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.unbounced).toBe(false)
      await wrapper.vm.unbounce()
      expect(wrapper.vm.unbounced).toBe(true)
    })
  })

  describe('role-based behavior', () => {
    it('shows cannot unbounce message for non-Member roles when not support', () => {
      const wrapper = mountComponent({
        user: { ...defaultUser, role: 'Owner' },
      })
      expect(wrapper.text()).toContain("You can't unbounce")
    })
  })
})
