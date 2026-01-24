import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageActions from '~/components/MessageActions.vue'

const mockById = vi.fn()
const mockLoggedIn = vi.fn()
const mockPush = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockById,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    loggedIn: mockLoggedIn(),
  }),
}))

vi.mock('#imports', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('MessageActions', () => {
  const mockMessage = {
    id: 123,
    url: 'https://freegle.example/message/123',
    groups: [{ id: 1 }],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockById.mockReturnValue(mockMessage)
    mockLoggedIn.mockReturnValue(true)
  })

  function createWrapper(props = {}) {
    return mount(MessageActions, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          'b-button': {
            template:
              '<button :class="[variant, size]" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'to', 'title'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
          'v-b-tooltip': true,
          MessageShareModal: {
            template: '<div class="share-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
          MessageReportModal: {
            template: '<div class="report-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
        directives: {
          'b-tooltip': () => {},
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-flex').exists()).toBe(true)
    })

    it('shows share button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Share')
    })

    it('shows message id', () => {
      mockById.mockReturnValue({ ...mockMessage, id: 456 })
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.text()).toContain('456')
    })
  })

  describe('report button', () => {
    it('shows report button when logged in and message has groups', () => {
      mockLoggedIn.mockReturnValue(true)
      mockById.mockReturnValue({ ...mockMessage, groups: [{ id: 1 }] })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Report this post')
    })

    it('hides report button when not logged in', () => {
      mockLoggedIn.mockReturnValue(false)
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Report this post')
    })

    it('hides report button when message has no groups', () => {
      mockLoggedIn.mockReturnValue(true)
      mockById.mockReturnValue({ ...mockMessage, groups: [] })
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Report this post')
    })
  })

  describe('share modal', () => {
    it('opens share modal when share clicked', async () => {
      const wrapper = createWrapper()
      const shareButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Share'))
      await shareButton.trigger('click')
      expect(wrapper.find('.share-modal').exists()).toBe(true)
    })

    it('does not show share modal initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.share-modal').exists()).toBe(false)
    })
  })

  describe('report modal', () => {
    it('opens report modal when report clicked', async () => {
      mockLoggedIn.mockReturnValue(true)
      mockById.mockReturnValue({ ...mockMessage, groups: [{ id: 1 }] })
      const wrapper = createWrapper()
      const reportButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Report'))
      await reportButton.trigger('click')
      expect(wrapper.find('.report-modal').exists()).toBe(true)
    })
  })

  describe('navigation', () => {
    it('shows message id in text', () => {
      mockById.mockReturnValue({ ...mockMessage, id: 789 })
      const wrapper = createWrapper({ id: 789 })
      expect(wrapper.text()).toContain('789')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 999 })
      expect(wrapper.props('id')).toBe(999)
    })
  })
})
