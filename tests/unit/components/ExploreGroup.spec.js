import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import ExploreGroup from '~/components/ExploreGroup.vue'

const mockGroupStore = {
  get: vi.fn().mockReturnValue({
    id: 1,
    nameshort: 'TestGroup',
    namedisplay: 'Test Group',
  }),
  fetchMessagesForGroup: vi.fn().mockResolvedValue(undefined),
  getMessages: vi.fn().mockReturnValue([101, 102, 103, 104, 105]),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('ExploreGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGroupStore.get.mockReturnValue({
      id: 1,
      nameshort: 'TestGroup',
      namedisplay: 'Test Group',
    })
    mockGroupStore.getMessages.mockReturnValue([101, 102, 103, 104, 105])
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(ExploreGroup, {
                id: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          GroupHeader: {
            template:
              '<div class="group-header" :data-group-id="group?.id" :data-show-join="showJoin" :data-show-give-find="showGiveFind" />',
            props: ['group', 'showJoin', 'showGiveFind'],
          },
          OurMessage: {
            template: '<div class="our-message" :data-id="id" />',
            props: ['id', 'recordView'],
          },
          MessageList: {
            template:
              '<div class="message-list" :data-selected-group="selectedGroup" :data-bump="bump" />',
            props: [
              'messagesForList',
              'selectedGroup',
              'bump',
              'exclude',
              'showGiveFind',
              'showGroupHeader',
            ],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders container div', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.mb-2.mt-2').exists()).toBe(true)
    })

    it('renders GroupHeader when group exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.group-header').exists()).toBe(true)
      expect(wrapper.find('.group-header').attributes('data-group-id')).toBe(
        '1'
      )
    })

    it('has showJoin on GroupHeader', async () => {
      const wrapper = await createWrapper()
      // Boolean props are passed as empty strings in DOM attributes
      expect(wrapper.find('.group-header').attributes()).toHaveProperty(
        'data-show-join'
      )
    })

    it('does not render GroupHeader when group is null', async () => {
      mockGroupStore.get.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.group-header').exists()).toBe(false)
    })

    it('renders MessageList', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-list').exists()).toBe(true)
    })

    it('renders OurMessage when msgid provided', async () => {
      const wrapper = await createWrapper({ msgid: 50 })
      expect(wrapper.find('.our-message').exists()).toBe(true)
      expect(wrapper.find('.our-message').attributes('data-id')).toBe('50')
    })

    it('does not render OurMessage when msgid not provided', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-message').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('requires id prop (number)', async () => {
      const wrapper = await createWrapper({ id: 5 })
      expect(wrapper.findComponent(ExploreGroup).props('id')).toBe(5)
    })

    it('requires id prop (string)', async () => {
      const wrapper = await createWrapper({ id: 'test-group' })
      expect(wrapper.findComponent(ExploreGroup).props('id')).toBe('test-group')
    })

    it('has default msgid of null', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ExploreGroup).props('msgid')).toBe(null)
    })

    it('accepts msgid prop', async () => {
      const wrapper = await createWrapper({ msgid: 100 })
      expect(wrapper.findComponent(ExploreGroup).props('msgid')).toBe(100)
    })

    it('has default showGiveFind of false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(ExploreGroup).props('showGiveFind')).toBe(
        false
      )
    })

    it('accepts showGiveFind prop', async () => {
      const wrapper = await createWrapper({ showGiveFind: true })
      expect(wrapper.findComponent(ExploreGroup).props('showGiveFind')).toBe(
        true
      )
    })
  })

  describe('data fetching', () => {
    it('fetches messages for group on mount', async () => {
      await createWrapper({ id: 5 })
      expect(mockGroupStore.fetchMessagesForGroup).toHaveBeenCalledWith(5)
    })
  })

  describe('computed messages', () => {
    it('returns messages from store', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(ExploreGroup)
      expect(component.vm.messages).toEqual([101, 102, 103, 104, 105])
    })

    it('returns sliced messages up to toShow', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(ExploreGroup)
      expect(component.vm.messagesToShow.length).toBeLessThanOrEqual(20)
    })

    it('maps messages with groupid', async () => {
      mockGroupStore.getMessages.mockReturnValue([101])
      const wrapper = await createWrapper({ id: 5 })
      const component = wrapper.findComponent(ExploreGroup)
      expect(component.vm.messagesToShow).toEqual([{ id: 101, groupid: 5 }])
    })
  })

  describe('loadMore method', () => {
    it('increments toShow and calls loaded', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(ExploreGroup)

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      component.vm.toShow = 3
      mockGroupStore.getMessages.mockReturnValue([1, 2, 3, 4, 5])

      component.vm.loadMore(mockState)

      expect(component.vm.toShow).toBe(4)
      expect(mockState.loaded).toHaveBeenCalled()
    })

    it('calls complete when all messages shown', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(ExploreGroup)

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      component.vm.toShow = 5
      mockGroupStore.getMessages.mockReturnValue([1, 2, 3, 4, 5])

      component.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })
  })

  describe('exposed methods', () => {
    it('exposes loadMore method', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(ExploreGroup)
      expect(typeof component.vm.loadMore).toBe('function')
    })
  })
})
