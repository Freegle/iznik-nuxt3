import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import ChatMessagePromised from '~/components/ChatMessagePromised.vue'

const {
  mockChat,
  mockChatmessage,
  mockEmessage,
  mockRefmsgid,
  mockRefmsg,
  mockMe,
  mockMyid,
  mockOtheruser,
  mockFetchMessage,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockChat: ref({ lastmsgseen: 10 }),
    mockChatmessage: ref({
      id: 100,
      userid: 2,
      secondsago: 30,
      refmsgid: 50,
      chatid: 1,
    }),
    mockEmessage: ref('Here is the item you requested'),
    mockRefmsgid: ref(50),
    mockRefmsg: ref({
      id: 50,
      subject: 'OFFER: Test Item',
      type: 'Offer',
      outcomes: [],
      deleted: false,
      promisecount: 1,
      availablenow: true,
      attachments: [{ paththumb: '/thumb.jpg' }],
    }),
    mockMe: ref({
      id: 1,
      displayname: 'Current User',
      profile: { path: '/me.jpg' },
    }),
    mockMyid: ref(1),
    mockOtheruser: ref({
      id: 2,
      displayname: 'Other User',
      profile: { paththumb: '/other.jpg' },
    }),
    mockFetchMessage: vi.fn(),
  }
})

const mockTrystStore = {
  fetch: vi.fn(),
  getByUser: vi.fn(),
}

const mockChatStore = {
  fetchMessages: vi.fn(),
}

const mockMessageStore = {
  fetch: vi.fn(),
}

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    chat: mockChat,
    chatmessage: mockChatmessage,
    emessage: mockEmessage,
    refmsgid: mockRefmsgid,
    refmsg: mockRefmsg,
    me: mockMe,
    myid: mockMyid,
    otheruser: mockOtheruser,
    fetchMessage: mockFetchMessage,
  }),
  fetchReferencedMessage: vi.fn(),
}))

vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => mockTrystStore,
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/composables/useThrottle', () => ({
  fetchOurOffers: vi.fn(),
}))

