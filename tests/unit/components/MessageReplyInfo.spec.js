import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageReplyInfo from '~/components/MessageReplyInfo.vue'

describe('MessageReplyInfo', () => {
  function createWrapper(message) {
    return mount(MessageReplyInfo, {
      props: { message },
      global: {
        stubs: {
          'client-only': {
            template: '<span><slot /></span>',
          },
          'v-icon': {
            template: '<i :class="icon" class="v-icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper({ replycount: 0 })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('with no replies', () => {
    it('shows no replies message when replycount is 0', () => {
      const wrapper = createWrapper({ replycount: 0 })
      // Component uses &nbsp; so normalize whitespace for comparison
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('No replies yet')
    })

    it('shows no replies message when replycount is undefined', () => {
      const wrapper = createWrapper({})
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('No replies yet')
    })

    it('has text-muted class for no replies', () => {
      const wrapper = createWrapper({ replycount: 0 })
      expect(wrapper.find('.text-muted').exists()).toBe(true)
    })
  })

  describe('with single reply', () => {
    it('shows singular freegler text', () => {
      const wrapper = createWrapper({ replycount: 1 })
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('1 freegler replied')
    })

    it('does not show plural s', () => {
      const wrapper = createWrapper({ replycount: 1 })
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).not.toContain('freeglers')
    })

    it('has text-success class', () => {
      const wrapper = createWrapper({ replycount: 1 })
      expect(wrapper.find('.text-success').exists()).toBe(true)
    })
  })

  describe('with multiple replies', () => {
    it('shows plural freeglers text for 2 replies', () => {
      const wrapper = createWrapper({ replycount: 2 })
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('2 freeglers replied')
    })

    it('shows plural freeglers text for many replies', () => {
      const wrapper = createWrapper({ replycount: 10 })
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('10 freeglers replied')
    })

    it('has text-success class', () => {
      const wrapper = createWrapper({ replycount: 5 })
      expect(wrapper.find('.text-success').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires message prop', () => {
      const props = MessageReplyInfo.props
      expect(props.message.required).toBe(true)
    })

    it('message prop is Object type', () => {
      const props = MessageReplyInfo.props
      expect(props.message.type).toBe(Object)
    })
  })
})
