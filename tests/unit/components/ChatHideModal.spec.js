import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { modalBootstrapStubs } from '../mocks/bootstrap-stubs'
import ChatHideModal from '~/components/ChatHideModal.vue'

const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('ChatHideModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ChatHideModal, {
      props,
      global: { stubs: modalBootstrapStubs },
    })
  }

  describe('rendering', () => {
    it.each([
      [undefined, 'Hide chat'],
      [{ displayname: 'John Doe' }, 'Hide chat with John Doe'],
    ])('shows correct title for user=%j', (user, expectedTitle) => {
      const wrapper = createWrapper({ user })
      expect(wrapper.find('.modal-title').text()).toBe(expectedTitle)
    })

    it('asks for confirmation and shows action buttons', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Are you sure?')
      expect(wrapper.text()).toContain('Cancel')
      expect(wrapper.text()).toContain('Confirm')
    })
  })

  describe('message content', () => {
    it.each([
      [1, "won't show in your list until", 'single chat message'],
      [null, 'all these chats will be removed', 'multiple chats message'],
    ])('shows appropriate message when id=%s', (id, expectedText) => {
      const wrapper = createWrapper({ id })
      expect(wrapper.text()).toContain(expectedText)
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
