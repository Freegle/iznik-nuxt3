import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExpectedRepliesWarning from '~/components/ExpectedRepliesWarning.vue'

describe('ExpectedRepliesWarning', () => {
  function createWrapper(props = {}) {
    return mount(ExpectedRepliesWarning, {
      props: {
        count: 2,
        chats: [101, 102],
        ...props,
      },
      global: {
        stubs: {
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ExpectedRepliesChat: {
            template: '<div class="expected-replies-chat" :data-id="id"></div>',
            props: ['id'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders warning notice', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message.warning').exists()).toBe(true)
    })

    it('displays waiting message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('waiting for you to reply')
    })

    it('mentions not leaving people hanging', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("don't leave them hanging")
    })
  })

  describe('replies computed', () => {
    it('shows singular for 1 freegler', () => {
      const wrapper = createWrapper({ count: 1, chats: [101] })
      expect(wrapper.text()).toContain('1 freegler is')
    })

    it('shows plural for 2 freeglers', () => {
      const wrapper = createWrapper({ count: 2, chats: [101, 102] })
      expect(wrapper.text()).toContain('2 freeglers are')
    })

    it('shows plural for many freeglers', () => {
      const wrapper = createWrapper({ count: 5, chats: [1, 2, 3, 4, 5] })
      expect(wrapper.text()).toContain('5 freeglers are')
    })
  })

  describe('ExpectedRepliesChat rendering', () => {
    it('renders ExpectedRepliesChat for each chat', () => {
      const wrapper = createWrapper({ chats: [1, 2, 3] })
      expect(wrapper.findAll('.expected-replies-chat')).toHaveLength(3)
    })

    it('passes chat id to each component', () => {
      const wrapper = createWrapper({ chats: [101, 202] })
      const chats = wrapper.findAll('.expected-replies-chat')
      expect(chats[0].attributes('data-id')).toBe('101')
      expect(chats[1].attributes('data-id')).toBe('202')
    })

    it('renders no chat components when chats empty', () => {
      const wrapper = createWrapper({ count: 0, chats: [] })
      expect(wrapper.findAll('.expected-replies-chat')).toHaveLength(0)
    })
  })

  describe('props', () => {
    it('requires count prop', () => {
      const props = ExpectedRepliesWarning.props
      expect(props.count.required).toBe(true)
    })

    it('count prop is Number type', () => {
      const props = ExpectedRepliesWarning.props
      expect(props.count.type).toBe(Number)
    })

    it('requires chats prop', () => {
      const props = ExpectedRepliesWarning.props
      expect(props.chats.required).toBe(true)
    })

    it('chats prop is Array type', () => {
      const props = ExpectedRepliesWarning.props
      expect(props.chats.type).toBe(Array)
    })
  })
})
