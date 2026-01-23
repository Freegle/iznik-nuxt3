import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import UserRatingsRemoveModal from '~/components/UserRatingsRemoveModal.vue'

// Use vi.hoisted for mock setup
const { mockRate, mockById, mockHide } = vi.hoisted(() => ({
  mockRate: vi.fn(),
  mockById: vi.fn(),
  mockHide: vi.fn(),
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    rate: mockRate,
    byId: mockById,
  }),
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('UserRatingsRemoveModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockById.mockReturnValue(null)
    mockRate.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(UserRatingsRemoveModal, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="b-modal">
                <div class="modal-title">{{ title }}</div>
                <slot />
                <button class="ok-btn" @click="$emit('ok')">{{ okTitle }}</button>
              </div>
            `,
            props: ['title', 'okTitle', 'scrollable'],
            emits: ['ok'],
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

    it('has title "Removing a rating"', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Removing a rating')
    })

    it('shows explanation text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("You've already given this freegler")
    })

    it('shows one rating message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('can only rate each freegler once')
    })

    it('shows remove option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('remove your rating')
    })

    it('has ok button with "Remove rating" text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.ok-btn').text()).toBe('Remove rating')
    })
  })

  describe('when user has thumbs up rating', () => {
    beforeEach(() => {
      mockById.mockReturnValue({
        info: {
          ratings: {
            Mine: 'Up',
          },
        },
      })
    })

    it('shows thumbs up text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('thumbs up')
    })

    it('does not show thumbs down text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('thumbs down')
    })
  })

  describe('when user has thumbs down rating', () => {
    beforeEach(() => {
      mockById.mockReturnValue({
        info: {
          ratings: {
            Mine: 'Down',
          },
        },
      })
    })

    it('shows thumbs down text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('thumbs down')
    })

    it('does not show thumbs up text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('thumbs up')
    })
  })

  describe('removeRating', () => {
    it('emits rated event with None', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.ok-btn').trigger('click')
      expect(wrapper.emitted('rated')).toBeTruthy()
      expect(wrapper.emitted('rated')[0]).toEqual(['None'])
    })

    it('calls rate with null', async () => {
      const wrapper = createWrapper({ id: 42 })
      await wrapper.find('.ok-btn').trigger('click')
      // The internal rate function passes (id, rating, reason, text)
      expect(mockRate).toHaveBeenCalledWith(42, null, undefined, undefined)
    })

    it('calls hide after removing rating', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.ok-btn').trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 123 })
      expect(wrapper.props('id')).toBe(123)
    })
  })
})
