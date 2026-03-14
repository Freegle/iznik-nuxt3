import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogMessage from '~/modtools/components/ModLogMessage.vue'

describe('ModLogMessage', () => {
  function createWrapper(props = {}) {
    return mount(ModLogMessage, {
      props,
      global: {
        stubs: {
          ModLogStdMsg: {
            name: 'ModLogStdMsg',
            template: '<span class="stub-stdmsg"></span>',
            props: ['log'],
          },
          ModLogGroup: {
            name: 'ModLogGroup',
            template: '<span class="stub-group"></span>',
            props: ['log', 'tag'],
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
  })

  describe('rendering', () => {
    it('throws error when log is null (component expects log to be provided)', () => {
      // The component template accesses log.msgid without null check,
      // so it throws when log is null. This documents the actual behavior.
      expect(() => createWrapper({ log: null })).toThrow()
    })

    it('renders nothing when log has no msgid', () => {
      const wrapper = createWrapper({ log: {} })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders nothing when log.msgid is undefined', () => {
      const wrapper = createWrapper({ log: { message: { subject: 'Test' } } })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders span when log has msgid', () => {
      const wrapper = createWrapper({
        log: { msgid: 123 },
      })
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('renders msgid with message info when message exists', () => {
      const wrapper = createWrapper({
        log: {
          msgid: 456,
          message: { subject: 'Test Subject' },
        },
      })
      expect(wrapper.text()).toContain('456')
      expect(wrapper.find('a').exists()).toBe(true)
    })

    it('renders msgid with "no info available" when message is null', () => {
      const wrapper = createWrapper({
        log: { msgid: 789, message: null },
      })
      expect(wrapper.text()).toContain('789')
      expect(wrapper.text()).toContain('(no info available)')
    })

    it('renders link to ilovefreegle.org with msgid', () => {
      const wrapper = createWrapper({
        log: {
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
          msgid: 100,
          message: { subject: 'Test' },
        },
      })
      expect(wrapper.find('.stub-icon').exists()).toBe(true)
    })

    it('renders ModLogStdMsg child component', () => {
      const wrapper = createWrapper({
        log: {
          msgid: 200,
          message: { subject: 'Test' },
        },
      })
      expect(wrapper.find('.stub-stdmsg').exists()).toBe(true)
    })

    it('renders ModLogGroup child component', () => {
      const wrapper = createWrapper({
        log: {
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
          msgid: 900,
          message: { subject: 'WANTED: Bicycle' },
        },
      })
      expect(wrapper.vm.messagesubject).toBe('WANTED: Bicycle')
    })

    it('returns "(Blank subject line)" when subject is falsy', () => {
      const wrapper = createWrapper({
        log: {
          msgid: 901,
          message: { subject: '' },
        },
      })
      expect(wrapper.vm.messagesubject).toBe('(Blank subject line)')
    })

    it('returns "(Message now deleted)" when message is null', () => {
      const wrapper = createWrapper({
        log: {
          msgid: 902,
          message: null,
        },
      })
      expect(wrapper.vm.messagesubject).toBe('(Message now deleted)')
    })

    it('returns "(Message now deleted)" when message is undefined', () => {
      const wrapper = createWrapper({
        log: {
          msgid: 903,
        },
      })
      expect(wrapper.vm.messagesubject).toBe('(Message now deleted)')
    })
  })

  describe('props', () => {
    it('defaults tag to "on"', () => {
      const wrapper = createWrapper({
        log: { msgid: 1004, message: { subject: 'Test' } },
      })
      expect(wrapper.props('tag')).toBe('on')
    })

    it('throws error when log defaults to null (no log prop provided)', () => {
      // The component template accesses log.msgid without null check,
      // so mounting without log prop throws an error
      expect(() =>
        mount(ModLogMessage, {
          global: {
            stubs: {
              ModLogStdMsg: true,
              ModLogGroup: true,
              'v-icon': true,
            },
          },
        })
      ).toThrow()
    })
  })

  describe('child component props', () => {
    it('passes log to ModLogStdMsg', () => {
      const log = { msgid: 1100, message: { subject: 'Test' } }
      const wrapper = createWrapper({ log })
      const stdMsgStub = wrapper.findComponent({ name: 'ModLogStdMsg' })
      expect(stdMsgStub.props('log')).toEqual(log)
    })

    it('passes log to ModLogGroup', () => {
      const log = { msgid: 1200, message: { subject: 'Test' } }
      const wrapper = createWrapper({ log })
      const groupStub = wrapper.findComponent({ name: 'ModLogGroup' })
      expect(groupStub.props('log')).toEqual(log)
    })

    it('passes tag to ModLogGroup', () => {
      const wrapper = createWrapper({
        log: { msgid: 1300, message: { subject: 'Test' } },
        tag: 'for',
      })
      const groupStub = wrapper.findComponent({ name: 'ModLogGroup' })
      expect(groupStub.props('tag')).toBe('for')
    })
  })

  describe('edge cases', () => {
    it('handles log with empty object', () => {
      const wrapper = createWrapper({ log: {} })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('handles log with msgid of 0', () => {
      // 0 is falsy, so should not render
      const wrapper = createWrapper({ log: { msgid: 0 } })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('handles log with msgid as string', () => {
      const wrapper = createWrapper({
        log: { msgid: '1500', message: { subject: 'Test' } },
      })
      expect(wrapper.text()).toContain('1500')
    })

    it('handles long message subject', () => {
      const longSubject = 'A'.repeat(500)
      const wrapper = createWrapper({
        log: {
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
          msgid: 1900,
          message: { subject: 'Test Subject' },
        },
      })
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('(no info available)')
    })

    it('shows "no info" section when message is null', () => {
      const wrapper = createWrapper({
        log: { msgid: 2000, message: null },
      })
      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.text()).toContain('(no info available)')
    })

    it('does not render child components when message is null', () => {
      const wrapper = createWrapper({
        log: { msgid: 2100, message: null },
      })
      expect(wrapper.find('.stub-stdmsg').exists()).toBe(false)
      expect(wrapper.find('.stub-group').exists()).toBe(false)
    })
  })
})
