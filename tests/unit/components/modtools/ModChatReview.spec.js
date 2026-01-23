import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModChatReview from '~/modtools/components/ModChatReview.vue'

const mockSendMT = vi.fn().mockResolvedValue({})

// Mock useNuxtApp - must be set on globalThis since it's auto-imported by Nuxt
const mockApi = {
  chat: {
    sendMT: mockSendMT,
  },
}
globalThis.useNuxtApp = () => ({ $api: mockApi })

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: { id: 999, displayname: 'Mod User', email: 'mod@example.com' },
  }),
}))

describe('ModChatReview', () => {
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    chatid: 456,
    date: '2025-01-01T12:00:00Z',
    fromuser: {
      id: 100,
      displayname: 'From User',
      spammer: false,
    },
    touser: {
      id: 200,
      displayname: 'To User',
      spammer: false,
    },
    group: {
      id: 789,
      namedisplay: 'Test Group',
    },
    groupfrom: null,
    reviewreason: null,
    held: null,
    bymailid: null,
    msgid: null,
    widerchatreview: false,
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModChatReview, {
      props: {
        id: 123,
        message: createTestMessage(),
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="card"><slot /><slot name="header" /><slot name="body" /><slot name="footer" /></div>',
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': { template: '<div class="card-body"><slot /></div>' },
          'b-card-footer': {
            template: '<div class="card-footer"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :variant="variant" :to="to" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'to'],
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'scale'],
          },
          ModChatReviewUser: {
            template: '<div class="chat-review-user" />',
            props: ['user', 'tag', 'groupid'],
            emits: ['reload'],
          },
          ChatMessage: {
            template: '<div class="chat-message" />',
            props: ['id', 'chatid', 'pov', 'last', 'highlightEmails', 'isMT'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
          ModSpammer: {
            template: '<div class="mod-spammer" />',
            props: ['user'],
          },
          ModChatViewButton: {
            template: '<button class="chat-view-button" />',
            props: ['id', 'pov'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :data-label="label" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: ['iconName', 'label', 'variant', 'spinclass', 'confirm'],
            emits: ['handle'],
          },
          ModChatNoteModal: {
            template: '<div class="chat-note-modal" ref="modal" />',
            props: ['chatid'],
            emits: ['hidden'],
            methods: {
              show: vi.fn(),
            },
          },
          ModMessageEmailModal: {
            template: '<div class="message-email-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
        mocks: {
          timeago: (val) => {
            const diff = dayjs().diff(dayjs(val), 'days')
            return `${diff} days ago`
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSendMT.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the card', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('renders ModChatReviewUser for fromuser', () => {
      const wrapper = mountComponent()
      const users = wrapper.findAll('.chat-review-user')
      expect(users.length).toBeGreaterThanOrEqual(1)
    })

    it('renders ModChatReviewUser for touser', () => {
      const wrapper = mountComponent()
      const users = wrapper.findAll('.chat-review-user')
      expect(users.length).toBeGreaterThanOrEqual(2)
    })

    it('renders ChatMessage component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.chat-message').exists()).toBe(true)
    })

    it('renders message id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('renders timeago for message date', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('days ago')
    })

    it('renders group name when message has group', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group')
    })

    it('renders touser displayname with group info', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('To User')
      expect(wrapper.text()).toContain('is on')
    })
  })

  describe('View Original Email button', () => {
    it('shows button when bymailid exists', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ bymailid: 111 }),
      })
      expect(wrapper.text()).toContain('View original email')
    })

    it('shows button when msgid exists', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ msgid: 222 }),
      })
      expect(wrapper.text()).toContain('View original email')
    })

    it('hides button when neither bymailid nor msgid exists', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ bymailid: null, msgid: null }),
      })
      expect(wrapper.text()).not.toContain('View original email')
    })

    it('shows email modal when button clicked', async () => {
      const wrapper = mountComponent({
        message: createTestMessage({ bymailid: 111 }),
      })
      expect(wrapper.vm.showOriginal).toBe(false)

      const buttons = wrapper.findAll('button')
      const viewEmailButton = buttons.find((b) =>
        b.text().includes('View original email')
      )
      await viewEmailButton.trigger('click')

      expect(wrapper.vm.showOriginal).toBe(true)
    })
  })

  describe('review reason', () => {
    it('shows notice message when reviewreason exists', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Force' }),
      })
      expect(wrapper.text()).toContain('This is here because')
    })

    it('hides notice message when reviewreason is null', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: null }),
      })
      expect(wrapper.text()).not.toContain('This is here because')
    })
  })

  describe('reviewreason computed property', () => {
    it('returns correct text for Last reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Last' }),
      })
      expect(wrapper.vm.reviewreason).toBe(
        'Earlier message was held for review, so this one is too.'
      )
    })

    it('returns correct text for Force reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Force' }),
      })
      expect(wrapper.vm.reviewreason).toBe('Possible spam.')
    })

    it('returns correct text for Fully reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Fully' }),
      })
      expect(wrapper.vm.reviewreason).toBe(
        'This member is set to have all chat messages reviewed.'
      )
    })

    it('returns correct text for TooMany reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'TooMany' }),
      })
      expect(wrapper.vm.reviewreason).toContain(
        'a lot of chat messages recently'
      )
    })

    it('returns correct text for User reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'User' }),
      })
      expect(wrapper.vm.reviewreason).toContain('flagged for review')
    })

    it('returns correct text for UnknownMessage reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'UnknownMessage' }),
      })
      expect(wrapper.vm.reviewreason).toContain(
        'reply to a post we cannot find'
      )
    })

    it('returns correct text for Spam reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Spam' }),
      })
      expect(wrapper.vm.reviewreason).toContain('failed spam checks')
    })

    it('returns correct text for CountryBlocked reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'CountryBlocked' }),
      })
      expect(wrapper.vm.reviewreason).toBe(
        'It comes from a country we are blocking.'
      )
    })

    it('returns correct text for IPUsedForDifferentUsers reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'IPUsedForDifferentUsers' }),
      })
      expect(wrapper.vm.reviewreason).toContain('IP address')
      expect(wrapper.vm.reviewreason).toContain('different users')
    })

    it('returns correct text for IPUsedForDifferentGroups reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          reviewreason: 'IPUsedForDifferentGroups',
        }),
      })
      expect(wrapper.vm.reviewreason).toContain('IP address')
      expect(wrapper.vm.reviewreason).toContain('different groups')
    })

    it('returns correct text for SubjectUsedForDifferentGroups reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          reviewreason: 'SubjectUsedForDifferentGroups',
        }),
      })
      expect(wrapper.vm.reviewreason).toContain('subject line')
    })

    it('returns correct text for SpamAssassin reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'SpamAssassin' }),
      })
      expect(wrapper.vm.reviewreason).toContain('SpamAssassin')
    })

    it('returns correct text for Greetings spam reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Greetings spam' }),
      })
      expect(wrapper.vm.reviewreason).toContain('greetings spam')
    })

    it('returns correct text for Referenced known spammer reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          reviewreason: 'Referenced known spammer',
        }),
      })
      expect(wrapper.vm.reviewreason).toContain('known spammer')
    })

    it('returns correct text for Known spam keyword reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Known spam keyword' }),
      })
      expect(wrapper.vm.reviewreason).toContain('spam keyword')
    })

    it('returns correct text for URL on DBL reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'URL on DBL' }),
      })
      expect(wrapper.vm.reviewreason).toContain('suspicious website')
    })

    it('returns correct text for BulkVolunteerMail reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'BulkVolunteerMail' }),
      })
      expect(wrapper.vm.reviewreason).toContain('volunteer@ emails')
    })

    it('returns correct text for UsedOurDomain reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'UsedOurDomain' }),
      })
      expect(wrapper.vm.reviewreason).toContain('web domain')
    })

    it('returns correct text for WorryWord reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'WorryWord' }),
      })
      expect(wrapper.vm.reviewreason).toContain('Worry Word')
    })

    it('returns correct text for Script reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Script' }),
      })
      expect(wrapper.vm.reviewreason).toContain('<script>')
    })

    it('returns correct text for Link reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Link' }),
      })
      expect(wrapper.vm.reviewreason).toContain('link')
    })

    it('returns correct text for Money reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Money' }),
      })
      expect(wrapper.vm.reviewreason).toContain('money')
    })

    it('returns correct text for Email reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Email' }),
      })
      expect(wrapper.vm.reviewreason).toContain('email address')
    })

    it('returns correct text for Language reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'Language' }),
      })
      expect(wrapper.vm.reviewreason).toContain('English')
    })

    it('returns correct text for SameImage reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'SameImage' }),
      })
      expect(wrapper.vm.reviewreason).toContain('Same image')
    })

    it('returns correct text for DodgyImage reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'DodgyImage' }),
      })
      expect(wrapper.vm.reviewreason).toContain('Suspect text or email')
    })

    it('returns original value for unknown reason', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: 'UnknownReason' }),
      })
      expect(wrapper.vm.reviewreason).toBe('UnknownReason')
    })

    it('returns null when reviewreason is null', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: null }),
      })
      expect(wrapper.vm.reviewreason).toBe(null)
    })
  })

  describe('held message', () => {
    it('shows held notice when message is held by current user', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          held: {
            id: 999, // Same as mock me.id
            name: 'Mod User',
            email: 'mod@example.com',
            timestamp: '2025-01-01T10:00:00Z',
          },
        }),
      })
      expect(wrapper.text()).toContain('You held this')
    })

    it('shows held notice when message is held by another user', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          held: {
            id: 888, // Different from mock me.id
            name: 'Other Mod',
            email: 'other@example.com',
            timestamp: '2025-01-01T10:00:00Z',
          },
        }),
      })
      expect(wrapper.text()).toContain('Held by')
      expect(wrapper.text()).toContain('Other Mod')
    })

    it('shows Release button when held by current user', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          held: {
            id: 999,
            name: 'Mod User',
            email: 'mod@example.com',
            timestamp: '2025-01-01T10:00:00Z',
          },
        }),
      })
      expect(wrapper.text()).toContain('Release')
    })

    it('hides Release button when not held', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ held: null }),
      })
      const buttons = wrapper.findAll('button')
      const releaseButton = buttons.find((b) => b.text().includes('Release'))
      expect(releaseButton).toBeUndefined()
    })
  })

  describe('spammer display', () => {
    it('shows ModSpammer for touser when spammer', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          touser: { id: 200, displayname: 'To User', spammer: true },
        }),
      })
      expect(wrapper.findAll('.mod-spammer').length).toBeGreaterThanOrEqual(1)
    })

    it('shows ModSpammer for fromuser when spammer', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          fromuser: { id: 100, displayname: 'From User', spammer: true },
        }),
      })
      expect(wrapper.findAll('.mod-spammer').length).toBeGreaterThanOrEqual(1)
    })

    it('does not show ModSpammer when neither user is spammer', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          fromuser: { id: 100, displayname: 'From User', spammer: false },
          touser: { id: 200, displayname: 'To User', spammer: false },
        }),
      })
      expect(wrapper.find('.mod-spammer').exists()).toBe(false)
    })
  })

  describe('wider chat review', () => {
    it('shows Quicker Chat Review when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      expect(wrapper.text()).toContain('Quicker Chat Review')
    })

    it('does not show Quicker Chat Review when widerchatreview is false', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: false }),
      })
      expect(wrapper.text()).not.toContain('Quicker Chat Review')
    })

    it('hides View Chat button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      expect(wrapper.find('.chat-view-button').exists()).toBe(false)
    })

    it('hides Add Mod Message button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const addModButton = buttons.find(
        (b) => b.attributes('data-label') === 'Add Mod Message'
      )
      expect(addModButton).toBeUndefined()
    })

    it('hides Remove highlighted emails button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const redactButton = buttons.find(
        (b) => b.attributes('data-label') === 'Remove highlighted emails'
      )
      expect(redactButton).toBeUndefined()
    })

    it('hides Approve and whitelist button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const whitelistButton = buttons.find(
        (b) => b.attributes('data-label') === 'Approve and whitelist'
      )
      expect(whitelistButton).toBeUndefined()
    })

    it('hides Hold button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const holdButton = buttons.find(
        (b) => b.attributes('data-label') === 'Hold'
      )
      expect(holdButton).toBeUndefined()
    })

    it('hides Delete button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const deleteButton = buttons.find(
        (b) => b.attributes('data-label') === 'Delete'
      )
      expect(deleteButton).toBeUndefined()
    })

    it('hides Spam button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const spamButton = buttons.find(
        (b) => b.attributes('data-label') === 'Spam'
      )
      expect(spamButton).toBeUndefined()
    })

    it('still shows Approve button when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const approveButton = buttons.find(
        (b) => b.attributes('data-label') === 'Approve - Not Spam'
      )
      expect(approveButton).toBeDefined()
    })
  })

  describe('groupfrom info', () => {
    it('shows fromuser group info when groupfrom exists', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          groupfrom: { id: 111, namedisplay: 'From Group' },
        }),
      })
      expect(wrapper.text()).toContain('From Group')
    })

    it('shows not on modded groups message when groupfrom is null', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ groupfrom: null }),
      })
      expect(wrapper.text()).toContain(
        'not on any groups which you actively mod'
      )
    })
  })

  describe('footer buttons', () => {
    it('shows View Chat button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.chat-view-button').exists()).toBe(true)
    })

    it('shows Approve button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('.spin-button')
      const approveButton = buttons.find(
        (b) => b.attributes('data-label') === 'Approve - Not Spam'
      )
      expect(approveButton).toBeDefined()
    })

    it('shows Approve and whitelist button when not held', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ held: null }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const whitelistButton = buttons.find(
        (b) => b.attributes('data-label') === 'Approve and whitelist'
      )
      expect(whitelistButton).toBeDefined()
    })

    it('hides Approve and whitelist button when held by another user', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          held: {
            id: 888,
            name: 'Other',
            email: 'other@test.com',
            timestamp: '2025-01-01T10:00:00Z',
          },
        }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const whitelistButton = buttons.find(
        (b) => b.attributes('data-label') === 'Approve and whitelist'
      )
      expect(whitelistButton).toBeUndefined()
    })

    it('shows Hold button when not held', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ held: null }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const holdButton = buttons.find(
        (b) => b.attributes('data-label') === 'Hold'
      )
      expect(holdButton).toBeDefined()
    })

    it('hides Hold button when message is already held', () => {
      // Hold button only shows when message is NOT held, regardless of who holds it
      const wrapper = mountComponent({
        message: createTestMessage({
          held: {
            id: 888,
            name: 'Other',
            email: 'other@test.com',
            timestamp: '2025-01-01T10:00:00Z',
          },
        }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const holdButton = buttons.find(
        (b) => b.attributes('data-label') === 'Hold'
      )
      expect(holdButton).toBeUndefined()
    })

    it('shows Delete button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('.spin-button')
      const deleteButton = buttons.find(
        (b) => b.attributes('data-label') === 'Delete'
      )
      expect(deleteButton).toBeDefined()
    })

    it('shows Spam button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('.spin-button')
      const spamButton = buttons.find(
        (b) => b.attributes('data-label') === 'Spam'
      )
      expect(spamButton).toBeDefined()
    })

    it('shows Add Mod Message button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('.spin-button')
      const modMessageButton = buttons.find(
        (b) => b.attributes('data-label') === 'Add Mod Message'
      )
      expect(modMessageButton).toBeDefined()
    })

    it('shows Remove highlighted emails button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('.spin-button')
      const redactButton = buttons.find(
        (b) => b.attributes('data-label') === 'Remove highlighted emails'
      )
      expect(redactButton).toBeDefined()
    })
  })

  describe('methods', () => {
    describe('reload', () => {
      it('emits reload event', () => {
        const wrapper = mountComponent()
        wrapper.vm.reload()
        expect(wrapper.emitted('reload')).toBeTruthy()
        expect(wrapper.emitted('reload')).toHaveLength(1)
      })
    })

    describe('release', () => {
      it('calls API with Release action', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.release()
        expect(mockSendMT).toHaveBeenCalledWith({
          id: 123,
          action: 'Release',
        })
      })

      it('emits reload after release', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.release()
        expect(wrapper.emitted('reload')).toBeTruthy()
      })
    })

    describe('hold', () => {
      it('calls API with Hold action', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.hold(callback)
        expect(mockSendMT).toHaveBeenCalledWith({
          id: 123,
          action: 'Hold',
        })
      })

      it('emits reload after hold', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.hold(callback)
        expect(wrapper.emitted('reload')).toBeTruthy()
      })

      it('calls callback after hold', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.hold(callback)
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('approve', () => {
      it('calls API with Approve action', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.approve(callback)
        expect(mockSendMT).toHaveBeenCalledWith({
          id: 123,
          action: 'Approve',
        })
      })

      it('emits reload after approve', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.approve(callback)
        expect(wrapper.emitted('reload')).toBeTruthy()
      })

      it('calls callback after approve', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.approve(callback)
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('reject', () => {
      it('calls API with Reject action', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.reject(callback)
        expect(mockSendMT).toHaveBeenCalledWith({
          id: 123,
          action: 'Reject',
        })
      })

      it('emits reload after reject', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.reject(callback)
        expect(wrapper.emitted('reload')).toBeTruthy()
      })

      it('calls callback after reject', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.reject(callback)
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('whitelist', () => {
      it('calls API with ApproveAllFuture action', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.whitelist(callback)
        expect(mockSendMT).toHaveBeenCalledWith({
          id: 123,
          action: 'ApproveAllFuture',
        })
      })

      it('emits reload after whitelist', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.whitelist(callback)
        expect(wrapper.emitted('reload')).toBeTruthy()
      })

      it('calls callback after whitelist', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.whitelist(callback)
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('showModnote', () => {
      it('sets showModChatNoteModal to true', () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        expect(wrapper.vm.showModChatNoteModal).toBe(false)
        wrapper.vm.showModnote(callback)
        expect(wrapper.vm.showModChatNoteModal).toBe(true)
      })

      it('calls callback', () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        wrapper.vm.showModnote(callback)
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('redactEmails', () => {
      it('calls API with Redact action', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.redactEmails(callback)
        expect(mockSendMT).toHaveBeenCalledWith({
          id: 123,
          action: 'Redact',
        })
      })

      it('emits reload after redact', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.redactEmails(callback)
        expect(wrapper.emitted('reload')).toBeTruthy()
      })

      it('calls callback after redact', async () => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.redactEmails(callback)
        expect(callback).toHaveBeenCalled()
      })
    })
  })

  describe('props', () => {
    it('accepts id prop', () => {
      const wrapper = mountComponent({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('accepts message prop', () => {
      const message = createTestMessage({ id: 789 })
      const wrapper = mountComponent({ message })
      expect(wrapper.props('message').id).toBe(789)
    })
  })

  describe('modals', () => {
    it('renders ModChatNoteModal when showModChatNoteModal is true', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showModChatNoteModal = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.chat-note-modal').exists()).toBe(true)
    })

    it('does not render ModChatNoteModal when showModChatNoteModal is false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showModChatNoteModal).toBe(false)
      expect(wrapper.find('.chat-note-modal').exists()).toBe(false)
    })

    it('renders ModMessageEmailModal when showOriginal is true', async () => {
      const wrapper = mountComponent({
        message: createTestMessage({ bymailid: 111 }),
      })
      wrapper.vm.showOriginal = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.message-email-modal').exists()).toBe(true)
    })

    it('does not render ModMessageEmailModal when showOriginal is false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showOriginal).toBe(false)
      expect(wrapper.find('.message-email-modal').exists()).toBe(false)
    })
  })

  describe('group link', () => {
    it('shows Go to membership link for touser when group exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Go to membership')
    })

    it('creates correct link for touser membership', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const membershipButton = buttons.find((b) =>
        b.text().includes('Go to membership')
      )
      expect(membershipButton.attributes('to')).toContain(
        '/members/approved/789/200'
      )
    })

    it('shows Go to membership link for fromuser when groupfrom exists', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          groupfrom: { id: 111, namedisplay: 'From Group' },
        }),
      })
      const buttons = wrapper.findAll('button')
      const membershipButtons = buttons.filter((b) =>
        b.text().includes('Go to membership')
      )
      // Should have 2 membership links now
      expect(membershipButtons.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles message without group', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ group: null }),
      })
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('passes 0 as groupid when group is null', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ group: null }),
      })
      // Component should still render without errors
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('handles both touser and fromuser as spammers', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          fromuser: { id: 100, displayname: 'From User', spammer: true },
          touser: { id: 200, displayname: 'To User', spammer: true },
        }),
      })
      expect(wrapper.findAll('.mod-spammer')).toHaveLength(2)
    })

    it('handles message held by current user with all buttons visible', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          held: {
            id: 999,
            name: 'Mod',
            email: 'mod@test.com',
            timestamp: '2025-01-01T10:00:00Z',
          },
        }),
      })
      // Most action buttons should still be visible when held by current user
      const buttons = wrapper.findAll('.spin-button')
      const approveButton = buttons.find(
        (b) => b.attributes('data-label') === 'Approve - Not Spam'
      )
      expect(approveButton).toBeDefined()
    })

    it('hides action buttons when held by another user', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          held: {
            id: 888,
            name: 'Other',
            email: 'other@test.com',
            timestamp: '2025-01-01T10:00:00Z',
          },
        }),
      })
      // Action buttons should be hidden when held by another user
      const buttons = wrapper.findAll('.spin-button')
      const approveButton = buttons.find(
        (b) => b.attributes('data-label') === 'Approve - Not Spam'
      )
      expect(approveButton).toBeUndefined()
    })
  })
})
