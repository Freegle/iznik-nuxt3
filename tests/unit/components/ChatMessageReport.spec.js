import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatMessageReport from '~/components/ChatMessageReport.vue'

const mockChatmessage = ref({
  refchatid: 100,
  userid: 1,
})
const mockEmessage = ref('Test report message')
const mockOtheruser = ref({ displayname: 'Test User' })

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    chatmessage: mockChatmessage,
    emessage: mockEmessage,
    otheruser: mockOtheruser,
  }),
}))

const mockModtools = ref(false)

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    modtools: mockModtools.value,
  }),
}))

describe('ChatMessageReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockModtools.value = false
    mockChatmessage.value = {
      refchatid: 100,
      userid: 1,
    }
    mockEmessage.value = 'Test report message'
    mockOtheruser.value = { displayname: 'Test User' }
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageReport, {
      props: {
        chatid: 1,
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
          },
          'b-card': {
            template:
              '<div class="b-card" :data-border="borderVariant"><slot /><slot name="title" /><slot name="text" /></div>',
            props: ['borderVariant'],
          },
          'b-card-title': {
            template: '<div class="b-card-title"><slot /></div>',
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'scale'],
          },
          ModChatViewButton: {
            template: '<button class="mod-chat-view-button" />',
            props: ['id', 'pov'],
          },
        },
      },
    })
  }

  describe('non-modtools view', () => {
    it('renders card with warning border', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card[data-border="warning"]').exists()).toBe(true)
    })

    it('shows "You reported someone" message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('You reported someone')
    })

    it('shows volunteer response message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This has been passed to our volunteers')
    })

    it('shows warning icon', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.v-icon[data-icon="exclamation-triangle"]').exists()
      ).toBe(true)
    })

    it('does not show mod chat view button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mod-chat-view-button').exists()).toBe(false)
    })
  })

  describe('modtools view', () => {
    beforeEach(() => {
      mockModtools.value = true
    })

    it('shows reporter name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test User')
      expect(wrapper.text()).toContain('reported someone')
    })

    it('shows message content', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test report message')
    })

    it('shows chat reference id', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('100')
    })

    it('shows user id', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('1')
    })

    it('shows ModChatViewButton', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mod-chat-view-button').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires chatid prop', () => {
      const wrapper = createWrapper({ chatid: 5 })
      expect(wrapper.props('chatid')).toBe(5)
    })

    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 10 })
      expect(wrapper.props('id')).toBe(10)
    })

    it('has optional last prop', () => {
      const wrapper = createWrapper({ last: true })
      expect(wrapper.props('last')).toBe(true)
    })

    it('has optional pov prop', () => {
      const wrapper = createWrapper({ pov: 123 })
      expect(wrapper.props('pov')).toBe(123)
    })

    it('has optional highlightEmails prop', () => {
      const wrapper = createWrapper({ highlightEmails: true })
      expect(wrapper.props('highlightEmails')).toBe(true)
    })
  })
})
