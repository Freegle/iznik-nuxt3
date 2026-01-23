import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JoinWithConfirm from '~/components/JoinWithConfirm.vue'

const mockPush = vi.fn()

vi.mock('#imports', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('JoinWithConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(JoinWithConfirm, {
      props: {
        id: 1,
        name: 'Test Community',
        variant: 'primary',
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="[variant, $attrs.class, size]" @click="$emit(\'click\')"><slot /></button>',
            props: ['size', 'variant'],
            emits: ['click'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
            props: ['title', 'message'],
            emits: ['confirm', 'hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders button with community name', () => {
      const wrapper = createWrapper({ name: 'My Community' })
      expect(wrapper.text()).toContain('Join My Community')
    })

    it('renders inline-block span container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('span.d-inline-block').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('requires name prop', () => {
      const wrapper = createWrapper({ name: 'Test' })
      expect(wrapper.props('name')).toBe('Test')
    })

    it('requires variant prop', () => {
      const wrapper = createWrapper({ variant: 'success' })
      expect(wrapper.props('variant')).toBe('success')
    })

    it('defaults size to md', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('md')
    })

    it('defaults className to m-1', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('className')).toBe('m-1')
    })
  })

  describe('confirmation flow', () => {
    it('does not show confirm modal initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showConfirm).toBe(false)
    })

    it('shows confirm modal when button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showConfirm).toBe(true)
    })

    it('navigates to join page when confirmed', () => {
      const wrapper = createWrapper({ id: 123 })
      wrapper.vm.confirmed()
      expect(mockPush).toHaveBeenCalledWith('/explore/join/123')
    })
  })

  describe('modal integration', () => {
    it('passes community name to modal title', async () => {
      const wrapper = createWrapper({ name: 'Freegle Community' })
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('.confirm-modal').exists()).toBe(true)
    })
  })
})
