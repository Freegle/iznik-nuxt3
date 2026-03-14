import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogStdMsg from '~/modtools/components/ModLogStdMsg.vue'

describe('ModLogStdMsg', () => {
  function mountModLogStdMsg(logOverrides = {}) {
    const defaultLog = {
      stdmsg: null,
      ...logOverrides,
    }
    return mount(ModLogStdMsg, {
      props: { log: defaultLog },
    })
  }

  describe('rendering', () => {
    it('renders nothing when log has no stdmsg', () => {
      const wrapper = mountModLogStdMsg({ stdmsg: null })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders span when log has stdmsg', () => {
      const wrapper = mountModLogStdMsg({
        stdmsg: { title: 'Test Message' },
      })
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('displays stdmsg title in em tag', () => {
      const wrapper = mountModLogStdMsg({
        stdmsg: { title: 'Approved' },
      })
      expect(wrapper.find('em').text()).toContain('Approved')
    })

    it('shows "using" prefix text', () => {
      const wrapper = mountModLogStdMsg({
        stdmsg: { title: 'Rejected' },
      })
      expect(wrapper.text()).toContain('using')
    })
  })

  describe('props', () => {
    it('accepts log prop with stdmsg object', () => {
      const wrapper = mountModLogStdMsg({
        stdmsg: { title: 'Standard Response' },
      })
      expect(wrapper.props('log').stdmsg.title).toBe('Standard Response')
    })

    it('accepts null log prop', () => {
      const wrapper = mount(ModLogStdMsg, {
        props: { log: null },
      })
      expect(wrapper.find('span').exists()).toBe(false)
    })
  })
})
