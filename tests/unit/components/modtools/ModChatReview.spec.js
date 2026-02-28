import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModChatReview from '~/modtools/components/ModChatReview.vue'

const mockSendMT = vi.fn().mockResolvedValue({})

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

vi.mock('~/modtools/composables/useModMe', () => ({
  useModMe: () => ({
    checkWork: vi.fn(),
  }),
}))

describe('ModChatReview', () => {
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    chatid: 456,
    date: '2025-01-01T12:00:00Z',
    fromuser: { id: 100, displayname: 'From User', spammer: false },
    touser: { id: 200, displayname: 'To User', spammer: false },
    group: { id: 789, namedisplay: 'Test Group' },
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
            methods: { show: vi.fn() },
          },
          ModMessageEmailModal: {
            template: '<div class="message-email-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
        mocks: {
          timeago: (val) => `${dayjs().diff(dayjs(val), 'days')} days ago`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSendMT.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders card with message details, users, and ChatMessage', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
      expect(
        wrapper.findAll('.chat-review-user').length
      ).toBeGreaterThanOrEqual(2)
      expect(wrapper.find('.chat-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('123')
      expect(wrapper.text()).toContain('days ago')
      expect(wrapper.text()).toContain('Test Group')
      expect(wrapper.text()).toContain('To User')
    })
  })

  describe('View Original Email button', () => {
    it('shows when bymailid or msgid exists, hides when neither', () => {
      expect(
        mountComponent({ message: createTestMessage({ bymailid: 111 }) }).text()
      ).toContain('View original email')
      expect(
        mountComponent({ message: createTestMessage({ msgid: 222 }) }).text()
      ).toContain('View original email')
      expect(
        mountComponent({
          message: createTestMessage({ bymailid: null, msgid: null }),
        }).text()
      ).not.toContain('View original email')
    })

    it('shows email modal when button clicked', async () => {
      const wrapper = mountComponent({
        message: createTestMessage({ bymailid: 111 }),
      })
      expect(wrapper.vm.showOriginal).toBe(false)
      const viewEmailButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('View original email'))
      await viewEmailButton.trigger('click')
      expect(wrapper.vm.showOriginal).toBe(true)
    })
  })

  describe('review reason notice', () => {
    it('shows notice when reviewreason exists, hides when null', () => {
      expect(
        mountComponent({
          message: createTestMessage({ reviewreason: 'Force' }),
        }).text()
      ).toContain('This is here because')
      expect(
        mountComponent({
          message: createTestMessage({ reviewreason: null }),
        }).text()
      ).not.toContain('This is here because')
    })
  })

  describe('reviewreason computed property', () => {
    it.each([
      ['Last', 'Earlier message was held for review'],
      ['Force', 'Possible spam'],
      ['Fully', 'all chat messages reviewed'],
      ['TooMany', 'a lot of chat messages recently'],
      ['User', 'flagged for review'],
      ['UnknownMessage', 'reply to a post we cannot find'],
      ['Spam', 'failed spam checks'],
      ['CountryBlocked', 'country we are blocking'],
      ['IPUsedForDifferentUsers', 'IP address'],
      ['IPUsedForDifferentGroups', 'IP address'],
      ['SubjectUsedForDifferentGroups', 'subject line'],
      ['SpamAssassin', 'SpamAssassin'],
      ['Greetings spam', 'greetings spam'],
      ['Referenced known spammer', 'known spammer'],
      ['Known spam keyword', 'spam keyword'],
      ['URL on DBL', 'suspicious website'],
      ['BulkVolunteerMail', 'volunteer@ emails'],
      ['UsedOurDomain', 'web domain'],
      ['WorryWord', 'Worry Word'],
      ['Script', '<script>'],
      ['Link', 'link'],
      ['Money', 'money'],
      ['Email', 'email address'],
      ['Language', 'English'],
      ['SameImage', 'Same image'],
      ['DodgyImage', 'Suspect text or email'],
    ])('returns correct text for %s reason', (reason, expectedText) => {
      const wrapper = mountComponent({
        message: createTestMessage({ reviewreason: reason }),
      })
      expect(wrapper.vm.reviewreason).toContain(expectedText)
    })

    it('returns original value for unknown reason, null when null', () => {
      expect(
        mountComponent({
          message: createTestMessage({ reviewreason: 'UnknownReason' }),
        }).vm.reviewreason
      ).toBe('UnknownReason')
      expect(
        mountComponent({
          message: createTestMessage({ reviewreason: null }),
        }).vm.reviewreason
      ).toBe(null)
    })
  })

  describe('held message', () => {
    const heldByMe = {
      id: 999,
      name: 'Mod User',
      email: 'mod@example.com',
      timestamp: '2025-01-01T10:00:00Z',
    }
    const heldByOther = {
      id: 888,
      name: 'Other Mod',
      email: 'other@example.com',
      timestamp: '2025-01-01T10:00:00Z',
    }

    it('shows held notice with correct text and Release button based on who held it', () => {
      const heldByMeWrapper = mountComponent({
        message: createTestMessage({ held: heldByMe }),
      })
      expect(heldByMeWrapper.text()).toContain('You held this')
      expect(heldByMeWrapper.text()).toContain('Release')

      const heldByOtherWrapper = mountComponent({
        message: createTestMessage({ held: heldByOther }),
      })
      expect(heldByOtherWrapper.text()).toContain('Held by')
      expect(heldByOtherWrapper.text()).toContain('Other Mod')

      const notHeldWrapper = mountComponent({
        message: createTestMessage({ held: null }),
      })
      const releaseButton = notHeldWrapper
        .findAll('button')
        .find((b) => b.text().includes('Release'))
      expect(releaseButton).toBeUndefined()
    })
  })

  describe('spammer display', () => {
    it('shows ModSpammer for spammer users, hides when neither is spammer', () => {
      expect(
        mountComponent({
          message: createTestMessage({
            touser: { id: 200, displayname: 'To User', spammer: true },
          }),
        }).findAll('.mod-spammer').length
      ).toBeGreaterThanOrEqual(1)

      expect(
        mountComponent({
          message: createTestMessage({
            fromuser: { id: 100, displayname: 'From User', spammer: true },
          }),
        }).findAll('.mod-spammer').length
      ).toBeGreaterThanOrEqual(1)

      expect(
        mountComponent({
          message: createTestMessage({
            fromuser: { id: 100, displayname: 'From User', spammer: false },
            touser: { id: 200, displayname: 'To User', spammer: false },
          }),
        })
          .find('.mod-spammer')
          .exists()
      ).toBe(false)
    })
  })

  describe('wider chat review', () => {
    it('shows Quicker Chat Review and hides most buttons when widerchatreview is true', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: true }),
      })
      expect(wrapper.text()).toContain('Quicker Chat Review')
      expect(wrapper.find('.chat-view-button').exists()).toBe(false)

      const buttons = wrapper.findAll('.spin-button')
      const hiddenLabels = [
        'Add Mod Message',
        'Remove highlighted emails',
        'Approve and whitelist',
        'Hold',
        'Delete',
        'Spam',
      ]
      hiddenLabels.forEach((label) => {
        expect(
          buttons.find((b) => b.attributes('data-label') === label)
        ).toBeUndefined()
      })

      // Approve button should still be visible
      expect(
        buttons.find((b) => b.attributes('data-label') === 'Approve - Not Spam')
      ).toBeDefined()
    })

    it('shows all buttons when widerchatreview is false', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ widerchatreview: false }),
      })
      expect(wrapper.text()).not.toContain('Quicker Chat Review')
      expect(wrapper.find('.chat-view-button').exists()).toBe(true)
    })
  })

  describe('groupfrom info', () => {
    it('shows group info when groupfrom exists, otherwise shows not modded message', () => {
      expect(
        mountComponent({
          message: createTestMessage({
            groupfrom: { id: 111, namedisplay: 'From Group' },
          }),
        }).text()
      ).toContain('From Group')

      expect(
        mountComponent({
          message: createTestMessage({ groupfrom: null }),
        }).text()
      ).toContain('not on any groups which you actively mod')
    })
  })

  describe('footer buttons', () => {
    it('shows all action buttons when not held and not widerchatreview', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ held: null, widerchatreview: false }),
      })
      const buttons = wrapper.findAll('.spin-button')
      const expectedLabels = [
        'Approve - Not Spam',
        'Approve and whitelist',
        'Hold',
        'Delete',
        'Spam',
        'Add Mod Message',
        'Remove highlighted emails',
      ]
      expectedLabels.forEach((label) => {
        expect(
          buttons.find((b) => b.attributes('data-label') === label)
        ).toBeDefined()
      })
      expect(wrapper.find('.chat-view-button').exists()).toBe(true)
    })

    it('hides Hold when already held, hides whitelist when held by another', () => {
      const heldByOther = {
        id: 888,
        name: 'Other',
        email: 'other@test.com',
        timestamp: '2025-01-01T10:00:00Z',
      }
      const wrapper = mountComponent({
        message: createTestMessage({ held: heldByOther }),
      })
      const buttons = wrapper.findAll('.spin-button')
      expect(
        buttons.find((b) => b.attributes('data-label') === 'Hold')
      ).toBeUndefined()
      expect(
        buttons.find(
          (b) => b.attributes('data-label') === 'Approve and whitelist'
        )
      ).toBeUndefined()
    })
  })

  describe('methods', () => {
    it('reload emits reload event', () => {
      const wrapper = mountComponent()
      wrapper.vm.reload()
      expect(wrapper.emitted('reload')).toBeTruthy()
    })

    it.each([
      ['release', 'Release'],
      ['hold', 'Hold'],
      ['approve', 'Approve'],
      ['reject', 'Reject'],
      ['whitelist', 'ApproveAllFuture'],
      ['redactEmails', 'Redact'],
    ])(
      '%s calls API with %s action, emits reload, calls callback',
      async (method, action) => {
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm[method](callback)
        expect(mockSendMT).toHaveBeenCalledWith({ id: 123, action })
        expect(wrapper.emitted('reload')).toBeTruthy()
        if (method !== 'release') {
          expect(callback).toHaveBeenCalled()
        }
      }
    )

    it('showModnote sets showModChatNoteModal to true and calls callback', () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      expect(wrapper.vm.showModChatNoteModal).toBe(false)
      wrapper.vm.showModnote(callback)
      expect(wrapper.vm.showModChatNoteModal).toBe(true)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('modals', () => {
    it('renders ModChatNoteModal and ModMessageEmailModal based on state', async () => {
      const wrapper = mountComponent({
        message: createTestMessage({ bymailid: 111 }),
      })
      expect(wrapper.find('.chat-note-modal').exists()).toBe(false)
      expect(wrapper.find('.message-email-modal').exists()).toBe(false)

      wrapper.vm.showModChatNoteModal = true
      wrapper.vm.showOriginal = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.chat-note-modal').exists()).toBe(true)
      expect(wrapper.find('.message-email-modal').exists()).toBe(true)
    })
  })

  describe('group link', () => {
    it('shows membership links with correct routes', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Go to membership')
      const membershipButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Go to membership'))
      expect(membershipButton.attributes('to')).toContain(
        '/members/approved/789/200'
      )

      const wrapperWithGroupfrom = mountComponent({
        message: createTestMessage({
          groupfrom: { id: 111, namedisplay: 'From Group' },
        }),
      })
      const membershipButtons = wrapperWithGroupfrom
        .findAll('button')
        .filter((b) => b.text().includes('Go to membership'))
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

    it('handles both touser and fromuser as spammers', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          fromuser: { id: 100, displayname: 'From User', spammer: true },
          touser: { id: 200, displayname: 'To User', spammer: true },
        }),
      })
      expect(wrapper.findAll('.mod-spammer')).toHaveLength(2)
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
      const approveButton = wrapper
        .findAll('.spin-button')
        .find((b) => b.attributes('data-label') === 'Approve - Not Spam')
      expect(approveButton).toBeUndefined()
    })
  })
})
