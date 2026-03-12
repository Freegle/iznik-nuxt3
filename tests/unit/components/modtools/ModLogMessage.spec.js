import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogMessage from '~/modtools/components/ModLogMessage.vue'

// Mock logs store
const mockLogsStore = {
  list: [],
  byId: vi.fn(),
}

// Mock message store (V2: messages fetched into store by ModLog.vue)
const mockMessageStore = {
  byId: vi.fn().mockReturnValue(null),
}

vi.mock('~/stores/logs', () => ({
  useLogsStore: () => mockLogsStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

describe('ModLogMessage', () => {
  function createWrapper(props = {}) {
    // Extract log data from props (backward compat with old test pattern)
    const logData = props.log
    const logId = logData?.id || logData?.msgid || 1

    if (logData) {
      const log = { id: logId, ...logData }
      mockLogsStore.list = [log]
      mockLogsStore.byId.mockImplementation(
        (id) => mockLogsStore.list.find((l) => l.id === id) || null
      )
    } else {
      mockLogsStore.list = []
      mockLogsStore.byId.mockReturnValue(null)
    }

    return mount(ModLogMessage, {
      props: {
        logid: logId,
        ...(props.notext !== undefined ? { notext: props.notext } : {}),
        ...(props.tag !== undefined ? { tag: props.tag } : {}),
      },
      global: {
        stubs: {
          ModLogStdMsg: {
            name: 'ModLogStdMsg',
            template: '<span class="stub-stdmsg"></span>',
            props: ['logid'],
          },
          ModLogGroup: {
            name: 'ModLogGroup',
            template: '<span class="stub-group"></span>',
            props: ['logid', 'tag'],
          },
          'v-icon': {
            name: 'v-icon',
            template: '<span class="stub-icon"></span>',
            props: ['icon', 'scale'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogsStore.list = []
  })

  describe('rendering', () => {
    it('renders nothing when log not found in store', () => {
      mockLogsStore.byId.mockReturnValue(null)
      const wrapper = mount(ModLogMessage, {
        props: { logid: 999 },
        global: {
          stubs: {
            ModLogStdMsg: true,
            ModLogGroup: true,
            'v-icon': true,
          },
        },
      })
      // The component has v-if="log && log.msgid", so nothing should render
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders nothing when log has no msgid', () => {
      const wrapper = createWrapper({ log: { id: 1 } })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders nothing when log.msgid is undefined', () => {
      const wrapper = createWrapper({
        log: { id: 1, message: { subject: 'Test' } },
      })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders span when log has msgid', () => {
      const wrapper = createWrapper({
        log: { id: 1, msgid: 123 },
      })
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('renders msgid with message info when message exists', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 456,
          message: { subject: 'Test Subject' },
        },
      })
      expect(wrapper.text()).toContain('456')
      expect(wrapper.find('a').exists()).toBe(true)
    })

    it('renders msgid with "no info available" when message is null', () => {
      const wrapper = createWrapper({
        log: { id: 1, msgid: 789, message: null },
      })
      expect(wrapper.text()).toContain('789')
      expect(wrapper.text()).toContain('(no info available)')
    })

    it('renders link to ilovefreegle.org with msgid', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 999,
          message: { subject: 'Test' },
        },
      })
      const link = wrapper.find('a')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe(
        'https://www.ilovefreegle.org/message/999'
      )
      expect(link.attributes('target')).toBe('_blank')
    })

    it('renders hashtag icon', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 100,
          message: { subject: 'Test' },
        },
      })
      expect(wrapper.find('.stub-icon').exists()).toBe(true)
    })

    it('renders ModLogStdMsg child component', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 200,
          message: { subject: 'Test' },
        },
      })
      expect(wrapper.find('.stub-stdmsg').exists()).toBe(true)
    })

    it('renders ModLogGroup child component', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 300,
          message: { subject: 'Test' },
        },
      })
      expect(wrapper.find('.stub-group').exists()).toBe(true)
    })
  })

  describe('message subject display', () => {
    it('displays message subject in em tag when available', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 111,
          message: { subject: 'OFFER: Free couch' },
        },
      })
      const em = wrapper.find('em')
      expect(em.text()).toBe('OFFER: Free couch')
    })

    it('displays "(Blank subject line)" when subject is empty', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 222,
          message: { subject: '' },
        },
      })
      const em = wrapper.find('em')
      expect(em.text()).toBe('(Blank subject line)')
    })

    it('displays "(Blank subject line)" when subject is null', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 333,
          message: { subject: null },
        },
      })
      const em = wrapper.find('em')
      expect(em.text()).toBe('(Blank subject line)')
    })

    it('displays "(Blank subject line)" when subject is undefined', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 444,
          message: {},
        },
      })
      const em = wrapper.find('em')
      expect(em.text()).toBe('(Blank subject line)')
    })
  })

  describe('text display', () => {
    it('displays text when notext is false and text exists', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 500,
          message: { subject: 'Test' },
          text: 'Additional info',
        },
        notext: false,
      })
      expect(wrapper.text()).toContain('with')
      expect(wrapper.text()).toContain('Additional info')
    })

    it('does not display text when notext is true', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 600,
          message: { subject: 'Test' },
          text: 'Should not show',
        },
        notext: true,
      })
      expect(wrapper.text()).not.toContain('with')
      expect(wrapper.text()).not.toContain('Should not show')
    })

    it('does not display text when text is empty', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 700,
          message: { subject: 'Test' },
          text: '',
        },
        notext: false,
      })
      expect(wrapper.text()).not.toContain('with')
    })

    it('does not display text when text is null', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 800,
          message: { subject: 'Test' },
          text: null,
        },
        notext: false,
      })
      expect(wrapper.text()).not.toContain('with')
    })

    it('does not display text when log.text is undefined', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 850,
          message: { subject: 'Test' },
        },
        notext: false,
      })
      expect(wrapper.text()).not.toContain('with')
    })
  })

  describe('messagesubject computed property', () => {
    it('returns message subject when available', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 900,
          message: { subject: 'WANTED: Bicycle' },
        },
      })
      expect(wrapper.vm.messagesubject).toBe('WANTED: Bicycle')
    })

    it('returns "(Blank subject line)" when subject is falsy', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 901,
          message: { subject: '' },
        },
      })
      expect(wrapper.vm.messagesubject).toBe('(Blank subject line)')
    })

    it('returns "(Message now deleted)" when message is null', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 902,
          message: null,
        },
      })
      expect(wrapper.vm.messagesubject).toBe('(Message now deleted)')
    })

    it('returns "(Message now deleted)" when message is undefined', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 903,
        },
      })
      expect(wrapper.vm.messagesubject).toBe('(Message now deleted)')
    })
  })

  describe('props', () => {
    it('defaults tag to "on"', () => {
      const wrapper = createWrapper({
        log: { id: 1, msgid: 1004, message: { subject: 'Test' } },
      })
      expect(wrapper.props('tag')).toBe('on')
    })

    it('renders nothing when log not found in store', () => {
      mockLogsStore.byId.mockReturnValue(null)
      const wrapper = mount(ModLogMessage, {
        props: { logid: 999 },
        global: {
          stubs: {
            ModLogStdMsg: true,
            ModLogGroup: true,
            'v-icon': true,
          },
        },
      })
      // log is null, so v-if="log && log.msgid" is false
      expect(wrapper.find('span').exists()).toBe(false)
    })
  })

  describe('child component props', () => {
    it('passes logid to ModLogStdMsg', () => {
      const log = { id: 1, msgid: 1100, message: { subject: 'Test' } }
      const wrapper = createWrapper({ log })
      const stdMsgStub = wrapper.findComponent({ name: 'ModLogStdMsg' })
      expect(stdMsgStub.props('logid')).toBe(1)
    })

    it('passes logid to ModLogGroup', () => {
      const log = { id: 1, msgid: 1200, message: { subject: 'Test' } }
      const wrapper = createWrapper({ log })
      const groupStub = wrapper.findComponent({ name: 'ModLogGroup' })
      expect(groupStub.props('logid')).toBe(1)
    })

    it('passes tag to ModLogGroup', () => {
      const wrapper = createWrapper({
        log: { id: 1, msgid: 1300, message: { subject: 'Test' } },
        tag: 'for',
      })
      const groupStub = wrapper.findComponent({ name: 'ModLogGroup' })
      expect(groupStub.props('tag')).toBe('for')
    })
  })

  describe('edge cases', () => {
    it('handles log with empty object', () => {
      const wrapper = createWrapper({ log: { id: 1 } })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('handles log with msgid of 0', () => {
      // 0 is falsy, so should not render
      const wrapper = createWrapper({ log: { id: 1, msgid: 0 } })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('handles log with msgid as string', () => {
      const wrapper = createWrapper({
        log: { id: 1, msgid: '1500', message: { subject: 'Test' } },
      })
      expect(wrapper.text()).toContain('1500')
    })

    it('handles long message subject', () => {
      const longSubject = 'A'.repeat(500)
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 1600,
          message: { subject: longSubject },
        },
      })
      expect(wrapper.vm.messagesubject).toBe(longSubject)
    })

    it('handles special characters in subject', () => {
      const specialSubject = '<script>alert("xss")</script>'
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 1700,
          message: { subject: specialSubject },
        },
      })
      // Vue should escape the content automatically
      expect(wrapper.vm.messagesubject).toBe(specialSubject)
    })

    it('handles text with only whitespace', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 1800,
          message: { subject: 'Test' },
          text: '   ',
        },
        notext: false,
      })
      // Text with length > 0 should still display
      expect(wrapper.text()).toContain('with')
    })
  })

  describe('conditional rendering structure', () => {
    it('shows link section when message exists', () => {
      const wrapper = createWrapper({
        log: {
          id: 1,
          msgid: 1900,
          message: { subject: 'Test Subject' },
        },
      })
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('(no info available)')
    })

    it('shows "no info" section when message is null', () => {
      const wrapper = createWrapper({
        log: { id: 1, msgid: 2000, message: null },
      })
      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.text()).toContain('(no info available)')
    })

    it('does not render child components when message is null', () => {
      const wrapper = createWrapper({
        log: { id: 1, msgid: 2100, message: null },
      })
      expect(wrapper.find('.stub-stdmsg').exists()).toBe(false)
      expect(wrapper.find('.stub-group').exists()).toBe(false)
    })
  })
})
