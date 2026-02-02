import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import ChatMessageReneged from '~/components/ChatMessageReneged.vue'

const {
  mockChat,
  mockChatmessage,
  mockEmessage,
  mockRefmsg,
  mockRefmsgid,
  mockMe,
  mockMyid,
  mockOtheruser,
  mockBrokenImage,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockChat: ref({ lastmsgseen: 10 }),
    mockChatmessage: ref({
      id: 100,
      userid: 2,
      secondsago: 30,
      refmsgid: 50,
    }),
    mockEmessage: ref('Sorry, the promise has been cancelled'),
    mockRefmsg: ref({
      id: 50,
      subject: 'OFFER: Test Item',
      attachments: [{ paththumb: '/thumb.jpg' }],
    }),
    mockRefmsgid: ref(50),
    mockMe: ref({ displayname: 'Current User', profile: { path: '/me.jpg' } }),
    mockMyid: ref(1),
    mockOtheruser: ref({
      displayname: 'Other User',
      profile: { paththumb: '/other.jpg' },
    }),
    mockBrokenImage: vi.fn(),
  }
})

const mockMessageStore = {
  fetch: vi.fn(),
}

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    chat: mockChat,
    chatmessage: mockChatmessage,
    emessage: mockEmessage,
    refmsg: mockRefmsg,
    refmsgid: mockRefmsgid,
    me: mockMe,
    myid: mockMyid,
    otheruser: mockOtheruser,
    brokenImage: mockBrokenImage,
  }),
  fetchReferencedMessage: vi.fn(),
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

describe('ChatMessageReneged', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChat.value = { lastmsgseen: 10 }
    mockChatmessage.value = {
      id: 100,
      userid: 2,
      secondsago: 30,
      refmsgid: 50,
    }
    mockEmessage.value = 'Sorry, the promise has been cancelled'
    mockRefmsg.value = {
      id: 50,
      subject: 'OFFER: Test Item',
      attachments: [{ paththumb: '/thumb.jpg' }],
    }
    mockRefmsgid.value = 50
    mockMe.value = { displayname: 'Current User', profile: { path: '/me.jpg' } }
    mockMyid.value = 1
    mockOtheruser.value = {
      displayname: 'Other User',
      profile: { paththumb: '/other.jpg' },
    }
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(ChatMessageReneged, {
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
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
          },
          'b-card': {
            template:
              '<div class="b-card" :class="borderVariant"><slot /></div>',
            props: ['borderVariant'],
          },
          'b-card-title': {
            template: '<div class="b-card-title"><slot /></div>',
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @error="$emit(\'error\')" />',
            props: ['rounded', 'thumbnail', 'lazy', 'src', 'width', 'fluid'],
          },
          ProfileImage: {
            template: '<div class="profile-image" :data-name="name" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders b-row container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-row').exists()).toBe(true)
    })

    it('renders b-card with warning border', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires chatid prop', async () => {
      const wrapper = await createWrapper({ chatid: 5 })
      expect(wrapper.findComponent(ChatMessageReneged).props('chatid')).toBe(5)
    })

    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 200 })
      expect(wrapper.findComponent(ChatMessageReneged).props('id')).toBe(200)
    })

    it('has default last of false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ChatMessageReneged).props('last')).toBe(
        false
      )
    })

    it('accepts last prop', async () => {
      const wrapper = await createWrapper({ last: true })
      expect(wrapper.findComponent(ChatMessageReneged).props('last')).toBe(true)
    })

    it('has default pov of null', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ChatMessageReneged).props('pov')).toBe(null)
    })

    it('accepts pov prop', async () => {
      const wrapper = await createWrapper({ pov: 3 })
      expect(wrapper.findComponent(ChatMessageReneged).props('pov')).toBe(3)
    })

    it('has default highlightEmails of false', async () => {
      const wrapper = await createWrapper()
      expect(
        wrapper.findComponent(ChatMessageReneged).props('highlightEmails')
      ).toBe(false)
    })
  })

  describe('received renege (from other user)', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
    })

    it('shows "no longer promised to you" message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain(
        'Sorry...this is no longer promised to you'
      )
    })

    it('renders ProfileImage for other user', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('displays message subject', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('OFFER: Test Item')
    })

    it('shows thumbnail when attachments exist', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
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

    it('shows image when chatmessage has image', async () => {
      mockChatmessage.value.image = { path: '/image.jpg' }
      const wrapper = await createWrapper()
      const images = wrapper.findAll('.b-img')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  describe('sent renege (from current user)', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 1
      mockMyid.value = 1
    })

    it('shows "You cancelled your promise" message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('You cancelled your promise')
    })

    it('shows other user name in message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Other User')
    })

    it('renders ProfileImage for current user', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('displays message subject', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('OFFER: Test Item')
    })

    it('shows float-end class for alignment', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.float-end').exists()).toBe(true)
    })
  })

  describe('deleted message reference', () => {
    beforeEach(() => {
      mockRefmsg.value = null
    })

    it('shows deleted message notice for received renege', async () => {
      mockChatmessage.value.userid = 2
      mockMyid.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('has been deleted')
    })

    it('shows deleted message notice for sent renege', async () => {
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

  describe('message without attachments', () => {
    it('does not show thumbnail when no attachments', async () => {
      mockRefmsg.value.attachments = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })

    it('does not show thumbnail when attachments is undefined', async () => {
      mockRefmsg.value.attachments = undefined
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })
  })

  describe('chatMessage styling', () => {
    it('applies chatMessage class when emessage exists', async () => {
      mockEmessage.value = 'Some message'
      const wrapper = await createWrapper()
      expect(wrapper.find('.chatMessage').exists()).toBe(true)
    })

    it('does not apply chatMessage class when no emessage', async () => {
      mockEmessage.value = ''
      const wrapper = await createWrapper()
      expect(wrapper.find('.chatMessage').exists()).toBe(false)
    })
  })
})
