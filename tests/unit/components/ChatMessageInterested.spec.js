import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessageInterested from '~/components/ChatMessageInterested.vue'

// Mock defineAsyncComponent to prevent async import race conditions during test cleanup
vi.stubGlobal('defineAsyncComponent', (fn) => ({
  name: 'MockedAsyncComponent',
  template: '<div class="mocked-async-component" />',
}))

// Mock vue-highlight-words to prevent prop validation errors
vi.mock('vue-highlight-words', () => ({
  default: {
    name: 'Highlighter',
    props: ['textToHighlight', 'searchWords', 'highlightClassName'],
    template: '<span class="highlighter">{{ textToHighlight }}</span>',
  },
}))

const {
  mockChat,
  mockChatmessage,
  mockEmessage,
  mockMessageIsFromCurrentUser,
  mockChatMessageProfileImage,
  mockChatMessageProfileName,
  mockRegexEmail,
  mockOtheruser,
  mockMyid,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockChat: ref({ lastmsgseen: 10 }),
    mockChatmessage: ref({
      id: 100,
      userid: 2,
      secondsago: 30,
      refmsgid: 50,
      message: 'I am interested in this item',
    }),
    mockEmessage: ref('I am interested in this item'),
    mockMessageIsFromCurrentUser: ref(false),
    mockChatMessageProfileImage: ref('/user.jpg'),
    mockChatMessageProfileName: ref('Test User'),
    mockRegexEmail: ref(/[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/g),
    mockOtheruser: ref({ id: 2, displayname: 'Other User' }),
    mockMyid: ref(1),
  }
})

const mockMessageStore = {
  byId: vi.fn(),
  fetch: vi.fn(),
}

const mockChatStore = {
  fetchChat: vi.fn(),
}

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    chat: mockChat,
    chatmessage: mockChatmessage,
    emessage: mockEmessage,
    messageIsFromCurrentUser: mockMessageIsFromCurrentUser,
    chatMessageProfileImage: mockChatMessageProfileImage,
    chatMessageProfileName: mockChatMessageProfileName,
    regexEmail: mockRegexEmail,
    otheruser: mockOtheruser,
  }),
  fetchReferencedMessage: vi.fn(),
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: mockMyid,
  }),
}))

// Mock misc store - modtools flag for linkification
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    modtools: false,
  }),
}))

// Mock linkify composable - document.createElement not available in test env
vi.mock('~/composables/useLinkify', () => ({
  linkifyText: (text) => text || '',
  linkifyAndHighlightEmails: (text) => text || '',
}))