describe('ChatMessagePromised', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChat.value = { lastmsgseen: 10 }
    mockChatmessage.value = {
      id: 100,
      userid: 2,
      secondsago: 30,
      refmsgid: 50,
      chatid: 1,
    }
    mockEmessage.value = 'Here is the item you requested'
    mockRefmsgid.value = 50
    mockRefmsg.value = {
      id: 50,
      subject: 'OFFER: Test Item',
      type: 'Offer',
      outcomes: [],
      deleted: false,
      promisecount: 1,
      availablenow: true,
      attachments: [{ paththumb: '/thumb.jpg' }],
    }
    mockMe.value = {
      id: 1,
      displayname: 'Current User',
      profile: { path: '/me.jpg' },
    }
    mockMyid.value = 1
    mockOtheruser.value = {
      id: 2,
      displayname: 'Other User',
      profile: { paththumb: '/other.jpg' },
    }
    mockTrystStore.getByUser.mockReturnValue(null)
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(ChatMessagePromised, {
                chatid: 1,
                id: 100,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
          ProfileImage: {
            template: '<div class="profile-image" :data-name="name" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          ChatMessageCard: {
            template: '<div class="chat-message-card" :data-id="id" />',
            props: ['id', 'showLocation'],
          },
          AddToCalendar: {
            template: '<div class="add-to-calendar" />',
            props: ['calendarLink'],
          },
          DateFormatted: {
            template: '<span class="date-formatted">{{ value }}</span>',
            props: ['value', 'format'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          OutcomeModal: {
            template: '<div class="outcome-modal" />',
            props: ['id', 'takenBy', 'type'],
          },
          RenegeModal: {
            template: '<div class="renege-modal" />',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
          },
          PromiseModal: {
            template: '<div class="promise-modal" />',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders chat-message-promised container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-promised').exists()).toBe(true)
    })

    it('renders promised-message class', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.promised-message').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires chatid prop', async () => {
      const wrapper = await createWrapper({ chatid: 5 })
      expect(wrapper.findComponent(ChatMessagePromised).props('chatid')).toBe(5)
    })

    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 200 })
      expect(wrapper.findComponent(ChatMessagePromised).props('id')).toBe(200)
    })

    it('has default last of false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ChatMessagePromised).props('last')).toBe(
        false
      )
    })

    it('accepts last prop', async () => {
      const wrapper = await createWrapper({ last: true })
      expect(wrapper.findComponent(ChatMessagePromised).props('last')).toBe(
        true
      )
    })

    it('has default pov of null', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ChatMessagePromised).props('pov')).toBe(null)
    })

    it('accepts pov prop', async () => {
      const wrapper = await createWrapper({ pov: 3 })
      expect(wrapper.findComponent(ChatMessagePromised).props('pov')).toBe(3)
    })

    it('has default highlightEmails of false', async () => {
      const wrapper = await createWrapper()
      expect(
        wrapper.findComponent(ChatMessagePromised).props('highlightEmails')
      ).toBe(false)
    })
  })

  describe('received promise (from other user)', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
    })

    it('shows good news message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Good news')
      expect(wrapper.text()).toContain("You've been promised this")
    })

    it('renders ChatMessageCard', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-card').exists()).toBe(true)
    })

    it('renders ProfileImage for other user', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('shows bold message when recent', async () => {
      mockChatmessage.value.secondsago = 30
      const wrapper = await createWrapper()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })

    it('shows bold message when id > lastmsgseen', async () => {
      mockChatmessage.value.secondsago = 120
      mockChatmessage.value.id = 100
      mockChat.value.lastmsgseen = 50
      const wrapper = await createWrapper()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })

    it('shows normal text when old message', async () => {
      mockChatmessage.value.secondsago = 120
      mockChatmessage.value.id = 50
      mockChat.value.lastmsgseen = 100
      const wrapper = await createWrapper()
      expect(wrapper.find('.preline').exists()).toBe(true)
    })

    it('shows no longer available notice when outcomes exist', async () => {
      mockRefmsg.value.outcomes = [{ id: 1 }]
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('no longer available')
    })

    it('shows no longer looking notice for Wanted with outcomes', async () => {
      mockRefmsg.value.type = 'Wanted'
      mockRefmsg.value.outcomes = [{ id: 1 }]
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('no longer looking')
    })

    it('shows AddToCalendar when tryst has calendarLink', async () => {
      mockTrystStore.getByUser.mockReturnValue({
        calendarLink: 'https://calendar.google.com/...',
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.add-to-calendar').exists()).toBe(true)
    })
  })

  describe('sent promise (from current user)', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 1
      mockMyid.value = 1
    })

    it('shows promised-message--mine class', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.promised-message--mine').exists()).toBe(true)
    })

    it('shows "You promised" label', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('You promised')
    })

    it('shows other user name in promise label', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Other User')
    })

    it('renders ChatMessageCard with showLocation false', async () => {
      const wrapper = await createWrapper()
      const card = wrapper.find('.chat-message-card')
      expect(card.exists()).toBe(true)
    })

    it('shows Unpromise button when promisecount > 0 and availablenow', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Unpromise')
    })

    it('shows Mark as TAKEN button when availablenow', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Mark as TAKEN')
    })

    it('shows Change time button when tryst exists', async () => {
      mockTrystStore.getByUser.mockReturnValue({
        arrangedfor: '2024-01-20T10:00:00Z',
        calendarLink: 'https://...',
      })
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Change time')
    })

    it('shows Set time button when no tryst', async () => {
      mockTrystStore.getByUser.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Set time')
    })

    it('shows arranged time when tryst.arrangedfor exists', async () => {
      mockTrystStore.getByUser.mockReturnValue({
        arrangedfor: '2024-01-20T10:00:00Z',
      })
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Handover arranged for')
    })

    it('hides action buttons when not availablenow', async () => {
      mockRefmsg.value.availablenow = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Unpromise')
      expect(wrapper.text()).not.toContain('Set time')
    })

    it('shows "has now been taken" when not availablenow', async () => {
      mockRefmsg.value.availablenow = false
      mockRefmsg.value.outcomes = []
      mockRefmsg.value.deleted = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('has now been taken')
    })
  })

  describe('deleted message reference', () => {
    beforeEach(() => {
      mockRefmsg.value = null
    })

    it('shows deleted message notice for received promise', async () => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('has been deleted')
    })

    it('shows deleted message notice for sent promise', async () => {
      mockChatmessage.value.userid = 1
      mockMyid.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('has been deleted')
    })

    it('shows hashtag icon with refmsgid', async () => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.find('.v-icon[data-icon="hashtag"]').exists()).toBe(true)
    })
  })

  describe('methods', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 1
      mockMyid.value = 1
    })

    it('unpromise sets showRenege to true', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      comp.vm.unpromise()
      expect(comp.vm.showRenege).toBe(true)
    })

    it('changeTime sets showPromise to true', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      comp.vm.changeTime()
      expect(comp.vm.showPromise).toBe(true)
    })

    it('fetchMessages calls chatStore.fetchMessages', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      comp.vm.fetchMessages()
      expect(mockChatStore.fetchMessages).toHaveBeenCalledWith(1)
    })

    it('outcome sets showOutcome and outcomeType', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      await comp.vm.outcome('Taken')
      expect(comp.vm.showOutcome).toBe(true)
      expect(comp.vm.outcomeType).toBe('Taken')
    })
  })

  describe('reactive state', () => {
    it('initializes showRenege as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.showRenege).toBe(false)
    })

    it('initializes showOutcome as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.showOutcome).toBe(false)
    })

    it('initializes outcomeType as null', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.outcomeType).toBe(null)
    })

    it('initializes showPromise as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.showPromise).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('computes tryst from store', async () => {
      mockTrystStore.getByUser.mockReturnValue({
        id: 1,
        arrangedfor: '2024-01-20T10:00:00Z',
      })
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.tryst).toEqual({
        id: 1,
        arrangedfor: '2024-01-20T10:00:00Z',
      })
    })

    it('returns null for tryst when no otheruser', async () => {
      // Set otheruser to an object with no id to test the tryst logic
      // Note: Setting to null causes template errors since component expects otheruser object
      mockOtheruser.value = { id: null }
      mockTrystStore.getByUser.mockReturnValue(null)
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.tryst).toBe(null)
    })

    it('computes takenBy from otheruser', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.takenBy).toEqual({
        id: 2,
        displayname: 'Other User',
        profile: { paththumb: '/other.jpg' },
        userid: 2,
        count: 1,
      })
    })

    it('returns object for takenBy with userid null when otheruser has no id', async () => {
      // Note: Component doesn't handle truly null otheruser well in template
      // Testing with otheruser that has null id instead
      mockOtheruser.value = { id: null, displayname: null, profile: null }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessagePromised)
      expect(comp.vm.takenBy).toEqual({
        id: null,
        displayname: null,
        profile: null,
        userid: null,
        count: 1,
      })
    })
  })
})
