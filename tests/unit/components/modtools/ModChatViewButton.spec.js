import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModChatViewButton from '~/modtools/components/ModChatViewButton.vue'

describe('ModChatViewButton', () => {
  const defaultProps = {
    id: 123,
    pov: 456,
  }

  function mountComponent(props = {}) {
    return mount(ModChatViewButton, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon'],
          },
          NoticeMessage: {
            template: '<div class="notice"><slot /></div>',
            props: ['variant'],
          },
          ModChatModal: {
            template: '<div class="chat-modal" />',
            props: ['id', 'pov'],
            methods: {
              show: vi.fn(),
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('displays View Chat text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('View Chat')
    })

    it('does not show modal initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showModal).toBe(false)
    })

    it('shows warning when no id and showModal is true', async () => {
      const wrapper = mountComponent({ id: 0 })
      wrapper.vm.showModal = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('This chat is no longer available')
    })
  })

  describe('methods', () => {
    it('view sets showModal to true', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showModal).toBe(false)
      wrapper.vm.view()
      expect(wrapper.vm.showModal).toBe(true)
    })
  })

  describe('props', () => {
    it('has default value for pov', () => {
      const wrapper = mount(ModChatViewButton, {
        props: { id: 123 },
        global: {
          stubs: {
            'b-button': { template: '<button><slot /></button>' },
            'v-icon': { template: '<span />' },
            NoticeMessage: { template: '<div />' },
            ModChatModal: { template: '<div />' },
          },
        },
      })
      expect(wrapper.props('pov')).toBe(null)
    })
  })
})
