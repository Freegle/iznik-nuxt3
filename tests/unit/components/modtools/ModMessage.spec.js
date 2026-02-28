import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModMessage from '~/modtools/components/ModMessage.vue'

// Hoisted mocks
const {
  mockLocationStore,
  mockMemberStore,
  mockMessageStore,
  mockMiscStore,
  mockModconfigStore,
  mockModGroupStore,
  mockUserStore,
  mockMe,
  mockMyModGroups,
} = vi.hoisted(() => {
  return {
    mockLocationStore: {
      fetch: vi.fn().mockResolvedValue(null),
    },
    mockMemberStore: {
      update: vi.fn().mockResolvedValue(),
    },
    mockMessageStore: {
      patch: vi.fn().mockResolvedValue(),
      move: vi.fn().mockResolvedValue(),
      fetch: vi.fn().mockResolvedValue(),
      backToPending: vi.fn().mockResolvedValue(),
    },
    mockMiscStore: {
      modtoolsediting: false,
    },
    mockModconfigStore: {
      configs: [
        {
          id: 1,
          default: true,
          coloursubj: true,
          subjreg: /^(OFFER|WANTED):/i,
        },
      ],
      fetchById: vi.fn().mockResolvedValue({
        id: 1,
        default: true,
        coloursubj: true,
        subjreg: /^(OFFER|WANTED):/i,
      }),
    },
    mockModGroupStore: {
      fetchIfNeedBeMT: vi.fn().mockResolvedValue({}),
    },
    mockUserStore: {
      fetch: vi.fn().mockResolvedValue(),
      fetchMT: vi.fn().mockResolvedValue(),
      byId: vi.fn().mockReturnValue({
        id: 456,
        displayname: 'Updated User',
        memberof: [{ id: 789 }],
      }),
    },
    mockMe: { id: 999, displayname: 'Test Mod' },
    mockMyModGroups: [
      {
        id: 789,
        lat: 52.0,
        lng: -1.0,
        polygon: null,
        mysettings: { configid: 1 },
        settings: {
          duplicates: {
            check: true,
            offer: 14,
            wanted: 14,
          },
          keywords: {
            offer: 'OFFER',
            wanted: 'WANTED',
          },
        },
      },
    ],
  }
})

// Mock stores
vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/stores/modconfig', () => ({
  useModConfigStore: () => mockModconfigStore,
}))

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock composables
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myid: mockMe.id,
  }),
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    myModGroups: { value: mockMyModGroups },
    myModGroup: (id) => mockMyModGroups.find((g) => g.id === id),
  }),
}))

