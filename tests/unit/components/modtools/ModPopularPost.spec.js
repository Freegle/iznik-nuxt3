import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModPopularPost from '~/modtools/components/ModPopularPost.vue'

// Mock stores
const mockByIdMessage = vi.fn()
const mockFetchMessage = vi.fn()
const mockGetGroup = vi.fn()
const mockFetchGroup = vi.fn()
const mockSharePopularPost = vi.fn()
const mockHidePopularPost = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockByIdMessage,
    fetch: mockFetchMessage,
  }),
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => ({
    get: mockGetGroup,
    fetch: mockFetchGroup,
  }),
}))

vi.mock('@/stores/publicity', () => ({
  usePublicityStore: () => ({
    sharePopularPost: mockSharePopularPost,
    hidePopularPost: mockHidePopularPost,
  }),
}))

// Mock timeago
vi.mock('~/composables/useDateFormat', () => ({
  useDateFormat: () => ({
    timeago: vi.fn((date) => `timeago: ${date}`),
  }),
}))

describe('ModPopularPost', () => {
  const defaultProps = {
    item: {
      msgid: 123,
      groupid: 456,
      date: '2024-01-15',
    },
  }

  const mockMessage = {
    id: 123,
    subject: 'Test Message Subject',
  }

  const mockGroup = {
    id: 456,
    namedisplay: 'Test Group',
  }

  function mountComponent(props = {}) {
    return mount(ModPopularPost, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-card-footer': {
            template: '<div class="card-footer"><slot /></div>',
          },
          SpinButton: {
            template: '<button @click="$emit(\'handle\')"><slot /></button>',
            props: ['variant', 'iconName', 'label'],
          },
          ModMessageSummary: {
            template: '<div class="message-summary" />',
            props: ['id', 'replyable', 'message'],
          },
        },
        mocks: {
          timeago: (date) => `timeago: ${date}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockByIdMessage.mockReturnValue(mockMessage)
    mockGetGroup.mockReturnValue(mockGroup)
    mockFetchMessage.mockResolvedValue()
    mockFetchGroup.mockResolvedValue()
    mockSharePopularPost.mockResolvedValue()
    mockHidePopularPost.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders when show is true and message and group exist', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('does not render when show is false', async () => {
      const wrapper = mountComponent()
      wrapper.vm.show = false
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.card').exists()).toBe(false)
    })

    it('does not render when message is null', () => {
      mockByIdMessage.mockReturnValue(null)
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(false)
    })

    it('does not render when group is null', () => {
      mockGetGroup.mockReturnValue(null)
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(false)
    })

    it('renders group name', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group')
    })

    it('renders message subject', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Message Subject')
    })

    it('renders Share button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Share')
    })

    it('renders Hide button', () => {
      const wrapper = mountComponent()
      // Button label is "Hide for [group name]" - check for presence of buttons
      expect(wrapper.findAll('button')).toHaveLength(2)
    })
  })

  describe('computed', () => {
    it('message returns messageStore.byId result', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.message).toEqual(mockMessage)
      expect(mockByIdMessage).toHaveBeenCalledWith(123)
    })

    it('group returns groupStore.get result', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.group).toEqual(mockGroup)
      expect(mockGetGroup).toHaveBeenCalledWith(456)
    })
  })

  describe('mounted', () => {
    it('fetches message on mount', () => {
      mountComponent()
      expect(mockFetchMessage).toHaveBeenCalledWith(123)
    })

    it('fetches group on mount', () => {
      mountComponent()
      expect(mockFetchGroup).toHaveBeenCalledWith(456)
    })
  })

  describe('methods', () => {
    it('share calls publicityStore.sharePopularPost', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.share()
      expect(mockSharePopularPost).toHaveBeenCalledWith({
        groupid: 456,
        msgid: 123,
      })
    })

    it('share sets show to false', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBe(true)
      await wrapper.vm.share()
      expect(wrapper.vm.show).toBe(false)
    })

    it('hide calls publicityStore.hidePopularPost', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.hide()
      expect(mockHidePopularPost).toHaveBeenCalledWith({
        groupid: 456,
        msgid: 123,
      })
    })

    it('hide sets show to false', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBe(true)
      await wrapper.vm.hide()
      expect(wrapper.vm.show).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts item prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('item').msgid).toBe(123)
    })
  })
})
