import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterAll,
  beforeAll,
} from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import ModStdMessageModal from '~/modtools/components/ModStdMessageModal.vue'

// Store original console.warn to restore after each test
// The global setup throws on Vue warnings, but this component uses template refs on stubs
// which produces unavoidable warnings in test environment
const originalConsoleWarn = console.warn

beforeAll(() => {
  // Temporarily replace console.warn to not throw on Vue warnings for template refs
  // and for the SpinButton event emission handling quirk
  console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : ''
    // Allow template ref warnings through without throwing
    if (message.includes('Template ref')) {
      return
    }
    // Allow the callWithAsyncErrorHandling warning - this occurs when testing
    // event handlers that receive function arguments (like SpinButton's @handle)
    if (message.includes('callWithAsyncErrorHandling')) {
      return
    }
    // Re-throw other Vue warnings
    if (message.includes('[Vue warn]')) {
      throw new Error(
        `Vue warning should not occur in tests: ${args.join(' ')}`
      )
    }
    originalConsoleWarn.apply(console, args)
  }
})

afterAll(() => {
  // Restore original console.warn
  console.warn = originalConsoleWarn
})

// Mock stores
const mockModGroupStore = {
  fetchIfNeedBeMT: vi.fn(),
  get: vi.fn(),
}

const mockMessageStore = {
  approve: vi.fn(),
  reject: vi.fn(),
  reply: vi.fn(),
  delete: vi.fn(),
  hold: vi.fn(),
  patch: vi.fn(),
}

const mockMemberStore = {
  reply: vi.fn(),
  delete: vi.fn(),
}

const mockUserStore = {
  edit: vi.fn(),
}

const mockHide = vi.fn()
const mockShow = vi.fn()

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: ref({ id: 999, displayname: 'Mod User' }),
  }),
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    checkWorkDeferGetMessages: vi.fn(),
  }),
}))

vi.mock('~/composables/useKeywords', () => ({
  setupKeywords: () => ({
    typeOptions: [
      { value: 'Offer', text: 'Offer' },
      { value: 'Wanted', text: 'Wanted' },
    ],
  }),
}))

vi.mock('~/constants', () => ({
  SUBJECT_REGEX: /^(Offer|Wanted): (.+) \((.+)\)$/i,
}))