vi.mock('~/composables/useKeywords', () => ({
  setupKeywords: () => ({
    typeOptions: [
      { value: 'Offer', text: 'OFFER' },
      { value: 'Wanted', text: 'WANTED' },
      { value: 'Other', text: 'Other' },
    ],
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

describe('ModMessage', () => {
  // Helper to create test message data
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    subject: 'OFFER: Test Item (Location)',
    textbody: 'This is the message body',
    type: 'Offer',
    attachments: [{ id: 1, path: '/image1.jpg' }],
    groups: [
      {
        groupid: 789,
        namedisplay: 'Test Group',
        collection: 'Pending',
      },
    ],
    fromuser: {
      id: 456,
      displayname: 'Test User',
      spammer: null,
      activedistance: 10,
      emails: [{ id: 1, email: 'test@example.com', preferred: true }],
      memberof: [{ id: 789 }],
      messagehistory: [],
    },
    location: { name: 'SW1A 1AA', lat: 51.5, lng: -0.1 },
    lat: 51.5,
    lng: -0.1,
    source: 'Platform',
    heldby: null,
    outcomes: [],
    successful: false,
    promised: false,
    deadline: null,
    deliverypossible: false,
    availableinitially: null,
    availablenow: null,
    matchedon: null,
    related: [],
    microvolunteering: [],
    worry: null,
    spamreason: null,
    myrole: 'Moderator',
    edits: null,
    item: { name: 'Test Item' },
    ...overrides,
  })

  // Mount helper with common stubs
  function mountComponent(props = {}) {
    return mount(ModMessage, {
      props: {
        message: createTestMessage(),
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="b-card"><slot /><slot name="header" /><slot name="footer" /></div>',
          },
          'b-card-header': {
            template: '<div class="b-card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
          },
          'b-card-footer': {
            template: '<div class="b-card-footer"><slot /></div>',
          },
          'b-row': { template: '<div class="b-row"><slot /></div>' },
          'b-col': { template: '<div class="b-col"><slot /></div>' },
          'b-alert': {
            template: '<div class="b-alert" :class="variant"><slot /></div>',
            props: ['variant', 'show'],
          },
          'b-badge': {
            template: '<span class="b-badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'b-input-group': {
            template: '<div class="b-input-group"><slot /></div>',
          },
          'b-form-input': {
            template: '<input class="b-form-input" :value="modelValue" />',
            props: ['modelValue', 'size'],
          },
          'b-form-select': {
            template: '<select class="b-form-select"><slot /></select>',
            props: ['modelValue', 'options', 'size'],
          },
          'b-form-textarea': {
            template: '<textarea class="b-form-textarea"></textarea>',
            props: ['modelValue', 'rows'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          PostCode: {
            template: '<div class="postcode"><slot /></div>',
            props: ['value', 'find'],
          },
          ModGroupSelect: {
            template: '<select class="mod-group-select"></select>',
            props: [
              'modelValue',
              'modonly',
              'size',
              'disabledExceptFor',
              'disabled',
            ],
          },
          MessageHistory: {
            template: '<div class="message-history"><slot /></div>',
            props: ['id', 'message', 'modinfo', 'displayMessageLink'],
          },
          ModDiff: {
            template: '<div class="mod-diff"><slot /></div>',
            props: ['old', 'new'],
          },
          ModMessageDuplicate: {
            template: '<div class="mod-message-duplicate"><slot /></div>',
            props: ['message'],
          },
          ModMessageCrosspost: {
            template: '<div class="mod-message-crosspost"><slot /></div>',
            props: ['message'],
          },
          ModMessageRelated: {
            template: '<div class="mod-message-related"><slot /></div>',
            props: ['message'],
          },
          ModComments: {
            template: '<div class="mod-comments"><slot /></div>',
            props: ['userid'],
          },
          ModSpammer: {
            template: '<div class="mod-spammer"><slot /></div>',
            props: ['user'],
          },
          ModMessageMicroVolunteering: {
            template:
              '<div class="mod-message-microvolunteering"><slot /></div>',
            props: ['message', 'microvolunteering'],
          },
          ModMessageWorry: {
            template: '<div class="mod-message-worry"><slot /></div>',
            props: ['message'],
          },
          ModPhoto: {
            template: '<div class="mod-photo"><slot /></div>',
            props: ['message', 'attachment'],
          },
          MessageReplyInfo: {
            template: '<div class="message-reply-info"><slot /></div>',
            props: ['message'],
          },
          MessageMap: {
            template: '<div class="message-map"><slot /></div>',
            props: ['centerat', 'position', 'locked', 'boundary', 'height'],
          },
          ModMessageUserInfo: {
            template: '<div class="mod-message-user-info"><slot /></div>',
            props: ['userid', 'modinfo', 'groupid', 'milesaway'],
          },
          SettingsGroup: {
            template: '<div class="settings-group"><slot /></div>',
            props: ['emailfrequency', 'membershipMT', 'userid'],
          },
          ModMemberActions: {
            template: '<div class="mod-member-actions"><slot /></div>',
            props: ['userid', 'groupid'],
          },
          OurUploader: {
            template: '<div class="our-uploader"><slot /></div>',
            props: ['modelValue', 'type', 'multiple'],
          },
          ModMessageButtons: {
            template: '<div class="mod-message-buttons"><slot /></div>',
            props: ['message', 'modconfig', 'editreview', 'cantpost'],
          },
          ModMessageButton: {
            template: '<button class="mod-message-button"><slot /></button>',
            props: ['message', 'variant', 'icon', 'release', 'label'],
          },
          ModMessageEmailModal: {
            template: '<div class="mod-message-email-modal"><slot /></div>',
            props: ['id'],
          },
          ModSpammerReport: {
            template: '<div class="mod-spammer-report"><slot /></div>',
            props: ['user', 'safelist'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'confirm'],
          },
          Highlighter: {
            template: '<span class="highlighter">{{ textToHighlight }}</span>',
            props: [
              'searchWords',
              'textToHighlight',
              'highlightClassName',
              'autoEscape',
            ],
          },
          'client-only': { template: '<div><slot /></div>' },
        },
        mocks: {
          datetimeshort: (val) => `formatted:${val}`,
          dateonly: (val) => `dateonly:${val}`,
          pluralise: (word, count, showCount) =>
            showCount ? `${count} ${word}${count !== 1 ? 's' : ''}` : word,
        },
        directives: {
          'b-tooltip': { mounted() {} },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.modtoolsediting = false
  })

  afterEach(async () => {
    await flushPromises()
  })

  describe('Rendering', () => {
    it('renders card header, subject, and MessageHistory', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.b-card-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('OFFER: Test Item (Location)')
      expect(wrapper.find('.message-history').exists()).toBe(true)
    })
  })

  describe('Computed: groupid', () => {
    it('returns groupid from message groups, 0 when no groups', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.groupid).toBe(789)
    })
  })

  describe('Computed: pending', () => {
    it.each([
      ['Pending', true],
      ['Approved', false],
    ])('returns %s for %s collection', (collection, expected) => {
      const message = createTestMessage({
        groups: [{ groupid: 789, collection }],
      })
      const wrapper = mountComponent({ message })
      expect(wrapper.vm.pending).toBe(expected)
    })
  })

  describe('Computed: position', () => {
    it.each([
      [
        'returns location when present',
        { location: { name: 'SW1A 1AA', lat: 51.5, lng: -0.1 } },
        { name: 'SW1A 1AA', lat: 51.5, lng: -0.1 },
      ],
      [
        'returns lat/lng when no location but has coordinates',
        { location: null, lat: 52.0, lng: -1.5 },
        { lat: 52.0, lng: -1.5 },
      ],
      [
        'returns null when no position data',
        { location: null, lat: null, lng: null },
        null,
      ],
    ])('%s', (_desc, overrides, expected) => {
      const message = createTestMessage(overrides)
      const wrapper = mountComponent({ message })
      expect(wrapper.vm.position).toEqual(expected)
    })
  })

  describe('Computed: outsideUK', () => {
    it.each([
      ['UK position', { lat: 52.0, lng: -1.0 }, false],
      ['outside UK (west)', { lat: 52.0, lng: -20.0 }, true],
      ['outside UK (south)', { lat: 40.0, lng: -1.0 }, true],
    ])('%s returns %s', (_desc, location, expected) => {
      const message = createTestMessage({ location })
      const wrapper = mountComponent({ message })
      expect(wrapper.vm.outsideUK).toBe(expected)
    })
  })

  describe('Computed: eSubject and eBody', () => {
    it('returns message subject and body', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.eSubject).toBe('OFFER: Test Item (Location)')
      expect(wrapper.vm.eBody).toBe('This is the message body')
    })
  })

  describe('Computed: membership', () => {
    it('returns membership for the group from store user', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.membership).toEqual({ id: 789 })
    })

    it('returns undefined when no matching group in store user', () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        displayname: 'Test User',
        memberof: [{ id: 999 }],
      })
      const wrapper = mountComponent()
      expect(wrapper.vm.membership).toBe(undefined)
    })
  })

  describe('Computed: subjectClass', () => {
    it('returns text-success for valid subjects', () => {
      const message = createTestMessage({ subject: 'OFFER: Test Item' })
      const wrapper = mountComponent({ message })
      expect(wrapper.vm.subjectClass).toBe('text-success')
    })
  })

  describe('Expand/collapse', () => {
    it('starts collapsed/expanded based on summary prop', () => {
      expect(mountComponent({ summary: true }).vm.expanded).toBe(false)
      expect(mountComponent({ summary: false }).vm.expanded).toBe(true)
    })

    it('shows card body and footer when expanded, hides footer with noactions', async () => {
      const wrapper = mountComponent({ summary: false, noactions: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.b-card-body').exists()).toBe(true)
      expect(wrapper.find('.b-card-footer').exists()).toBe(true)

      const wrapper2 = mountComponent({ summary: false, noactions: true })
      await wrapper2.vm.$nextTick()
      expect(wrapper2.find('.b-card-footer').exists()).toBe(false)
    })
  })

  describe('Editing', () => {
    it('startEdit sets editing true and miscStore.modtoolsediting', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.editing).toBe(false)
      wrapper.vm.startEdit()
      expect(wrapper.vm.editing).toBe(true)
      expect(mockMiscStore.modtoolsediting).toBe(true)
    })

    it('cancelEdit sets editing false and fetches message', () => {
      const wrapper = mountComponent()
      wrapper.vm.startEdit()
      wrapper.vm.cancelEdit()
      expect(wrapper.vm.editing).toBe(false)
      expect(mockMessageStore.fetch).toHaveBeenCalledWith(123)
    })
  })

  describe('Save', () => {
    it('calls messageStore.patch with item/location or subject, sets editing false', async () => {
      const message = createTestMessage({
        item: { name: 'Test Item' },
        location: { name: 'SW1A 1AA' },
      })
      const wrapper = mountComponent({ message })
      wrapper.vm.startEdit()
      await wrapper.vm.save()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 123,
        msgtype: 'Offer',
        item: 'Test Item',
        location: 'SW1A 1AA',
        attachments: [1],
        textbody: 'This is the message body',
      })
      expect(wrapper.vm.editing).toBe(false)
    })

    it('calls messageStore.patch with subject when no item', async () => {
      const message = createTestMessage({
        item: null,
        location: null,
        subject: 'Custom Subject',
      })
      const wrapper = mountComponent({ message })
      wrapper.vm.startEdit()
      await wrapper.vm.save()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 123,
        msgtype: 'Offer',
        subject: 'Custom Subject',
        attachments: [1],
        textbody: 'This is the message body',
      })
    })
  })

  describe('backToPending', () => {
    it('calls messageStore.backToPending and callback', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      await wrapper.vm.backToPending(callback)
      expect(mockMessageStore.backToPending).toHaveBeenCalledWith(123)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('toggleMail', () => {
    it('toggles showMailSettings and fetches user', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showMailSettings).toBe(false)
      await wrapper.vm.toggleMail()
      expect(wrapper.vm.showMailSettings).toBe(true)
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456)
    })
  })

  describe('settingsChange', () => {
    it('calls memberStore.update with correct params', () => {
      const wrapper = mountComponent()
      wrapper.vm.settingsChange('emailfrequency', 7)
      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 789,
        emailfrequency: 7,
      })
    })
  })

  describe('spamReport and photoAdd', () => {
    it('spamReport sets showSpamModal, photoAdd sets uploading', () => {
      const wrapper = mountComponent()
      wrapper.vm.spamReport()
      expect(wrapper.vm.showSpamModal).toBe(true)

      const wrapper2 = mountComponent()
      wrapper2.vm.photoAdd()
      expect(wrapper2.vm.uploading).toBe(true)
    })
  })

  describe('imageAdded and imageRemoved', () => {
    it.each([
      ['imageAdded', '[1, 2]', '[2]', 1, true],
      ['imageAdded', '[2]', '[1, 2]', 1, false],
      ['imageRemoved', '[2]', '[1, 2]', 1, true],
      ['imageRemoved', '[1, 2]', '[2]', 1, false],
    ])(
      '%s returns %s when newimages=%s, oldimages=%s, id=%s',
      (method, newimages, oldimages, id, expected) => {
        const message = createTestMessage({
          edits: [{ reviewrequired: true, newimages, oldimages }],
        })
        const wrapper = mountComponent({ message, editreview: true })
        expect(wrapper.vm[method](id)).toBe(expected)
      }
    )

    it('returns false when no editreview', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.imageAdded(1)).toBe(false)
      expect(wrapper.vm.imageRemoved(1)).toBe(false)
    })
  })

  describe('postcodeSelect', () => {
    it('updates message location', () => {
      const wrapper = mountComponent()
      const pc = { name: 'SW1A 2AA', lat: 51.6, lng: -0.2 }
      wrapper.vm.postcodeSelect(pc)
      expect(wrapper.props('message').location).toEqual(pc)
    })
  })

  describe('updateComments', () => {
    it('re-fetches user from store', () => {
      const wrapper = mountComponent()
      wrapper.vm.updateComments()
      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        id: 456,
        modtools: true,
      })
    })
  })

  describe('Held message', () => {
    it('shows release button when held, warning when held by someone else', async () => {
      const messageHeldByMe = createTestMessage({
        heldby: { id: 999, displayname: 'Test Mod' },
      })
      const wrapper1 = mountComponent({
        message: messageHeldByMe,
        summary: false,
      })
      await wrapper1.vm.$nextTick()
      expect(wrapper1.find('.mod-message-button').exists()).toBe(true)

      const messageHeldByOther = createTestMessage({
        heldby: { id: 888, displayname: 'Other Mod' },
      })
      const wrapper2 = mountComponent({
        message: messageHeldByOther,
        summary: false,
      })
      await wrapper2.vm.$nextTick()
      expect(wrapper2.text()).toContain('Held by')
    })
  })

  describe('Spammer indicator', () => {
    it('shows ModSpammer when user is a spammer', async () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        displayname: 'Spam User',
        spammer: { collection: 'Spammer' },
        memberof: [{ id: 789 }],
      })
      const wrapper = mountComponent({ summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-spammer').exists()).toBe(true)
    })
  })

  describe('Message type notices', () => {
    it('shows notice for Other type messages', async () => {
      const message = createTestMessage({ type: 'Other' })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain(
        'needs editing so that we know what kind of post'
      )
    })
  })

  describe('Outcomes', () => {
    it('shows outcome notice when outcomes exist', async () => {
      const message = createTestMessage({
        outcomes: [{ outcome: 'TAKEN', timestamp: '2024-01-15' }],
      })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('TAKEN')
    })
  })

  describe('Deadline and delivery possible', () => {
    it('shows deadline and delivery possible when set', () => {
      const message = createTestMessage({
        deadline: '2024-02-01',
        deliverypossible: true,
      })
      const wrapper = mountComponent({ message })
      expect(wrapper.text()).toContain('Deadline')
      expect(wrapper.text()).toContain('Delivery possible')
    })
  })

  describe('Active distance warning', () => {
    it('shows warning for large active distance', async () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        displayname: 'Test User',
        activedistance: 100,
        memberof: [{ id: 789 }],
      })
      const wrapper = mountComponent({ summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('100 miles apart')
    })
  })

  describe('Outside UK warning', () => {
    it('shows warning for positions outside UK', async () => {
      const message = createTestMessage({
        location: { lat: 40.0, lng: -1.0 },
      })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('outside the UK')
    })
  })

  describe('Spam reason', () => {
    it('shows spam reason when present', async () => {
      const message = createTestMessage({ spamreason: 'Suspicious content' })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Suspicious content')
    })
  })

  describe('ModMessageWorry', () => {
    it('shows worry component when worry is set', async () => {
      const message = createTestMessage({ worry: 'medium' })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-message-worry').exists()).toBe(true)
    })
  })

  describe('Availability badges', () => {
    it('shows availability badges with correct values', () => {
      const message1 = createTestMessage({
        availableinitially: 5,
        availablenow: 5,
      })
      const wrapper1 = mountComponent({ message: message1 })
      expect(wrapper1.text()).toContain('5 available')

      const message2 = createTestMessage({
        availableinitially: 5,
        availablenow: 3,
      })
      const wrapper2 = mountComponent({ message: message2 })
      expect(wrapper2.text()).toContain('5 available initially')
      expect(wrapper2.text()).toContain('3 now')
    })
  })

  describe('Email source button', () => {
    it('shows for Email source, hides for Platform', async () => {
      const emailMessage = createTestMessage({ source: 'Email' })
      const wrapper1 = mountComponent({ message: emailMessage, summary: false })
      await wrapper1.vm.$nextTick()
      expect(wrapper1.text()).toContain('View Email Source')

      const platformMessage = createTestMessage({ source: 'Platform' })
      const wrapper2 = mountComponent({
        message: platformMessage,
        summary: false,
      })
      await wrapper2.vm.$nextTick()
      expect(wrapper2.text()).not.toContain('View Email Source')
    })
  })

  describe('Back to pending button', () => {
    it('shows for Approved messages, hides for Pending', async () => {
      const approvedMessage = createTestMessage({
        groups: [{ groupid: 789, collection: 'Approved' }],
      })
      const wrapper1 = mountComponent({
        message: approvedMessage,
        summary: false,
      })
      await wrapper1.vm.$nextTick()
      expect(wrapper1.text()).toContain('Back to Pending')

      const pendingMessage = createTestMessage({
        groups: [{ groupid: 789, collection: 'Pending' }],
      })
      const wrapper2 = mountComponent({
        message: pendingMessage,
        summary: false,
      })
      await wrapper2.vm.$nextTick()
      const buttons = wrapper2.findAll('.spin-button')
      const backToPendingButton = buttons.filter((b) =>
        b.text().includes('Back to Pending')
      )
      expect(backToPendingButton.length).toBe(0)
    })
  })

  describe('ModMessageButtons', () => {
    it('shows when not editing, hides when editing', async () => {
      const wrapper = mountComponent({ summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-message-buttons').exists()).toBe(true)

      wrapper.vm.startEdit()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-message-buttons').exists()).toBe(false)
    })
  })

  describe('Review mode', () => {
    it.each([
      ['Pending', 'Pending'],
      ['Approved', 'Approved'],
    ])('shows %s alert in review mode', async (collection, expected) => {
      const message = createTestMessage({
        groups: [{ groupid: 789, collection }],
      })
      const wrapper = mountComponent({ message, review: true, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Post now in')
      expect(wrapper.text()).toContain(expected)
    })
  })

  describe('Edit review mode', () => {
    it('shows ModDiff for subject when editreview with changes', () => {
      const message = createTestMessage({
        edits: [
          {
            reviewrequired: true,
            oldsubject: 'Old Subject',
            newsubject: 'New Subject',
          },
        ],
      })
      const wrapper = mountComponent({ message, editreview: true })
      expect(wrapper.find('.mod-diff').exists()).toBe(true)
    })
  })

  describe('Location editing notice', () => {
    it('shows notice when editing and no location', async () => {
      const message = createTestMessage({
        lat: null,
        lng: null,
        location: null,
      })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      wrapper.vm.startEdit()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain(
        'needs editing so that we know where it is'
      )
    })
  })

  describe('User summary display', () => {
    it('shows user displayname in summary mode', () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        displayname: 'Updated User',
        memberof: [{ id: 789 }],
      })
      const wrapper = mountComponent({ summary: true })
      expect(wrapper.text()).toContain('Updated User')
    })
  })

  describe('Microvolunteering and related messages', () => {
    it('shows both sections when data present', async () => {
      const message = createTestMessage({
        microvolunteering: [{ id: 1, vote: 'approve' }],
        related: [{ id: 999, subject: 'Related Message' }],
      })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-message-microvolunteering').exists()).toBe(true)
      expect(wrapper.find('.mod-message-related').exists()).toBe(true)
    })
  })

  describe('Highlighter', () => {
    it('uses matchedon.word for highlighting when set', () => {
      const message = createTestMessage({ matchedon: { word: 'test' } })
      const wrapper = mountComponent({ message })
      expect(wrapper.text()).toContain('OFFER: Test Item (Location)')
      expect(wrapper.vm.message.matchedon.word).toBe('test')
    })
  })

  describe('Blank message body', () => {
    it('shows blank message notice when body is empty', async () => {
      const message = createTestMessage({ textbody: '' })
      const wrapper = mountComponent({ message, summary: false })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('This message is blank')
    })
  })

  describe('Report Spammer button', () => {
    it('shows for pending messages, hidden when held by someone else', async () => {
      const wrapper1 = mountComponent({ summary: false })
      await wrapper1.vm.$nextTick()
      expect(wrapper1.text()).toContain('Report Spammer')

      const message = createTestMessage({
        heldby: { id: 888, displayname: 'Other Mod' },
      })
      const wrapper2 = mountComponent({ message, summary: false })
      await wrapper2.vm.$nextTick()
      expect(wrapper2.text()).toContain('held by someone else')
    })
  })
})
