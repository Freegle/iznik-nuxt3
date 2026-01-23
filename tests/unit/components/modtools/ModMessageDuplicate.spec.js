import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMessageDuplicate from '~/modtools/components/ModMessageDuplicate.vue'

describe('ModMessageDuplicate', () => {
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    subject: 'Free sofa',
    arrival: '2024-01-15T10:00:00Z',
    collection: 'Approved',
    outcome: null,
    groups: [{ groupid: 456 }],
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMessageDuplicate, {
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
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div.text-danger.small').exists()).toBe(true)
    })

    it('displays "Duplicate of" text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Duplicate of')
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

    it('displays nuxt-link to message', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a')
      expect(link.exists()).toBe(true)
    })
  })

  describe('outcome display', () => {
    it('shows outcome when message has outcome', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ outcome: 'Taken' }),
      })
      expect(wrapper.text()).toContain(', now Taken')
    })

    it('shows "still open" when no outcome', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ outcome: null }),
      })
      expect(wrapper.text()).toContain(', still open')
    })

    it('handles different outcomes', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ outcome: 'Withdrawn' }),
      })
      expect(wrapper.text()).toContain(', now Withdrawn')
    })
  })

  describe('pending indicator', () => {
    it('shows "(pending)" for Pending collection', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'Pending' }),
      })
      expect(wrapper.text()).toContain('(pending)')
    })

    it('shows "(pending)" for PendingOther collection', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'PendingOther' }),
      })
      expect(wrapper.text()).toContain('(pending)')
    })

    it('does not show "(pending)" for Approved collection', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'Approved' }),
      })
      expect(wrapper.text()).not.toContain('(pending)')
    })
  })

  describe('computed properties', () => {
    describe('groupid', () => {
      it('returns first group id when groups exist', () => {
        const wrapper = mountComponent({
          message: createTestMessage({ groups: [{ groupid: 789 }] }),
        })
        expect(wrapper.vm.groupid).toBe(789)
      })

      it('returns 0 when groups array is empty', () => {
        const wrapper = mountComponent({
          message: createTestMessage({ groups: [] }),
        })
        expect(wrapper.vm.groupid).toBe(0)
      })

      it('returns 0 when groups is undefined', () => {
        const wrapper = mountComponent({
          message: createTestMessage({ groups: undefined }),
        })
        expect(wrapper.vm.groupid).toBe(0)
      })

      it('returns 0 when message is null', () => {
        const message = { ...createTestMessage() }
        delete message.groups
        const wrapper = mountComponent({ message })
        expect(wrapper.vm.groupid).toBe(0)
      })
    })

    describe('isPending', () => {
      it('returns true for Pending collection', () => {
        const wrapper = mountComponent({
          message: createTestMessage({ collection: 'Pending' }),
        })
        expect(wrapper.vm.isPending).toBe(true)
      })

      it('returns true for PendingOther collection', () => {
        const wrapper = mountComponent({
          message: createTestMessage({ collection: 'PendingOther' }),
        })
        expect(wrapper.vm.isPending).toBe(true)
      })

      it('returns false for Approved collection', () => {
        const wrapper = mountComponent({
          message: createTestMessage({ collection: 'Approved' }),
        })
        expect(wrapper.vm.isPending).toBe(false)
      })

      it('returns false for other collections', () => {
        const wrapper = mountComponent({
          message: createTestMessage({ collection: 'Spam' }),
        })
        expect(wrapper.vm.isPending).toBe(false)
      })
    })

    describe('duplicateLink', () => {
      it('returns pending messages link for pending message', () => {
        const wrapper = mountComponent({
          message: createTestMessage({
            collection: 'Pending',
            groups: [{ groupid: 456 }],
          }),
        })
        expect(wrapper.vm.duplicateLink).toBe(
          '/messages/pending?groupid=456&msgid=123'
        )
      })

      it('returns approved messages link for approved message', () => {
        const wrapper = mountComponent({
          message: createTestMessage({
            collection: 'Approved',
            groups: [{ groupid: 456 }],
          }),
        })
        expect(wrapper.vm.duplicateLink).toBe('/messages/approved/456/123')
      })

      it('builds correct link with different groupid and msgid', () => {
        const wrapper = mountComponent({
          message: createTestMessage({
            id: 999,
            collection: 'Pending',
            groups: [{ groupid: 111 }],
          }),
        })
        expect(wrapper.vm.duplicateLink).toBe(
          '/messages/pending?groupid=111&msgid=999'
        )
      })
    })
  })

  describe('link navigation', () => {
    it('links to correct pending URL', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          collection: 'Pending',
          groups: [{ groupid: 456 }],
        }),
      })
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe(
        '/messages/pending?groupid=456&msgid=123'
      )
    })

    it('links to correct approved URL', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          collection: 'Approved',
          groups: [{ groupid: 456 }],
        }),
      })
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/messages/approved/456/123')
    })
  })

  describe('props', () => {
    it('accepts message prop', () => {
      const message = createTestMessage({ id: 888 })
      const wrapper = mountComponent({ message })
      expect(wrapper.props('message')).toEqual(message)
    })

    it('message prop is required', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('message')).toBeDefined()
    })
  })

  describe('styling', () => {
    it('has text-danger class', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div.text-danger').exists()).toBe(true)
    })

    it('has small class', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div.small').exists()).toBe(true)
    })

    it('has text-muted class on pending indicator', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ collection: 'Pending' }),
      })
      expect(wrapper.find('span.text-muted').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles message with multiple groups (uses first)', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          groups: [{ groupid: 111 }, { groupid: 222 }],
        }),
      })
      expect(wrapper.vm.groupid).toBe(111)
    })

    it('handles empty outcome string', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ outcome: '' }),
      })
      // Empty string is falsy
      expect(wrapper.text()).toContain(', still open')
    })

    it('handles undefined outcome', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ outcome: undefined }),
      })
      expect(wrapper.text()).toContain(', still open')
    })
  })
})