describe('ModStdMessageModal', () => {
  const createMessage = (overrides = {}) => ({
    id: 101,
    subject: 'Offer: Test item (Location)',
    textbody: 'This is the message body.',
    fromuser: {
      id: 456,
      userid: 456,
      displayname: 'Test User',
      emails: [
        { email: 'test@example.com', preferred: true },
        { email: 'user@users.ilovefreegle.org', preferred: false },
      ],
    },
    groups: [{ groupid: 123 }],
    type: 'Offer',
    item: { name: 'Test item' },
    location: { name: 'Location' },
    ...overrides,
  })

  const createMember = (overrides = {}) => ({
    userid: 789,
    id: 789,
    displayname: 'Member User',
    email: 'member@example.com',
    groupid: 123,
    joincomment: 'Joined to post offers',
    ...overrides,
  })

  const createStdmsg = (overrides = {}) => ({
    id: 1,
    action: 'Approve',
    title: 'Standard Approve',
    body: 'Thank you for your post.',
    subjpref: 'Re:',
    subjsuff: '',
    insert: 'Top',
    newmodstatus: 'UNCHANGED',
    newdelstatus: 'UNCHANGED',
    edittext: null,
    ...overrides,
  })

  function mountComponent(props = {}) {
    // Mock getElementById for modal movement methods
    const mockElement = { style: {} }
    vi.spyOn(window.document, 'getElementById').mockReturnValue(mockElement)

    return shallowMount(ModStdMessageModal, {
      props: {
        stdmsg: createStdmsg(),
        message: createMessage(),
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal" :title="title"><slot name="default" /><slot name="footer" /></div>',
            props: ['title', 'id', 'noStacking', 'noCloseOnBackdrop', 'size'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" :rows="rows" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue', 'options', 'size'],
          },
          'b-input-group': {
            template: '<div class="input-group"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
          NoticeMessage: {
            template: '<div class="notice" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          SpinButton: {
            name: 'SpinButton',
            template:
              '<button class="spin-button" :data-label="label"><slot /></button>',
            props: [
              'label',
              'iconName',
              'spinclass',
              'variant',
              'flex',
              'iconClass',
            ],
            emits: ['handle'],
          },
          PostCode: {
            template: '<input class="postcode" :value="value" />',
            props: ['value', 'find'],
            emits: ['selected'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockModGroupStore.get.mockReturnValue({
      id: 123,
      namedisplay: 'Test Group',
      modsemail: 'mods@testgroup.org',
      groupemail: 'group@testgroup.org',
      url: 'https://test.ilovefreegle.org',
      membercount: 1000,
      modcount: 5,
      settings: {
        reposts: { offer: 7, wanted: 14 },
      },
    })
    mockModGroupStore.fetchIfNeedBeMT.mockResolvedValue({})
    mockMessageStore.approve.mockResolvedValue({})
    mockMessageStore.reject.mockResolvedValue({})
    mockMessageStore.reply.mockResolvedValue({})
    mockMessageStore.delete.mockResolvedValue({})
    mockMessageStore.hold.mockResolvedValue({})
    mockMessageStore.patch.mockResolvedValue({})
    mockMemberStore.reply.mockResolvedValue({})
    mockMemberStore.delete.mockResolvedValue({})
    mockUserStore.edit.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders modal with correct structure and content', () => {
      const wrapper = mountComponent()
      // Title contains subject
      expect(wrapper.find('.modal').attributes('title')).toContain(
        'Offer: Test item (Location)'
      )
      // From/To fields for non-Edit actions
      expect(wrapper.text()).toContain('From:')
      expect(wrapper.text()).toContain('To:')
      // Mod displayname in From field
      expect(wrapper.text()).toContain('Mod User')
      // User displayname in To field
      expect(wrapper.text()).toContain('Test User')
      // User email shown, but not ilovefreegle email
      expect(wrapper.text()).toContain('test@example.com')
      expect(wrapper.text()).not.toContain('users.ilovefreegle.org')
      // Form elements exist
      expect(wrapper.find('input').exists()).toBe(true)
      expect(wrapper.find('textarea').exists()).toBe(true)
      // Cancel button
      expect(wrapper.text()).toContain('Cancel')
    })
  })

  describe('processLabel computed', () => {
    it.each([
      ['Approve', 'Send and Approve'],
      ['Approve Member', 'Send and Approve'],
      ['Reject', 'Send and Reject'],
      ['Leave', 'Send and Leave'],
      ['Delete', 'Send and Delete'],
      ['Edit', 'Save Edit'],
      ['Hold Message', 'Send and Hold'],
      ['Unknown', 'Send'],
    ])('returns correct label for %s action', (action, expected) => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action }),
      })
      expect(wrapper.vm.processLabel).toBe(expected)
    })
  })

  describe('modstatus computed', () => {
    it.each([
      ['UNCHANGED', 'Unchanged'],
      ['MODERATED', 'Moderated'],
      ['DEFAULT', 'Group Settings'],
      ['PROHIBITED', "Can't Post"],
    ])('returns correct display text for %s status', (status, expected) => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newmodstatus: status }),
      })
      expect(wrapper.vm.modstatus).toBe(expected)
    })
  })

  describe('emailfrequency computed', () => {
    it.each([
      ['DIGEST', 24],
      ['NONE', 0],
      ['SINGLE', -1],
      ['ANNOUNCEMENT', 0],
    ])(
      'returns correct frequency for %s delivery status',
      (status, expected) => {
        const wrapper = mountComponent({
          stdmsg: createStdmsg({ newdelstatus: status }),
        })
        expect(wrapper.vm.emailfrequency).toBe(expected)
      }
    )
  })

  describe('warning computed', () => {
    it.each([
      ['Please use Yahoo Groups', 'Yahoo Groups'],
      ['Use the republisher tool', 'Republisher'],
      ['Try the messagemaker', 'Message Maker'],
      ['Visit the cafe section', 'ChitChat'],
      ['Post to the newsfeed', 'ChitChat'],
      ['Use freegledirect', 'Freegle Direct'],
      ['Visit www.freegle.in', "won't work with the www"],
      ['Visit http://example.com', 'https://'],
    ])('warns about deprecated terms in: %s', async (body, expectedWarning) => {
      const wrapper = mountComponent()
      wrapper.vm.body = body
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain(expectedWarning)
    })

    it.each([
      ['This is a clean message'],
      ['Contact me at user@yahoo.com'], // @yahoo in email is OK
    ])('returns null for valid content: %s', async (body) => {
      const wrapper = mountComponent()
      wrapper.vm.body = body
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toBeNull()
    })
  })

  describe('groupid computed', () => {
    it('returns groupid from member, message groups, or null when missing', () => {
      // From member
      let wrapper = mountComponent({
        message: null,
        member: createMember({ groupid: 789 }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.groupid).toBe(789)

      // From message groups
      wrapper = mountComponent()
      expect(wrapper.vm.groupid).toBe(123)

      // Null when message has no groups
      wrapper = mountComponent({
        message: createMessage({ groups: [] }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.groupid).toBeNull()
    })
  })

  describe('user computed', () => {
    it('returns fromuser from message or member when no message', () => {
      // From message
      let wrapper = mountComponent()
      expect(wrapper.vm.user.displayname).toBe('Test User')

      // From member when no message
      wrapper = mountComponent({
        message: null,
        member: createMember({ displayname: 'Member User' }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.user.displayname).toBe('Member User')
    })
  })

  describe('toEmail computed', () => {
    it('returns email from member, preferred email from message, and skips ilovefreegle emails', () => {
      // From member
      let wrapper = mountComponent({
        message: null,
        member: createMember({ email: 'member@test.com' }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.toEmail).toBe('member@test.com')

      // Preferred email from fromuser.emails
      wrapper = mountComponent()
      expect(wrapper.vm.toEmail).toBe('test@example.com')

      // Skips ilovefreegle emails
      wrapper = mountComponent({
        message: createMessage({
          fromuser: {
            id: 456,
            displayname: 'Test User',
            emails: [
              { email: 'user@users.ilovefreegle.org', preferred: true },
              { email: 'real@example.com', preferred: false },
            ],
          },
        }),
      })
      expect(wrapper.vm.toEmail).toBe('real@example.com')
    })
  })

  // Note: The 'process' function is not exposed via defineExpose and cannot be
  // tested directly via shallowMount as event emissions from stubbed child
  // components don't trigger parent event handlers. The process functionality
  // should be covered by E2E tests with Playwright.

  describe('modal movement', () => {
    it('adjusts margins in all directions', () => {
      const wrapper = mountComponent()
      const initialLeft = wrapper.vm.margLeft
      const initialTop = wrapper.vm.margTop

      wrapper.vm.moveLeft()
      expect(wrapper.vm.margLeft).toBe(initialLeft - 10)

      wrapper.vm.moveRight()
      expect(wrapper.vm.margLeft).toBe(initialLeft) // back to initial

      wrapper.vm.moveUp()
      expect(wrapper.vm.margTop).toBe(initialTop - 10)

      wrapper.vm.moveDown()
      expect(wrapper.vm.margTop).toBe(initialTop) // back to initial
    })
  })

  describe('Edit action specific', () => {
    it('shows edit-specific UI without From/To fields', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Edit' }),
      })
      // Hides From/To for Edit action
      expect(wrapper.text()).not.toContain('From:')
      expect(wrapper.text()).not.toContain('To:')
      // Shows type selector and postcode input for structured message edit
      expect(wrapper.find('select').exists()).toBe(true)
      expect(wrapper.find('.postcode').exists()).toBe(true)
    })
  })

  describe('status change indicators', () => {
    it('shows status change indicators for modstatus, delstatus, and hold actions', () => {
      // Modstatus change text
      let wrapper = mountComponent({
        stdmsg: createStdmsg({ newmodstatus: 'MODERATED' }),
      })
      expect(wrapper.text()).toContain('Change moderation status to')
      expect(wrapper.text()).toContain('Moderated')

      // Delstatus change text
      wrapper = mountComponent({
        stdmsg: createStdmsg({ newdelstatus: 'DIGEST' }),
      })
      expect(wrapper.text()).toContain('Change email frequency to')

      // Hold message text
      wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Hold Message' }),
      })
      expect(wrapper.text()).toContain('Hold message')
    })
  })

  describe('props', () => {
    it('accepts stdmsg prop (required)', () => {
      const stdmsg = createStdmsg({ action: 'Reject' })
      const wrapper = mountComponent({ stdmsg })
      expect(wrapper.props('stdmsg').action).toBe('Reject')
    })
  })

  describe('exposed methods', () => {
    it.each(['fillin', 'show', 'modal'])('exposes %s', (exposed) => {
      const wrapper = mountComponent()
      expect(wrapper.vm[exposed]).toBeDefined()
    })
  })

  describe('postcodeSelect', () => {
    it('updates message location when postcode selected', () => {
      const wrapper = mountComponent()
      const newLocation = { name: 'New Location' }
      wrapper.vm.postcodeSelect(newLocation)
      expect(wrapper.props('message').location).toEqual(newLocation)
    })
  })

  describe('member mode', () => {
    it('uses member displayname in title and member email as toEmail when no message', () => {
      const wrapper = mountComponent({
        message: null,
        member: createMember({
          displayname: 'Test Member',
          email: 'member@test.com',
        }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.find('.modal').attributes('title')).toContain(
        'Message to Test Member'
      )
      expect(wrapper.vm.toEmail).toBe('member@test.com')
    })
  })
})
