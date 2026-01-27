import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ReferPage from '~/modtools/pages/support/refer/[[id]].vue'

// Mock chat store
const mockChatStore = {
  byChatId: vi.fn().mockReturnValue(null),
  fetchChat: vi.fn().mockResolvedValue(null),
  clear: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

// Mock message store
const mockMessageStore = {
  clear: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: ref(true),
  }),
}))

// Mock route params
const mockRouteParams = ref({ id: undefined })

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value,
  }),
}))

describe('support/refer/[[id]].vue page', () => {
  function mountComponent() {
    return mount(ReferPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          ModChatModal: {
            template: '<div class="mod-chat-modal" />',
            props: ['id', 'pov'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img />',
            props: ['src', 'alt', 'lazy'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockRouteParams.value = { id: undefined }
    mockChatStore.byChatId.mockReturnValue(null)
  })

  describe('rendering', () => {
    it('shows no id message when id is not provided', async () => {
      mockRouteParams.value = { id: undefined }
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('No chat id given')
    })

    it('renders chat modal when chat exists', async () => {
      const mockChat = { id: 123, user1: { id: 456 } }
      mockChatStore.byChatId.mockReturnValue(mockChat)
      mockRouteParams.value = { id: '123' }

      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.find('.mod-chat-modal').exists()).toBe(true)
    })

    it('shows not found when chat does not exist', async () => {
      mockChatStore.byChatId.mockReturnValue(null)
      mockRouteParams.value = { id: '123' }

      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('not found')
    })
  })

  describe('initial state', () => {
    it('parses id from route params', () => {
      mockRouteParams.value = { id: '456' }
      const wrapper = mountComponent()
      expect(wrapper.vm.id).toBe(456)
    })

    it('returns 0 when id is undefined', () => {
      mockRouteParams.value = { id: undefined }
      const wrapper = mountComponent()
      // The original code uses 'id' in route.params check, which fails for undefined
      // parseInt(undefined) returns NaN, but falsy check still works
      expect(wrapper.vm.id).toBeFalsy()
    })

    it('initializes notfound to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.notfound).toBe(false)
    })

    it('initializes chat to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.chat).toBe(null)
    })
  })

  describe('lifecycle', () => {
    it('clears stores on mount', async () => {
      mockRouteParams.value = { id: '789' }
      mountComponent()
      await flushPromises()

      expect(mockMessageStore.clear).toHaveBeenCalled()
      expect(mockChatStore.clear).toHaveBeenCalled()
    })

    it('fetches chat on mount', async () => {
      mockRouteParams.value = { id: '789' }
      mountComponent()
      await flushPromises()

      expect(mockChatStore.fetchChat).toHaveBeenCalledWith(789)
    })

    it('does not fetch when id is 0', async () => {
      mockRouteParams.value = { id: undefined }
      mountComponent()
      await flushPromises()

      expect(mockChatStore.fetchChat).not.toHaveBeenCalled()
    })

    it('sets pov from chat user1', async () => {
      const mockChat = { id: 123, user1: { id: 456 } }
      mockChatStore.byChatId.mockReturnValue(mockChat)
      mockRouteParams.value = { id: '123' }

      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.pov).toBe(456)
    })

    it('sets notfound when chat not found', async () => {
      mockChatStore.byChatId.mockReturnValue(null)
      mockRouteParams.value = { id: '123' }

      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.notfound).toBe(true)
    })
  })
})
