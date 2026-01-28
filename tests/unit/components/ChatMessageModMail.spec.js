import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import ChatMessageModMail from '~/components/ChatMessageModMail.vue'

const {
  mockChat,
  mockChatmessage,
  mockEmessage,
  mockRefmsg,
  mockMe,
  mockMyid,
  mockRealMe,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockChat: ref({
      lastmsgseen: 10,
      chattype: 'User2Mod',
      group: { namedisplay: 'Freegle Cambridge', profile: '/group.jpg' },
      user: { id: 2 },
    }),
    mockChatmessage: ref({
      id: 100,
      userid: 5,
      secondsago: 30,
      refmsgid: 50,
    }),
    mockEmessage: ref('Please edit and resend your message'),
    mockRefmsg: ref({
      id: 50,
      type: 'Offer',
      item: { name: 'Bicycle' },
      textbody: 'Old bicycle, needs new tire',
      availablenow: true,
      attachments: [],
    }),
    mockMe: ref({ id: 1, displayname: 'Current User' }),
    mockMyid: ref(1),
    mockRealMe: ref({ id: 1, systemrole: 'User' }),
  }
})

const mockComposeStore = {
  clearMessages: vi.fn(),
  setMessage: vi.fn(),
  setAttachmentsForMessage: vi.fn(),
}

const mockRouterPush = vi.fn()

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    chat: mockChat,
    chatmessage: mockChatmessage,
    emessage: mockEmessage,
    refmsg: mockRefmsg,
    me: mockMe,
    get myid() {
      return mockMyid.value
    },
    realMe: mockRealMe,
  }),
  fetchReferencedMessage: vi.fn(),
}))

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

vi.mock('#imports', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  ref: (val) => ({ value: val }),
  computed: (fn) => ({ value: fn() }),
}))

