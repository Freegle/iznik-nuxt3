import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { modalBootstrapStubs } from '../mocks/bootstrap-stubs'
import ChatBlockModal from '~/components/ChatBlockModal.vue'

const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('ChatBlockModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ChatBlockModal, {
      props: {
        id: 1,
        user: { displayname: 'Test User' },
        ...props,
      },
      global: { stubs: modalBootstrapStubs },
    })
  }

  describe('rendering', () => {
    it('renders modal with user-specific title and warning content', () => {
      const wrapper = createWrapper({ user: { displayname: 'John Doe' } })
      expect(wrapper.find('.modal-title').text()).toContain('Block John Doe')
      expect(wrapper.text()).toContain("won't ever get any more chat messages")
      expect(wrapper.text()).toContain('Are you sure?')
    })

    it.each([['Cancel'], ['Confirm']])('shows %s button', (buttonText) => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(buttonText)
    })
  })

  describe('actions', () => {
    it('calls hide when Cancel is clicked', async () => {
      const wrapper = createWrapper()
      const cancelBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Cancel'))
      await cancelBtn.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })

    it('emits confirm and calls hide when Confirm is clicked', async () => {
      const wrapper = createWrapper()
      const confirmBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Confirm'))
      await confirmBtn.trigger('click')
      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
