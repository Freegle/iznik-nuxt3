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
    it('shows message subject in title', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').attributes('title')).toContain(
        'Offer: Test item (Location)'
      )
    })

    it('shows From and To fields for non-Edit actions', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('From:')
      expect(wrapper.text()).toContain('To:')
    })

    it('shows mod displayname in From field', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Mod User')
    })

    it('shows user displayname in To field', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('shows user email', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('does not show ilovefreegle email', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('users.ilovefreegle.org')
    })

    it('renders subject input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('renders body textarea', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('shows Cancel button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Cancel')
    })
  })

  describe('processLabel computed', () => {
    it('returns Send and Approve for Approve action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Approve' }),
      })
      expect(wrapper.vm.processLabel).toBe('Send and Approve')
    })

    it('returns Send and Approve for Approve Member action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Approve Member' }),
      })
      expect(wrapper.vm.processLabel).toBe('Send and Approve')
    })

    it('returns Send and Reject for Reject action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Reject' }),
      })
      expect(wrapper.vm.processLabel).toBe('Send and Reject')
    })

    it('returns Send and Leave for Leave action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Leave' }),
      })
      expect(wrapper.vm.processLabel).toBe('Send and Leave')
    })

    it('returns Send and Delete for Delete action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Delete' }),
      })
      expect(wrapper.vm.processLabel).toBe('Send and Delete')
    })

    it('returns Save Edit for Edit action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Edit' }),
      })
      expect(wrapper.vm.processLabel).toBe('Save Edit')
    })

    it('returns Send and Hold for Hold Message action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Hold Message' }),
      })
      expect(wrapper.vm.processLabel).toBe('Send and Hold')
    })

    it('returns Send as default', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Unknown' }),
      })
      expect(wrapper.vm.processLabel).toBe('Send')
    })
  })

  describe('modstatus computed', () => {
    it('returns Unchanged for UNCHANGED', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newmodstatus: 'UNCHANGED' }),
      })
      expect(wrapper.vm.modstatus).toBe('Unchanged')
    })

    it('returns Moderated for MODERATED', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newmodstatus: 'MODERATED' }),
      })
      expect(wrapper.vm.modstatus).toBe('Moderated')
    })

    it('returns Group Settings for DEFAULT', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newmodstatus: 'DEFAULT' }),
      })
      expect(wrapper.vm.modstatus).toBe('Group Settings')
    })

    it("returns Can't Post for PROHIBITED", () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newmodstatus: 'PROHIBITED' }),
      })
      expect(wrapper.vm.modstatus).toBe("Can't Post")
    })
  })

  describe('emailfrequency computed', () => {
    it('returns 24 for DIGEST', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newdelstatus: 'DIGEST' }),
      })
      expect(wrapper.vm.emailfrequency).toBe(24)
    })

    it('returns 0 for NONE', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newdelstatus: 'NONE' }),
      })
      expect(wrapper.vm.emailfrequency).toBe(0)
    })

    it('returns -1 for SINGLE', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newdelstatus: 'SINGLE' }),
      })
      expect(wrapper.vm.emailfrequency).toBe(-1)
    })

    it('returns 0 for ANNOUNCEMENT', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newdelstatus: 'ANNOUNCEMENT' }),
      })
      expect(wrapper.vm.emailfrequency).toBe(0)
    })
  })

  describe('warning computed', () => {
    it('warns about yahoo', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Please use Yahoo Groups'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain('Yahoo Groups')
    })

    it('warns about republisher', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Use the republisher tool'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain('Republisher')
    })

    it('warns about messagemaker', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Try the messagemaker'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain('Message Maker')
    })

    it('warns about cafe', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Visit the cafe section'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain('ChitChat')
    })

    it('warns about newsfeed', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Post to the newsfeed'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain('ChitChat')
    })

    it('warns about freegledirect', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Use freegledirect'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain('Freegle Direct')
    })

    it('warns about www.freegle.in', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Visit www.freegle.in'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain("won't work with the www")
    })

    it('warns about http://', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Visit http://example.com'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toContain('https://')
    })

    it('returns null when no issues', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'This is a clean message'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toBeNull()
    })

    it('ignores @yahoo in email addresses', async () => {
      const wrapper = mountComponent()
      wrapper.vm.body = 'Contact me at user@yahoo.com'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.warning).toBeNull()
    })
  })

  describe('groupid computed', () => {
    it('returns groupid from member', () => {
      const wrapper = mountComponent({
        message: null,
        member: createMember({ groupid: 789 }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.groupid).toBe(789)
    })

    it('returns groupid from message groups', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.groupid).toBe(123)
    })

    it('returns null when message has no groups', () => {
      const wrapper = mountComponent({
        message: createMessage({ groups: [] }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.groupid).toBeNull()
    })
  })

  describe('user computed', () => {
    it('returns fromuser from message', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.user.displayname).toBe('Test User')
    })

    it('returns member when no message', () => {
      const wrapper = mountComponent({
        message: null,
        member: createMember({ displayname: 'Member User' }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.user.displayname).toBe('Member User')
    })
  })

  describe('toEmail computed', () => {
    it('returns email from member', () => {
      const wrapper = mountComponent({
        message: null,
        member: createMember({ email: 'member@test.com' }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.toEmail).toBe('member@test.com')
    })

    it('returns preferred email from fromuser.emails', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.toEmail).toBe('test@example.com')
    })

    it('skips ilovefreegle emails', () => {
      const wrapper = mountComponent({
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
    it('moveLeft decreases margLeft', () => {
      const wrapper = mountComponent()
      const initial = wrapper.vm.margLeft
      wrapper.vm.moveLeft()
      expect(wrapper.vm.margLeft).toBe(initial - 10)
    })

    it('moveRight increases margLeft', () => {
      const wrapper = mountComponent()
      const initial = wrapper.vm.margLeft
      wrapper.vm.moveRight()
      expect(wrapper.vm.margLeft).toBe(initial + 10)
    })

    it('moveUp decreases margTop', () => {
      const wrapper = mountComponent()
      const initial = wrapper.vm.margTop
      wrapper.vm.moveUp()
      expect(wrapper.vm.margTop).toBe(initial - 10)
    })

    it('moveDown increases margTop', () => {
      const wrapper = mountComponent()
      const initial = wrapper.vm.margTop
      wrapper.vm.moveDown()
      expect(wrapper.vm.margTop).toBe(initial + 10)
    })
  })

  describe('Edit action specific', () => {
    it('hides From/To for Edit action', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Edit' }),
      })
      expect(wrapper.text()).not.toContain('From:')
      expect(wrapper.text()).not.toContain('To:')
    })

    it('shows type selector for structured message edit', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Edit' }),
      })
      expect(wrapper.find('select').exists()).toBe(true)
    })

    it('shows postcode input for structured message edit', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ action: 'Edit' }),
      })
      expect(wrapper.find('.postcode').exists()).toBe(true)
    })
  })

  describe('status change indicators', () => {
    it('shows modstatus change text when newmodstatus set', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newmodstatus: 'MODERATED' }),
      })
      expect(wrapper.text()).toContain('Change moderation status to')
      expect(wrapper.text()).toContain('Moderated')
    })

    it('shows delstatus change text when newdelstatus set', () => {
      const wrapper = mountComponent({
        stdmsg: createStdmsg({ newdelstatus: 'DIGEST' }),
      })
      expect(wrapper.text()).toContain('Change email frequency to')
    })

    it('shows Hold message text for Hold Message action', () => {
      const wrapper = mountComponent({
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
    it('exposes fillin method', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.fillin).toBeDefined()
    })

    it('exposes show method', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBeDefined()
    })

    it('exposes modal ref', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.modal).toBeDefined()
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
    it('uses member displayname in title when no message', () => {
      const wrapper = mountComponent({
        message: null,
        member: createMember({ displayname: 'Test Member' }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.find('.modal').attributes('title')).toContain(
        'Message to Test Member'
      )
    })

    it('uses member email as toEmail', () => {
      const wrapper = mountComponent({
        message: null,
        member: createMember({ email: 'member@test.com' }),
        stdmsg: createStdmsg(),
      })
      expect(wrapper.vm.toEmail).toBe('member@test.com')
    })
  })
})
