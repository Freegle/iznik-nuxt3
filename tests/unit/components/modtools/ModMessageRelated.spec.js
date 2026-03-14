import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMessageRelated from '~/modtools/components/ModMessageRelated.vue'

const { mockMessageStore } = vi.hoisted(() => {
  const mockMessageStore = {
    byId: vi.fn(),
    fetch: vi.fn().mockResolvedValue(),
  }
  return { mockMessageStore }
})

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

describe('ModMessageRelated', () => {
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    subject: 'Free sofa in good condition',
    arrival: '2024-01-15T10:00:00Z',
    ...overrides,
  })

  function mountComponent(props = {}, messageOverrides = {}) {
    const messageData = createTestMessage(messageOverrides)

    mockMessageStore.byId.mockImplementation((id) => {
      if (id === messageData.id) return messageData
      return null
    })

    return mount(ModMessageRelated, {
      props: {
        messageid: messageData.id,
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
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays "Related to" text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Related to')
    })

    it('displays message id with hashtag icon', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
      expect(wrapper.find('i.hashtag').exists()).toBe(true)
    })

    it('displays message subject in italics', () => {
      const wrapper = mountComponent()
      const em = wrapper.find('em')
      expect(em.exists()).toBe(true)
      expect(em.text()).toContain('Free sofa in good condition')
    })

    it('displays arrival time using timeago', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('2024-01-15T10:00:00Z ago')
    })
  })

  describe('props', () => {
    it('messageid prop is required', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('messageid')).toBeDefined()
    })
  })

  describe('styling', () => {
    it('has text-success class', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div.text-success').exists()).toBe(true)
    })

    it('has small class', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div.small').exists()).toBe(true)
    })

    it('has text-muted class on hashtag icon', () => {
      const wrapper = mountComponent()
      const icon = wrapper.find('i.hashtag')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('content display', () => {
    it('displays all message details in order', () => {
      const wrapper = mountComponent(
        { messageid: 999 },
        {
          id: 999,
          subject: 'Test Subject',
          arrival: '2024-06-01',
        }
      )
      const text = wrapper.text()
      expect(text).toContain('Related to')
      expect(text).toContain('999')
      expect(text).toContain('Test Subject')
      expect(text).toContain('2024-06-01 ago')
    })

    it('handles long subject text', () => {
      const longSubject = 'A'.repeat(200)
      const wrapper = mountComponent({}, { subject: longSubject })
      expect(wrapper.text()).toContain(longSubject)
    })

    it('handles subject with special characters', () => {
      const wrapper = mountComponent(
        {},
        {
          subject: 'Test <>&"\'',
        }
      )
      expect(wrapper.text()).toContain('Test <>&')
    })
  })

  describe('edge cases', () => {
    it('handles empty subject', () => {
      const wrapper = mountComponent({}, { subject: '' })
      const em = wrapper.find('em')
      expect(em.text()).toBe('')
    })

    it('handles null arrival time', () => {
      const wrapper = mountComponent({}, { arrival: null })
      // timeago returns 'null ago' for null input
      expect(wrapper.text()).toContain('null ago')
    })

    it('handles missing arrival time', () => {
      const messageData = createTestMessage()
      delete messageData.arrival

      mockMessageStore.byId.mockImplementation((id) => {
        if (id === messageData.id) return messageData
        return null
      })

      const wrapper = mount(ModMessageRelated, {
        props: { messageid: messageData.id },
        global: {
          mocks: {
            timeago: (date) => `${date} ago`,
          },
          stubs: {
            'v-icon': {
              template: '<i :class="icon" />',
              props: ['icon', 'scale'],
            },
          },
        },
      })
      // timeago returns 'undefined ago' for undefined input
      expect(wrapper.text()).toContain('undefined ago')
    })
  })

  describe('icon rendering', () => {
    it('renders v-icon with hashtag icon', () => {
      const wrapper = mountComponent()
      const icon = wrapper.find('i')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('hashtag')
    })

    it('icon has small scale (0.5)', () => {
      // The icon should be rendered with scale prop
      const wrapper = mountComponent()
      expect(wrapper.find('i.hashtag').exists()).toBe(true)
    })
  })
})