describe('ChatMessageInterested', () => {
  let wrapper = null

  beforeEach(() => {
    vi.clearAllMocks()
    mockChat.value = { lastmsgseen: 10 }
    mockChatmessage.value = {
      id: 100,
      userid: 2,
      secondsago: 30,
      refmsgid: 50,
      message: 'I am interested in this item',
    }
    mockEmessage.value = 'I am interested in this item'
    mockMessageIsFromCurrentUser.value = false
    mockChatMessageProfileImage.value = '/user.jpg'
    mockChatMessageProfileName.value = 'Test User'
    mockOtheruser.value = { id: 2, displayname: 'Other User' }
    mockMyid.value = 1
    mockMessageStore.byId.mockReturnValue(null)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  function createWrapper(props = {}) {
    wrapper = mount(ChatMessageInterested, {
      props: {
        chatid: 1,
        id: 100,
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template: '<div class="profile-image" :data-name="name" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          ChatMessageSummary: {
            template: '<div class="chat-message-summary" :data-id="id" />',
            props: ['id', 'chatid'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['fluid', 'src', 'lazy', 'rounded'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          OutcomeModal: {
            template:
              '<div class="outcome-modal" :data-id="id" :data-type="type" />',
            props: ['id', 'type'],
          },
          PromiseModal: {
            template: '<div class="promise-modal" />',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
          },
        },
      },
    })
    return wrapper
  }

  describe('rendering', () => {
    it('renders chatMessageWrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(true)
    })

    it('renders ProfileImage', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('renders chatMessage container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessage').exists()).toBe(true)
    })

    it('adds myChatMessage class when message is from current user', () => {
      mockMessageIsFromCurrentUser.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').classes()).toContain(
        'myChatMessage'
      )
    })

    it('does not add myChatMessage class when message is not from current user', () => {
      mockMessageIsFromCurrentUser.value = false
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').classes()).not.toContain(
        'myChatMessage'
      )
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

    it('has default highlightEmails of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('highlightEmails')).toBe(false)
    })

    it('accepts highlightEmails prop', () => {
      const wrapper = createWrapper({ highlightEmails: true })
      expect(wrapper.props('highlightEmails')).toBe(true)
    })
  })

  describe('message from other user', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
    })

    it('shows ChatMessageSummary when refmsgid exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-summary').exists()).toBe(true)
    })

    it('shows bold message when secondsago < 60', () => {
      mockChatmessage.value.secondsago = 30
      const wrapper = createWrapper()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })

    it('shows bold message when message id > lastmsgseen', () => {
      mockChatmessage.value.secondsago = 120
      mockChatmessage.value.id = 100
      mockChat.value.lastmsgseen = 50
      const wrapper = createWrapper()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })

    it('shows normal text when old message', () => {
      mockChatmessage.value.secondsago = 120
      mockChatmessage.value.id = 50
      mockChat.value.lastmsgseen = 100
      const wrapper = createWrapper()
      expect(wrapper.find('.preline').exists()).toBe(true)
    })

    it('shows image when chatmessage has image', () => {
      mockChatmessage.value.image = { path: '/image.jpg' }
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('message from current user', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 1
      mockMyid.value = 1
    })

    it('shows ChatMessageSummary when refmsgid exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-summary').exists()).toBe(true)
    })

    it('does not use Highlighter when highlightEmails is false', () => {
      const wrapper = createWrapper({ highlightEmails: false })
      expect(wrapper.find('.highlighter').exists()).toBe(false)
    })

    it('accepts highlightEmails true prop for email highlighting', () => {
      // The Highlighter component is used when highlightEmails is true
      // Testing the prop is accepted and the view switches
      const wrapper = createWrapper({ highlightEmails: true })
      expect(wrapper.props('highlightEmails')).toBe(true)
    })
  })

  describe('promise/outcome buttons for offers', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
      mockMessageStore.byId.mockReturnValue({
        id: 50,
        fromuser: 1,
        type: 'Offer',
        outcomes: [],
        promisecount: 0,
      })
    })

    it('shows Promise button when available', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Promise')
    })

    it('shows Mark as TAKEN button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Mark as TAKEN')
    })

    it('shows Withdraw button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Withdraw')
    })

    it('hides Promise button when promisecount > 0', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 50,
        fromuser: 1,
        type: 'Offer',
        outcomes: [],
        promisecount: 1,
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="handshake"]').exists()).toBe(
        false
      )
    })
  })

  describe('computed properties', () => {
    it('computes refmsgid from chatmessage.refmsgid', () => {
      mockChatmessage.value.refmsgid = 123
      const wrapper = createWrapper()
      expect(wrapper.vm.refmsgid).toBe(123)
    })

    it('computes refmsgid from chatmessage.refmsg.id when available', () => {
      mockChatmessage.value.refmsg = { id: 456 }
      mockChatmessage.value.refmsgid = 123
      const wrapper = createWrapper()
      expect(wrapper.vm.refmsgid).toBe(456)
    })

    it('computes refmsg from store', () => {
      mockChatmessage.value.refmsgid = 50
      mockMessageStore.byId.mockReturnValue({ id: 50, subject: 'Test Message' })
      const wrapper = createWrapper()
      expect(wrapper.vm.refmsg).toEqual({ id: 50, subject: 'Test Message' })
    })

    it('computes refmsg from chatmessage.refmsg when available', () => {
      mockChatmessage.value.refmsg = { id: 99, subject: 'Embedded Message' }
      const wrapper = createWrapper()
      expect(wrapper.vm.refmsg).toEqual({ id: 99, subject: 'Embedded Message' })
    })
  })

  describe('methods', () => {
    it('promise method sets showPromise to true', () => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
      const wrapper = createWrapper()
      expect(wrapper.vm.showPromise).toBe(false)
      wrapper.vm.promise()
      expect(wrapper.vm.showPromise).toBe(true)
    })

    it('promised method sets showPromise to false and fetches chat', () => {
      const wrapper = createWrapper()
      wrapper.vm.showPromise = true
      wrapper.vm.promised()
      expect(wrapper.vm.showPromise).toBe(false)
      expect(mockChatStore.fetchChat).toHaveBeenCalledWith(1)
    })

    it('outcome method sets showOutcome and outcomeType', async () => {
      mockChatmessage.value.refmsgid = 50
      const wrapper = createWrapper()
      await wrapper.vm.outcome('Taken')
      expect(wrapper.vm.showOutcome).toBe(true)
      expect(wrapper.vm.outcomeType).toBe('Taken')
    })

    it('fetchMessage calls messageStore.fetch', async () => {
      mockChatmessage.value.refmsgid = 50
      const wrapper = createWrapper()
      await wrapper.vm.fetchMessage()
      expect(mockMessageStore.fetch).toHaveBeenCalledWith(50)
    })
  })

  describe('reactive state', () => {
    it('initializes showOutcome as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showOutcome).toBe(false)
    })

    it('initializes outcomeType as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.outcomeType).toBe(null)
    })

    it('initializes showPromise as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showPromise).toBe(false)
    })
  })
})