describe('ChatMessageModMail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChat.value = {
      lastmsgseen: 10,
      chattype: 'User2Mod',
      group: { namedisplay: 'Freegle Cambridge', profile: '/group.jpg' },
      user: { id: 2 },
    }
    mockChatmessage.value = {
      id: 100,
      userid: 5,
      secondsago: 30,
      refmsgid: 50,
    }
    mockEmessage.value = 'Please edit and resend your message'
    mockRefmsg.value = {
      id: 50,
      type: 'Offer',
      item: { name: 'Bicycle' },
      textbody: 'Old bicycle, needs new tire',
      availablenow: true,
      attachments: [],
    }
    mockMe.value = { id: 1, displayname: 'Current User' }
    mockMyid.value = 1
    mockRealMe.value = { id: 1, systemrole: 'User' }
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(ChatMessageModMail, {
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
            props: ['icon', 'scale'],
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
            template: '<img class="b-img" :src="src" />',
            props: ['fluid', 'src', 'lazy', 'rounded'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant'],
          },
          ProfileImage: {
            template: '<div class="profile-image" />',
            props: ['image', 'size', 'isThumbnail'],
          },
          GroupSelect: {
            template: '<select class="group-select" v-model="modelValue" />',
            props: ['modelValue', 'remember'],
          },
          ChatButton: {
            template: '<button class="chat-button">{{ title }}</button>',
            props: ['groupid', 'size', 'title', 'variant'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
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

    it('renders b-card with success border', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('renders media container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.media').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires chatid prop', async () => {
      const wrapper = await createWrapper({ chatid: 5 })
      expect(wrapper.findComponent(ChatMessageModMail).props('chatid')).toBe(5)
    })

    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 200 })
      expect(wrapper.findComponent(ChatMessageModMail).props('id')).toBe(200)
    })

    it('has default last of false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ChatMessageModMail).props('last')).toBe(
        false
      )
    })

    it('accepts last prop', async () => {
      const wrapper = await createWrapper({ last: true })
      expect(wrapper.findComponent(ChatMessageModMail).props('last')).toBe(true)
    })

    it('has default pov of null', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ChatMessageModMail).props('pov')).toBe(null)
    })

    it('accepts pov prop', async () => {
      const wrapper = await createWrapper({ pov: 3 })
      expect(wrapper.findComponent(ChatMessageModMail).props('pov')).toBe(3)
    })

    it('has default highlightEmails of false', async () => {
      const wrapper = await createWrapper()
      expect(
        wrapper.findComponent(ChatMessageModMail).props('highlightEmails')
      ).toBe(false)
    })
  })

  describe('group display', () => {
    it('shows group name in header when group exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Freegle Cambridge')
      expect(wrapper.text()).toContain('Volunteers')
    })

    it('shows generic Freegle Volunteers when no group', async () => {
      mockChat.value.group = null
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Freegle Volunteers')
    })

    it('renders ProfileImage when group exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })
  })

  describe('moderator identification', () => {
    it('hides sender id for regular users', async () => {
      mockRealMe.value = { id: 1, systemrole: 'User' }
      const wrapper = await createWrapper()
      expect(wrapper.find('.v-icon[data-icon="hashtag"]').exists()).toBe(false)
    })

    it('shows sender id for moderators', async () => {
      mockRealMe.value = { id: 1, systemrole: 'Moderator' }
      const wrapper = await createWrapper()
      expect(wrapper.find('.v-icon[data-icon="hashtag"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Sent by')
    })

    it('shows sender id for support', async () => {
      mockRealMe.value = { id: 1, systemrole: 'Support' }
      const wrapper = await createWrapper()
      expect(wrapper.find('.v-icon[data-icon="hashtag"]').exists()).toBe(true)
    })

    it('shows sender id for admins', async () => {
      mockRealMe.value = { id: 1, systemrole: 'Admin' }
      const wrapper = await createWrapper()
      expect(wrapper.find('.v-icon[data-icon="hashtag"]').exists()).toBe(true)
    })
  })

  describe('message display', () => {
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
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('edit and resend section', () => {
    it('shows edit and resend button when refmsgid and refmsg exist', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Edit and Resend')
    })

    it('shows edit instruction text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('edit and resend this message')
    })

    it('hides edit section when no refmsgid', async () => {
      mockChatmessage.value.refmsgid = null
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Edit and Resend')
    })

    it('hides edit section when no refmsg', async () => {
      mockRefmsg.value = null
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Edit and Resend')
    })
  })

  describe('User2User chat notice', () => {
    it('shows warning notice for User2User chats without refmsgid', async () => {
      mockChat.value.chattype = 'User2User'
      mockChatmessage.value.refmsgid = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain("Volunteers won't see any replies")
    })

    it('shows GroupSelect for User2User chats', async () => {
      mockChat.value.chattype = 'User2User'
      mockChatmessage.value.refmsgid = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.group-select').exists()).toBe(true)
    })

    it('shows ChatButton for User2User chats', async () => {
      mockChat.value.chattype = 'User2User'
      mockChatmessage.value.refmsgid = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Contact community volunteers')
    })

    it('hides notice for User2Mod chats', async () => {
      mockChat.value.chattype = 'User2Mod'
      mockChatmessage.value.refmsgid = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('computes group from chat.group', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.group).toEqual({
        namedisplay: 'Freegle Cambridge',
        profile: '/group.jpg',
      })
    })

    it('returns null for group when no chat.group', async () => {
      mockChat.value.group = null
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.group).toBe(null)
    })

    it('returns null for group when no chat', async () => {
      mockChat.value = null
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.group).toBe(null)
    })

    it('computes amUser as true when chat.user.id matches myid', async () => {
      mockChat.value.user = { id: 1 }
      mockMyid.value = 1
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.amUser).toBe(true)
    })

    it('computes amUser as false when ids differ', async () => {
      mockChat.value.user = { id: 2 }
      mockMyid.value = 1
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.amUser).toBe(false)
    })

    it('computes realMod as true for Moderator', async () => {
      mockRealMe.value = { systemrole: 'Moderator' }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.realMod).toBe(true)
    })

    it('computes realMod as true for Support', async () => {
      mockRealMe.value = { systemrole: 'Support' }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.realMod).toBe(true)
    })

    it('computes realMod as true for Admin', async () => {
      mockRealMe.value = { systemrole: 'Admin' }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.realMod).toBe(true)
    })

    it('computes realMod as false for User', async () => {
      mockRealMe.value = { systemrole: 'User' }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.realMod).toBe(false)
    })

    it('computes realMod as falsy when no realMe', async () => {
      mockRealMe.value = null
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      // Returns null/undefined when realMe is null, but will be falsy
      expect(comp.vm.realMod).toBeFalsy()
    })
  })

  describe('methods', () => {
    it('repost clears messages and navigates to /give for Offer', async () => {
      mockRefmsg.value = {
        type: 'Offer',
        item: { name: 'Bicycle' },
        textbody: 'Old bicycle',
        availablenow: true,
        attachments: [],
      }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      await comp.vm.repost()
      expect(mockComposeStore.clearMessages).toHaveBeenCalled()
      expect(mockComposeStore.setMessage).toHaveBeenCalled()
      expect(mockRouterPush).toHaveBeenCalledWith('/give')
    })

    it('repost navigates to /find for Wanted', async () => {
      mockRefmsg.value = {
        type: 'Wanted',
        item: { name: 'Chair' },
        textbody: 'Looking for a chair',
        availablenow: true,
        attachments: [],
      }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      await comp.vm.repost()
      expect(mockRouterPush).toHaveBeenCalledWith('/find')
    })

    it('repost sets message with correct data', async () => {
      mockRefmsg.value = {
        type: 'Offer',
        item: { name: ' Bicycle ' },
        textbody: ' Old bicycle ',
        availablenow: true,
        attachments: [{ id: 1 }],
      }
      mockChatmessage.value.refmsgid = 50
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      await comp.vm.repost()
      expect(mockComposeStore.setMessage).toHaveBeenCalledWith(
        0,
        {
          type: 'Offer',
          item: 'Bicycle',
          description: 'Old bicycle',
          availablenow: true,
          repostof: 50,
        },
        mockMe.value
      )
      expect(mockComposeStore.setAttachmentsForMessage).toHaveBeenCalledWith(
        0,
        [{ id: 1 }]
      )
    })
  })

  describe('reactive state', () => {
    it('initializes contactGroupId as null', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(ChatMessageModMail)
      expect(comp.vm.contactGroupId).toBe(null)
    })
  })

  describe('card alignment', () => {
    it('applies ml-auto class when amUser is false', async () => {
      mockChat.value.user = { id: 2 }
      mockMyid.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').classes()).toContain('ml-auto')
    })

    it('does not apply ml-auto class when amUser is true', async () => {
      mockChat.value.user = { id: 1 }
      mockMyid.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').classes()).not.toContain('ml-auto')
    })
  })
})
