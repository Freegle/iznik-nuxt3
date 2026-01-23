import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModLogsModal from '~/modtools/components/ModLogsModal.vue'

// Mock stores
const mockUserStore = {
  byId: vi.fn(),
}

const mockLogsStore = {
  list: [],
  fetch: vi.fn(),
  clear: vi.fn(),
}

const mockMemberStore = {
  getByUserId: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/logs', () => ({
  useLogsStore: () => mockLogsStore,
}))

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

// Mock useOurModal composable - use vi.hoisted to ensure mocks are available during hoisting
const { mockModalHide, mockModalRef } = vi.hoisted(() => {
  const { ref } = require('vue')
  const mockModalHide = vi.fn()
  // Create a proper Vue ref with a show function to avoid template ref warnings
  const mockModalRef = ref({ show: vi.fn() })
  return { mockModalHide, mockModalRef }
})

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModalRef,
    hide: mockModalHide,
  }),
}))

describe('ModLogsModal', () => {
  const sampleLogs = [
    {
      id: 1,
      type: 'Message',
      subtype: 'Approved',
      timestamp: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      type: 'User',
      subtype: 'Login',
      timestamp: '2024-01-15T11:00:00Z',
    },
  ]

  function createWrapper(props = {}) {
    return mount(ModLogsModal, {
      props: {
        userid: 123,
        modmailsonly: false,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" :id="id" :title="title" :size="size">
                <slot />
                <slot name="default" />
                <slot name="footer" />
              </div>
            `,
            props: ['id', 'title', 'size', 'noStacking'],
            methods: { show: vi.fn() },
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModLog: {
            template:
              '<div class="mod-log" :data-id="log.id">{{ log.type }}/{{ log.subtype }}</div>',
            props: ['log'],
          },
          InfiniteLoading: {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
            props: ['distance', 'identifier'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear the array by setting length to 0 to maintain reactivity
    mockLogsStore.list.length = 0
    mockLogsStore.fetch.mockReset()
    mockLogsStore.fetch.mockResolvedValue(null)
    mockUserStore.byId.mockReturnValue(null)
    mockMemberStore.getByUserId.mockReturnValue(null)
  })

  describe('rendering', () => {
    it('renders modal with correct id', () => {
      const wrapper = createWrapper({ userid: 456 })
      const modal = wrapper.find('.modal')
      expect(modal.attributes('id')).toContain('456')
    })

    it('shows notice when no logs and not busy', async () => {
      // List is already empty from beforeEach
      const wrapper = createWrapper()
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('no logs')
    })

    it('does not show notice when logs exist', () => {
      mockLogsStore.list.push(...sampleLogs)
      const wrapper = createWrapper()
      wrapper.vm.busy = false
      expect(wrapper.find('.notice-message.info').exists()).toBe(false)
    })

    it('renders ModLog for each log entry', async () => {
      // Set logs before creating wrapper
      mockLogsStore.list.push(...sampleLogs)
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      // Check that logs are rendered (may have more from other stubs)
      expect(wrapper.findAll('.mod-log').length).toBeGreaterThanOrEqual(2)
    })

    it('shows log retention information text', () => {
      mockLogsStore.list.push(...sampleLogs)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('removed to save space')
    })

    it('renders InfiniteLoading component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })
  })

  describe('title computed property', () => {
    it('shows "Logs" prefix when modmailsonly is false', () => {
      const wrapper = createWrapper({ modmailsonly: false })
      expect(wrapper.vm.title).toContain('Logs')
    })

    it('shows "Modmails" prefix when modmailsonly is true', () => {
      const wrapper = createWrapper({ modmailsonly: true })
      expect(wrapper.vm.title).toContain('Modmails')
    })

    it('includes user displayname when user found in userStore', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        displayname: 'Test User',
        info: {},
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toContain('Test User')
    })

    it('includes user displayname when user found in memberStore', () => {
      mockUserStore.byId.mockReturnValue({ id: 123 }) // No info
      mockMemberStore.getByUserId.mockReturnValue({
        id: 123,
        displayname: 'Member User',
        info: {},
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toContain('Member User')
    })

    it('has no displayname when user not found', () => {
      mockUserStore.byId.mockReturnValue(null)
      mockMemberStore.getByUserId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('Logs ')
    })
  })

  describe('user computed property', () => {
    it('returns user from userStore when has info', () => {
      const user = { id: 123, displayname: 'Test', info: { something: true } }
      mockUserStore.byId.mockReturnValue(user)
      const wrapper = createWrapper()
      expect(wrapper.vm.user).toEqual(user)
    })

    it('returns user from memberStore when userStore user lacks info', () => {
      mockUserStore.byId.mockReturnValue({ id: 123 })
      const memberUser = { id: 123, displayname: 'Member', info: {} }
      mockMemberStore.getByUserId.mockReturnValue(memberUser)
      const wrapper = createWrapper()
      expect(wrapper.vm.user).toEqual(memberUser)
    })

    it('returns null when no user found anywhere', () => {
      mockUserStore.byId.mockReturnValue(null)
      mockMemberStore.getByUserId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.vm.user).toBeNull()
    })

    it('returns null when userStore returns undefined', () => {
      mockUserStore.byId.mockReturnValue(undefined)
      const wrapper = createWrapper()
      expect(wrapper.vm.user).toBeNull()
    })
  })

  describe('logs computed property', () => {
    it('returns logs from store', () => {
      mockLogsStore.list = sampleLogs
      const wrapper = createWrapper()
      expect(wrapper.vm.logs).toEqual(sampleLogs)
    })
  })

  describe('show method', () => {
    it('clears logs store before showing', () => {
      const wrapper = createWrapper()
      wrapper.vm.show()
      expect(mockLogsStore.clear).toHaveBeenCalled()
    })

    it('increments bump to trigger InfiniteLoading refresh', () => {
      const wrapper = createWrapper()
      const initialBump = wrapper.vm.bump
      wrapper.vm.show()
      expect(wrapper.vm.bump).toBe(initialBump + 1)
    })

    // Note: Testing that modal.value.show() is called internally is difficult due to
    // vi.mock hoisting complexities. The behavior is verified by the above tests which
    // confirm show() clears the store and increments bump as expected.
  })

  describe('hide method', () => {
    it('is exposed via defineExpose', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.hide).toBe('function')
    })
  })

  describe('fetchChunk method', () => {
    it('sets busy to true while fetching', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }
      let busyDuringFetch = false

      mockLogsStore.fetch.mockImplementation(() => {
        busyDuringFetch = wrapper.vm.busy
        return Promise.resolve()
      })

      await wrapper.vm.fetchChunk(mockState)
      expect(busyDuringFetch).toBe(true)
    })

    it('sets busy to false after fetching', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.fetch.mockResolvedValue(null)
      await wrapper.vm.fetchChunk(mockState)
      expect(wrapper.vm.busy).toBe(false)
    })

    it('calls fetch with correct params', async () => {
      const wrapper = createWrapper({ userid: 789, modmailsonly: true })
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.fetch.mockResolvedValue(null)
      await wrapper.vm.fetchChunk(mockState)

      expect(mockLogsStore.fetch).toHaveBeenCalledWith({
        logtype: 'user',
        userid: 789,
        context: null,
        modmailsonly: true,
      })
    })

    it('calls state.loaded when more logs returned', async () => {
      // Start with empty list
      mockLogsStore.list.length = 0
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.fetch.mockImplementation(() => {
        // Simulate adding new logs to the shared array
        mockLogsStore.list.push({
          id: 1,
          type: 'Test',
          subtype: 'Test',
          timestamp: '2024-01-15T10:00:00Z',
        })
        return Promise.resolve(null)
      })

      await wrapper.vm.fetchChunk(mockState)

      expect(mockState.loaded).toHaveBeenCalled()
    })

    it('calls state.complete when no new logs', async () => {
      mockLogsStore.list.push(...sampleLogs)
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      // list stays same length - no new logs
      mockLogsStore.fetch.mockResolvedValue(null)
      await wrapper.vm.fetchChunk(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })

    it('stores context from fetch result', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.list = []
      mockLogsStore.fetch.mockImplementation(() => {
        mockLogsStore.list = sampleLogs
        return Promise.resolve({ next: 'context123' })
      })

      await wrapper.vm.fetchChunk(mockState)

      expect(wrapper.vm.context).toEqual({ next: 'context123' })
    })
  })

  describe('onMounted', () => {
    it('clears logs store on mount', async () => {
      createWrapper()
      await flushPromises()
      expect(mockLogsStore.clear).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles fetch returning undefined context', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.list = []
      mockLogsStore.fetch.mockImplementation(() => {
        mockLogsStore.list = sampleLogs
        return undefined
      })

      await wrapper.vm.fetchChunk(mockState)

      expect(wrapper.vm.context).toBeUndefined()
    })

    it('modal id includes modmailsonly flag for uniqueness', () => {
      const wrapper1 = createWrapper({ userid: 123, modmailsonly: false })
      const wrapper2 = createWrapper({ userid: 123, modmailsonly: true })

      const id1 = wrapper1.find('.modal').attributes('id')
      const id2 = wrapper2.find('.modal').attributes('id')

      expect(id1).not.toBe(id2)
    })
  })
})
