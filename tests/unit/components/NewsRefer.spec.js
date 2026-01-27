import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NewsRefer from '~/components/NewsRefer.vue'

const { mockSupportOrAdmin } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockSupportOrAdmin: ref(false),
  }
})

const mockNewsfeedStore = {
  byId: vi.fn().mockReturnValue({ deleted: false }),
  delete: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: mockSupportOrAdmin,
  }),
}))

describe('NewsRefer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupportOrAdmin.value = false
    mockNewsfeedStore.byId.mockReturnValue({ deleted: false })
  })

  function createWrapper(props = {}) {
    return mount(NewsRefer, {
      props: {
        id: 123,
        type: 'ReferToOffer',
        threadhead: 100,
        ...props,
      },
      global: {
        stubs: {
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'to'],
            emits: ['click'],
          },
          ConfirmModal: {
            template:
              '<div class="confirm-modal" @click="$emit(\'confirm\')" />',
            props: ['title'],
            emits: ['confirm', 'hidden'],
          },
        },
      },
    })
  }

  describe('ReferToOffer type', () => {
    it('renders notice for ReferToOffer', () => {
      const wrapper = createWrapper({ type: 'ReferToOffer' })
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain("If you're giving away something")
    })

    it('shows Post an OFFER button', () => {
      const wrapper = createWrapper({ type: 'ReferToOffer' })
      expect(wrapper.text()).toContain('Post an OFFER')
    })

    it('explains purpose of chitchat section', () => {
      const wrapper = createWrapper({ type: 'ReferToOffer' })
      expect(wrapper.text()).toContain('just for chat and recommendations')
    })
  })

  describe('ReferToWanted type', () => {
    it('renders notice for ReferToWanted', () => {
      const wrapper = createWrapper({ type: 'ReferToWanted' })
      expect(wrapper.text()).toContain("If you're looking for an item")
    })

    it('shows Post a WANTED button', () => {
      const wrapper = createWrapper({ type: 'ReferToWanted' })
      expect(wrapper.text()).toContain('Post a WANTED')
    })
  })

  describe('ReferToTaken type', () => {
    it('renders notice for ReferToTaken', () => {
      const wrapper = createWrapper({ type: 'ReferToTaken' })
      expect(wrapper.text()).toContain('item has been taken')
    })

    it('shows Go to My Posts button', () => {
      const wrapper = createWrapper({ type: 'ReferToTaken' })
      expect(wrapper.text()).toContain('Go to My Posts')
    })

    it('mentions Mark as TAKEN', () => {
      const wrapper = createWrapper({ type: 'ReferToTaken' })
      expect(wrapper.text()).toContain('Mark as TAKEN')
    })
  })

  describe('ReferToReceived type', () => {
    it('renders notice for ReferToReceived', () => {
      const wrapper = createWrapper({ type: 'ReferToReceived' })
      expect(wrapper.text()).toContain("you've got what you were looking for")
    })

    it('mentions Mark as RECEIVED', () => {
      const wrapper = createWrapper({ type: 'ReferToReceived' })
      expect(wrapper.text()).toContain('Mark as RECEIVED')
    })
  })

  describe('deleted state', () => {
    it('applies strike class when reply is deleted', () => {
      mockNewsfeedStore.byId.mockReturnValue({ deleted: true })
      const wrapper = createWrapper()
      expect(wrapper.find('.strike').exists()).toBe(true)
    })

    it('does not apply strike class when not deleted', () => {
      mockNewsfeedStore.byId.mockReturnValue({ deleted: false })
      const wrapper = createWrapper()
      expect(wrapper.find('.strike').exists()).toBe(false)
    })
  })

  describe('admin delete functionality', () => {
    it('does not show delete button for non-admin', () => {
      mockSupportOrAdmin.value = false
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Delete this warning')
    })

    it('shows delete button for admin', () => {
      mockSupportOrAdmin.value = true
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Delete this warning')
    })

    it('hides delete button when reply is deleted', () => {
      mockSupportOrAdmin.value = true
      mockNewsfeedStore.byId.mockReturnValue({ deleted: true })
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Delete this warning')
    })

    it('shows confirm modal when delete clicked', async () => {
      mockSupportOrAdmin.value = true
      const wrapper = createWrapper()

      expect(wrapper.find('.confirm-modal').exists()).toBe(false)

      await wrapper.find('.reply__button').trigger('click')

      expect(wrapper.find('.confirm-modal').exists()).toBe(true)
    })

    it('calls store delete on confirm', async () => {
      mockSupportOrAdmin.value = true
      const wrapper = createWrapper({ id: 456, threadhead: 789 })

      await wrapper.find('.reply__button').trigger('click')
      await wrapper.find('.confirm-modal').trigger('click')
      await flushPromises()

      expect(mockNewsfeedStore.delete).toHaveBeenCalledWith(456, 789)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 999 })
      expect(wrapper.props('id')).toBe(999)
    })

    it('requires type prop', () => {
      const wrapper = createWrapper({ type: 'ReferToWanted' })
      expect(wrapper.props('type')).toBe('ReferToWanted')
    })

    it('requires threadhead prop', () => {
      const wrapper = createWrapper({ threadhead: 555 })
      expect(wrapper.props('threadhead')).toBe(555)
    })
  })
})
