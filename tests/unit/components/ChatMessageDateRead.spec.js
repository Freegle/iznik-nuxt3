import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessageDateRead from '~/components/ChatMessageDateRead.vue'

const {
  mockMe,
  mockMod,
  mockChat,
  mockOtheruser,
  mockChatmessage,
  mockMessageIsFromCurrentUser,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMe: ref({ id: 1 }),
    mockMod: ref(false),
    mockChat: ref({ chattype: 'User2User' }),
    mockOtheruser: ref({ settings: { notifications: { email: true } } }),
    mockChatmessage: ref({
      id: 100,
      date: '2024-01-15T10:30:00Z',
      userid: 2,
      sameasnext: false,
      seenbyall: false,
      mailedtoall: false,
    }),
    mockMessageIsFromCurrentUser: ref(false),
  }
})

const mockUserStore = {
  fetch: vi.fn(),
  byId: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    mod: mockMod,
  }),
}))

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    chat: mockChat,
    otheruser: mockOtheruser,
    chatmessage: mockChatmessage,
    messageIsFromCurrentUser: mockMessageIsFromCurrentUser,
  }),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  datetimeshort: vi.fn((date) => `Short: ${date}`),
  timeadaptChat: vi.fn((date) => 'Just now'),
}))

describe('ChatMessageDateRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = { id: 1 }
    mockMod.value = false
    mockChat.value = { chattype: 'User2User' }
    mockOtheruser.value = { settings: { notifications: { email: true } } }
    mockChatmessage.value = {
      id: 100,
      date: '2024-01-15T10:30:00Z',
      userid: 2,
      sameasnext: false,
      seenbyall: false,
      mailedtoall: false,
    }
    mockMessageIsFromCurrentUser.value = false
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageDateRead, {
      props: {
        chatid: 1,
        id: 100,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template:
              '<span class="v-icon" :class="[icon]" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-badge': {
            template: '<span class="b-badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('visibility conditions', () => {
    it('shows when sameasnext is false', () => {
      mockChatmessage.value.sameasnext = false
      const wrapper = createWrapper()
      expect(wrapper.find('.text-muted').exists()).toBe(true)
    })

    it('shows when last is true', () => {
      mockChatmessage.value.sameasnext = true
      const wrapper = createWrapper({ last: true })
      expect(wrapper.find('.text-muted').exists()).toBe(true)
    })

    it('shows when bymailid exists', () => {
      mockChatmessage.value.sameasnext = true
      mockChatmessage.value.bymailid = 123
      const wrapper = createWrapper()
      expect(wrapper.find('.text-muted').exists()).toBe(true)
    })

    it('shows when gap is true', () => {
      mockChatmessage.value.sameasnext = true
      mockChatmessage.value.gap = true
      const wrapper = createWrapper()
      expect(wrapper.find('.text-muted').exists()).toBe(true)
    })

    it('hides when sameasnext is true and no other conditions', () => {
      mockChatmessage.value.sameasnext = true
      mockChatmessage.value.bymailid = null
      mockChatmessage.value.gap = false
      const wrapper = createWrapper({ last: false })
      expect(wrapper.find('.text-muted').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('requires chatid prop', () => {
      const wrapper = createWrapper({ chatid: 5 })
      expect(wrapper.props('chatid')).toBe(5)
    })

    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 200 })
      expect(wrapper.props('id')).toBe(200)
    })

    it('has default pov of null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('pov')).toBe(null)
    })

    it('accepts pov prop', () => {
      const wrapper = createWrapper({ pov: 3 })
      expect(wrapper.props('pov')).toBe(3)
    })

    it('has default last of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('last')).toBe(false)
    })

    it('accepts last prop', () => {
      const wrapper = createWrapper({ last: true })
      expect(wrapper.props('last')).toBe(true)
    })
  })

  describe('their messages (not from current user)', () => {
    beforeEach(() => {
      mockMessageIsFromCurrentUser.value = false
    })

    it('shows chat__dateread--theirs class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat__dateread--theirs').exists()).toBe(true)
    })

    it('displays time', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat__dateread--theirs').text()).toBe('Just now')
    })

    it('shows RSVP badge when replyexpected and not replyreceived', () => {
      mockChatmessage.value.replyexpected = true
      mockChatmessage.value.replyreceived = false
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').text()).toBe('RSVP - reply expected')
    })

    it('hides RSVP badge when replyreceived', () => {
      mockChatmessage.value.replyexpected = true
      mockChatmessage.value.replyreceived = true
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(false)
    })
  })

  describe('my messages (from current user)', () => {
    beforeEach(() => {
      mockMessageIsFromCurrentUser.value = true
    })

    it('shows chat__dateread--mine class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat__dateread--mine').exists()).toBe(true)
    })

    it('shows check icon when seenbyall', () => {
      mockChatmessage.value.seenbyall = true
      const wrapper = createWrapper()
      const icon = wrapper.find('.v-icon[data-icon="check"]')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('text-success')
    })

    it('shows envelope icon when mailedtoall', () => {
      mockChatmessage.value.mailedtoall = true
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="envelope"]').exists()).toBe(true)
    })

    it('shows danger envelope for User2Mod with email notifications off', () => {
      mockMod.value = true
      mockChat.value = { chattype: 'User2Mod' }
      mockOtheruser.value = { settings: { notifications: { email: false } } }
      const wrapper = createWrapper()
      const icon = wrapper.find('.v-icon[data-icon="envelope"]')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('text-danger')
    })

    it('shows muted check when not seenbyall and not mailedtoall', () => {
      mockChatmessage.value.seenbyall = false
      mockChatmessage.value.mailedtoall = false
      const wrapper = createWrapper()
      const icon = wrapper.find('.v-icon[data-icon="check"]')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('text-muted')
    })

    it('shows RSVP requested badge', () => {
      mockChatmessage.value.replyexpected = true
      mockChatmessage.value.replyreceived = false
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').text()).toBe('RSVP - reply requested')
    })

    it('shows pending review text', () => {
      mockChatmessage.value.reviewrequired = true
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Pending review')
    })
  })

  describe('User2Mod chat type', () => {
    beforeEach(() => {
      mockMessageIsFromCurrentUser.value = true
      mockChat.value = { chattype: 'User2Mod' }
    })

    it('shows "You" when message is from current user', () => {
      mockChatmessage.value.userid = 1
      mockMe.value = { id: 1 }
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('You')
      expect(wrapper.text()).toContain('sent this')
    })

    it('shows other mod name when available', async () => {
      mockChatmessage.value.userid = 5
      mockUserStore.byId.mockReturnValue({ displayname: 'Mod Alice' })
      const wrapper = createWrapper()
      wrapper.vm.chatMessageUser = { displayname: 'Mod Alice' }
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Mod Alice')
      expect(wrapper.text()).toContain('sent this')
    })

    it('shows user id with hashtag when no mod name', () => {
      mockChatmessage.value.userid = 99
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="hashtag"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('99')
    })
  })

  describe('lifecycle', () => {
    it('fetches user data on mount when chatmessage has userid', async () => {
      mockChatmessage.value.userid = 42
      mockUserStore.byId.mockReturnValue({ displayname: 'Test User' })
      createWrapper()
      await vi.waitFor(() => {
        expect(mockUserStore.fetch).toHaveBeenCalledWith(42)
      })
    })
  })

  describe('computed properties', () => {
    it('computes othermodname from chatMessageUser loaded by onMounted', async () => {
      mockMessageIsFromCurrentUser.value = true
      mockChat.value = { chattype: 'User2Mod' }
      mockChatmessage.value.userid = 10
      mockUserStore.byId.mockReturnValue({ displayname: 'Moderator Bob' })
      const wrapper = createWrapper()
      // Wait for onMounted to complete
      await vi.waitFor(() => {
        expect(wrapper.vm.othermodname).toBe('Moderator Bob')
      })
    })

    it('returns undefined for othermodname when no chatMessageUser', () => {
      mockChatmessage.value.userid = null // No userid means no fetch
      const wrapper = createWrapper()
      expect(wrapper.vm.othermodname).toBe(undefined)
    })
  })
})
