import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogStdMsg from '~/modtools/components/ModLogStdMsg.vue'

// Mock logs store
const mockLogsStore = {
  list: [],
  byId: vi.fn(),
}

vi.mock('~/stores/logs', () => ({
  useLogsStore: () => mockLogsStore,
}))

describe('ModLogStdMsg', () => {
  function mountModLogStdMsg(logOverrides = {}) {
    const defaultLog = {
      id: 1,
      stdmsg: null,
      ...logOverrides,
    }

    mockLogsStore.list = [defaultLog]
    mockLogsStore.byId.mockImplementation(
      (id) => mockLogsStore.list.find((l) => l.id === id) || null
    )

    return mount(ModLogStdMsg, {
      props: { logid: defaultLog.id },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogsStore.list = []
  })

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
    it('accepts logid prop with log containing stdmsg object', () => {
      const wrapper = mountModLogStdMsg({
        stdmsg: { title: 'Standard Response' },
      })
      expect(wrapper.props('logid')).toBe(1)
    })

    it('renders nothing when log not found in store', () => {
      mockLogsStore.byId.mockReturnValue(null)
      const wrapper = mount(ModLogStdMsg, {
        props: { logid: 999 },
      })
      expect(wrapper.find('span').exists()).toBe(false)
    })
  })
})
