import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageReplyInfo from '~/modtools/components/MessageReplyInfo.vue'

describe('MessageReplyInfo', () => {
  function mountMessageReplyInfo(messageOverrides = {}) {
    const defaultMessage = {
      replycount: 0,
      ...messageOverrides,
    }
    return mount(MessageReplyInfo, {
      props: { message: defaultMessage },
      global: {
        stubs: {
          'client-only': {
            template: '<span><slot /></span>',
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a span container', () => {
      const wrapper = mountMessageReplyInfo()
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('shows user icon', () => {
      const wrapper = mountMessageReplyInfo({ replycount: 1 })
      const icon = wrapper.find('i[data-icon="user"]')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('with no replies', () => {
    it('shows "No replies yet" when replycount is 0', () => {
      const wrapper = mountMessageReplyInfo({ replycount: 0 })
      // Component uses &nbsp; so check for individual words
      expect(wrapper.text()).toContain('No')
      expect(wrapper.text()).toContain('replies')
      expect(wrapper.text()).toContain('yet')
    })

    it('shows "No replies yet" when replycount is undefined', () => {
      const wrapper = mountMessageReplyInfo({})
      expect(wrapper.text()).toContain('No')
      expect(wrapper.text()).toContain('replies')
      expect(wrapper.text()).toContain('yet')
    })

    it('applies text-muted class for no replies', () => {
      const wrapper = mountMessageReplyInfo({ replycount: 0 })
      expect(wrapper.find('.text-muted').exists()).toBe(true)
    })
  })

  describe('with replies', () => {
    it('shows "1 freegler replied" for single reply', () => {
      const wrapper = mountMessageReplyInfo({ replycount: 1 })
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('freegler')
      expect(wrapper.text()).toContain('replied')
      // Should NOT have plural 's'
      expect(wrapper.text()).not.toContain('freeglers')
    })

    it('shows "N freeglers replied" for multiple replies', () => {
      const wrapper = mountMessageReplyInfo({ replycount: 5 })
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('freeglers')
      expect(wrapper.text()).toContain('replied')
    })

    it('applies text-success class for replies', () => {
      const wrapper = mountMessageReplyInfo({ replycount: 3 })
      expect(wrapper.find('.text-success').exists()).toBe(true)
    })
  })

  describe('props validation', () => {
    it('accepts message object with replycount', () => {
      const wrapper = mountMessageReplyInfo({ replycount: 10 })
      expect(wrapper.props('message').replycount).toBe(10)
    })
  })
})
