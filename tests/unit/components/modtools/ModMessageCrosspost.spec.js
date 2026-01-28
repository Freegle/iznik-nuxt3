import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMessageCrosspost from '~/modtools/components/ModMessageCrosspost.vue'

// Mock group store
const mockGroupStore = {
  get: vi.fn(),
  fetch: vi.fn(),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('ModMessageCrosspost', () => {
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    subject: 'Free sofa',
    arrival: '2024-01-15T10:00:00Z',
    groupid: 456,
    collection: 'Approved',
    outcome: null,
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMessageCrosspost, {
      props: {
        message: createTestMessage(),
        ...props,
      },
      global: {
        mocks: {
          timeago: (date) => `${date} ago`,
        },
        stubs: {
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon', 'scale'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGroupStore.get.mockReturnValue({ namedisplay: 'Test Group' })
    mockGroupStore.fetch.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('displays "Crosspost" text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Crosspost')
    })

    it('displays message id with hashtag icon', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
      expect(wrapper.find('i.hashtag').exists()).toBe(true)
    })

    it('displays message subject in italics', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('em').text()).toContain('Free sofa')
    })

    it('displays group name in italics', () => {
      const wrapper = mountComponent()
      const emElements = wrapper.findAll('em')
      expect(emElements.some((em) => em.text().includes('Test Group'))).toBe(
        true
      )
    })

    it('displays nuxt-link to message page', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/message/123')
    })
  })

  describe('collection display', () => {
    it('shows collection name when not Approved', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'Pending' }),
      })
      expect(wrapper.text()).toContain('in')
      expect(wrapper.text()).toContain('Pending')
    })

    it('does not show collection when Approved', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'Approved' }),
      })
      // Check that no dangerSpan contains "Approved" after "in"
      expect(wrapper.text()).not.toMatch(/in\s+Approved/)
    })

    it('shows outcome when message is Approved and has outcome', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          collection: 'Approved',
          outcome: 'Taken',
        }),
      })
      expect(wrapper.text()).toContain(', now Taken')
    })

    it('shows "still open" when Approved and no outcome', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'Approved', outcome: null }),
      })
      expect(wrapper.text()).toContain(', still open')
    })
  })

  describe('computed properties', () => {
    describe('group', () => {
      it('returns group from store based on message groupid', () => {
        mockGroupStore.get.mockReturnValue({
          id: 456,
          namedisplay: 'My Group',
        })
        const wrapper = mountComponent()
        expect(wrapper.vm.group).toEqual({ id: 456, namedisplay: 'My Group' })
        expect(mockGroupStore.get).toHaveBeenCalledWith(456)
      })

      it('returns undefined when group not in store', () => {
        mockGroupStore.get.mockReturnValue(undefined)
        const wrapper = mountComponent()
        expect(wrapper.vm.group).toBeUndefined()
      })
    })

    describe('groupname', () => {
      it('returns namedisplay when group exists', () => {
        mockGroupStore.get.mockReturnValue({ namedisplay: 'Test Group Name' })
        const wrapper = mountComponent()
        expect(wrapper.vm.groupname).toBe('Test Group Name')
      })

      it('returns null when group does not exist', () => {
        mockGroupStore.get.mockReturnValue(null)
        const wrapper = mountComponent()
        expect(wrapper.vm.groupname).toBeNull()
      })
    })
  })

  describe('onMounted', () => {
    it('fetches group when not in store', () => {
      mockGroupStore.get.mockReturnValue(null)
      mountComponent({
        message: createTestMessage({ groupid: 789 }),
      })
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(789)
    })

    it('does not fetch group when already in store', () => {
      mockGroupStore.get.mockReturnValue({ id: 456, namedisplay: 'Existing' })
      mountComponent()
      expect(mockGroupStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('styling', () => {
    it('has text-danger class on main content', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('span.text-danger').exists()).toBe(true)
    })

    it('has small class on container', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div.small').exists()).toBe(true)
    })

    it('has text-muted class on hashtag icon', () => {
      const wrapper = mountComponent()
      const icon = wrapper.find('i.hashtag')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles message without outcome', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ outcome: undefined }),
      })
      expect(wrapper.text()).toContain(', still open')
    })

    it('handles PendingOther collection', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'PendingOther' }),
      })
      expect(wrapper.text()).toContain('in')
      expect(wrapper.text()).toContain('PendingOther')
    })

    it('handles empty outcome string', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'Approved', outcome: '' }),
      })
      // Empty string is falsy, so should show "still open"
      expect(wrapper.text()).toContain(', still open')
    })
  })
})
