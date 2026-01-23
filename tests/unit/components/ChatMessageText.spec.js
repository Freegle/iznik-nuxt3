import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ChatMessageText from '~/components/ChatMessageText.vue'

// Mock vue-highlight-words external component
vi.mock('vue-highlight-words', () => ({
  default: defineComponent({
    name: 'VueHighlightWords',
    props: {
      textToHighlight: { type: String, default: '' },
      searchWords: { type: Array, default: () => [] },
      highlightClassName: { type: String, default: '' },
    },
    setup(props) {
      return () => h('span', { class: 'highlighter' }, props.textToHighlight)
    },
  }),
}))

// Mock chat message base composable
const mockChat = {
  id: 123,
  lastmsgseen: 100,
}
const mockChatMessage = {
  id: 101,
  message: 'Hello there!',
  secondsago: 30,
  image: null,
}

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: vi.fn(() => ({
    chat: { value: mockChat },
    chatmessage: { value: mockChatMessage },
    emessage: 'Hello there!',
    messageIsFromCurrentUser: false,
    chatMessageProfileImage: '/path/to/image.jpg',
    chatMessageProfileName: 'Test User',
    regexEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  })),
}))

// Mock location store
const mockTypeahead = vi.fn().mockResolvedValue([])

vi.mock('~/stores/location', () => ({
  useLocationStore: () => ({
    typeahead: mockTypeahead,
  }),
}))

// Mock map composables
vi.mock('~/composables/useMap', () => ({
  attribution: () => '© OpenStreetMap',
  osmtile: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
}))

// Mock constants
vi.mock('~/constants', () => ({
  MAX_MAP_ZOOM: 18,
  POSTCODE_REGEX: /[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s*[0-9][A-Z]{2}/gi,
}))

describe('ChatMessageText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageText, {
      props: {
        chatid: 123,
        id: 101,
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-name="name"></div>',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['fluid', 'src', 'lazy', 'rounded'],
          },
          'l-map': {
            template: '<div class="l-map"><slot /></div>',
            props: ['zoom', 'maxZoom', 'center', 'style'],
          },
          'l-tile-layer': {
            template: '<div class="l-tile-layer"></div>',
            props: ['url', 'attribution'],
          },
          'l-marker': {
            template: '<div class="l-marker"></div>',
            props: ['latLng', 'interactive'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders chat message wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(true)
    })

    it('renders profile image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('displays message text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Hello there!')
    })
  })

  describe('message styling', () => {
    it('applies myChatMessage class when message is from current user', async () => {
      const { useChatMessageBase } = await import('~/composables/useChat')
      useChatMessageBase.mockReturnValueOnce({
        chat: { value: mockChat },
        chatmessage: { value: mockChatMessage },
        emessage: 'Hello!',
        messageIsFromCurrentUser: true,
        chatMessageProfileImage: '/path/to/image.jpg',
        chatMessageProfileName: 'Test User',
        regexEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.myChatMessage').exists()).toBe(true)
    })

    it('does not apply myChatMessage class when message is from other user', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.myChatMessage').exists()).toBe(false)
    })
  })

  describe('email highlighting', () => {
    it('does not highlight when highlightEmails is false', () => {
      const wrapper = createWrapper({ highlightEmails: false })
      expect(wrapper.find('.highlighter').exists()).toBe(false)
    })

    it('renders Highlighter when highlightEmails is true', () => {
      const wrapper = createWrapper({ highlightEmails: true })
      // The Highlighter component should be rendered when highlightEmails is true
      // Note: The actual highlighting functionality is tested via the Highlighter component
      expect(wrapper.find('.highlighter').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires chatid prop', () => {
      const props = ChatMessageText.props
      expect(props.chatid.required).toBe(true)
    })

    it('chatid is Number type', () => {
      const props = ChatMessageText.props
      expect(props.chatid.type).toBe(Number)
    })

    it('requires id prop', () => {
      const props = ChatMessageText.props
      expect(props.id.required).toBe(true)
    })

    it('id is Number type', () => {
      const props = ChatMessageText.props
      expect(props.id.type).toBe(Number)
    })

    it('pov is optional', () => {
      const props = ChatMessageText.props
      expect(props.pov.required).toBe(false)
    })

    it('pov defaults to null', () => {
      const props = ChatMessageText.props
      expect(props.pov.default).toBe(null)
    })

    it('highlightEmails is optional', () => {
      const props = ChatMessageText.props
      expect(props.highlightEmails.required).toBe(false)
    })

    it('highlightEmails defaults to false', () => {
      const props = ChatMessageText.props
      expect(props.highlightEmails.default).toBe(false)
    })
  })
})
