import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DeliveryAskModal from '~/components/DeliveryAskModal.vue'

const mockPatch = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    patch: mockPatch,
  }),
}))

const mockHide = vi.fn()

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('DeliveryAskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPatch.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(DeliveryAskModal, {
      props: {
        ids: [1, 2],
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `<div class="b-modal">
              <slot name="title"></slot>
              <slot name="default"></slot>
              <slot name="footer"></slot>
            </div>`,
            props: ['scrollable', 'noStacking'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('shows title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Could you deliver?')
    })

    it('shows explanation text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'Usually, the freegler who receives something will collect it'
      )
    })

    it('shows plural "items" when multiple ids', () => {
      const wrapper = createWrapper({ ids: [1, 2] })
      expect(wrapper.text()).toContain('your items')
    })

    it('shows plural "items" when any items present', () => {
      // Component shows "items" whenever ids.length is truthy (1 or more)
      const wrapper = createWrapper({ ids: [1] })
      expect(wrapper.text()).toContain('your items')
    })

    it('shows Maybe button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Maybe')
    })

    it('shows Collection only button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Collection only')
    })
  })

  describe('maybe action', () => {
    it('patches all messages with deliverypossible true', async () => {
      const wrapper = createWrapper({ ids: [1, 2, 3] })
      const maybeButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Maybe'))

      await maybeButton.trigger('click')
      await vi.waitFor(() => expect(mockPatch).toHaveBeenCalled())

      // Verify patch was called with each id
      const calls = mockPatch.mock.calls
      const idsPatched = calls.map((call) => call[0].id)
      expect(idsPatched).toContain(1)
      expect(idsPatched).toContain(2)
      expect(idsPatched).toContain(3)
      calls.forEach((call) => {
        expect(call[0].deliverypossible).toBe(true)
      })
    })

    it('emits hide event on maybe', async () => {
      const wrapper = createWrapper()
      const maybeButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Maybe'))

      await maybeButton.trigger('click')
      await vi.waitFor(() => expect(wrapper.emitted('hide')).toBeTruthy())
    })

    it('calls modal hide on maybe', async () => {
      const wrapper = createWrapper()
      const maybeButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Maybe'))

      await maybeButton.trigger('click')
      await vi.waitFor(() => expect(mockHide).toHaveBeenCalled())
    })
  })

  describe('no action', () => {
    it('emits hide event on no', async () => {
      const wrapper = createWrapper()
      const noButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Collection only'))

      await noButton.trigger('click')
      expect(wrapper.emitted('hide')).toBeTruthy()
    })

    it('calls modal hide on no', async () => {
      const wrapper = createWrapper()
      const noButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Collection only'))

      await noButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })

    it('does not patch messages on no', async () => {
      const wrapper = createWrapper()
      const noButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Collection only'))

      await noButton.trigger('click')
      expect(mockPatch).not.toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('requires ids prop', () => {
      const wrapper = createWrapper({ ids: [5, 10, 15] })
      expect(wrapper.props('ids')).toEqual([5, 10, 15])
    })
  })
})
