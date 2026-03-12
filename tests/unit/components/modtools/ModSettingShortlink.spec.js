import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModSettingShortlink from '~/modtools/components/ModSettingShortlink.vue'

// Mock shortlinks store
const mockShortlinkStore = {
  list: {},
  byId: vi.fn(),
}

vi.mock('~/stores/shortlinks', () => ({
  useShortlinkStore: () => mockShortlinkStore,
}))

describe('ModSettingShortlink', () => {
  const defaultShortlink = {
    id: 1,
    name: 'testlink',
    created: '2024-01-15T10:30:00Z',
    clicks: 42,
  }

  function mountComponent(shortlink = defaultShortlink) {
    mockShortlinkStore.list[shortlink.id] = shortlink
    mockShortlinkStore.byId.mockImplementation(
      (id) => mockShortlinkStore.list[id] || null
    )

    return mount(ModSettingShortlink, {
      props: { shortlinkid: shortlink.id },
      global: {
        mocks: {
          timeago: (date) => `${date} ago`,
          pluralise: (word, count, showCount) =>
            showCount ? `${count} ${word}${count !== 1 ? 's' : ''}` : word,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShortlinkStore.list = {}
  })

  describe('rendering', () => {
    it('renders a link with the correct href', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('https://freegle.in/testlink')
    })

    it('displays the shortlink name in the link text', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a')
      expect(link.text()).toContain('freegle.in/testlink')
    })

    it('displays the created time using timeago', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('created')
      expect(wrapper.text()).toContain('ago')
    })

    it('displays the click count with pluralization', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('42 clicks')
    })

    it('displays singular click when count is 1', () => {
      const shortlink = { ...defaultShortlink, clicks: 1 }
      const wrapper = mountComponent(shortlink)
      expect(wrapper.text()).toContain('1 click')
    })

    it('applies text-muted and small classes to metadata span', () => {
      const wrapper = mountComponent()
      const span = wrapper.find('span.text-muted.small')
      expect(span.exists()).toBe(true)
    })

    it('has rel attribute for security on external link', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('renders nothing when shortlink is not in store', () => {
      mockShortlinkStore.byId.mockReturnValue(null)

      const wrapper = mount(ModSettingShortlink, {
        props: { shortlinkid: 999 },
        global: {
          mocks: {
            timeago: (date) => `${date} ago`,
            pluralise: (word, count, showCount) =>
              showCount ? `${count} ${word}${count !== 1 ? 's' : ''}` : word,
          },
        },
      })

      expect(wrapper.find('a').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts shortlinkid as required prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('shortlinkid')).toBe(defaultShortlink.id)
    })

    it('handles shortlink with different name', () => {
      const shortlink = { ...defaultShortlink, id: 2, name: 'mygroup' }
      const wrapper = mountComponent(shortlink)
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('https://freegle.in/mygroup')
      expect(link.text()).toContain('freegle.in/mygroup')
    })

    it('handles shortlink with zero clicks', () => {
      const shortlink = { ...defaultShortlink, clicks: 0 }
      const wrapper = mountComponent(shortlink)
      expect(wrapper.text()).toContain('0 clicks')
    })

    it('handles shortlink with many clicks', () => {
      const shortlink = { ...defaultShortlink, clicks: 12345 }
      const wrapper = mountComponent(shortlink)
      expect(wrapper.text()).toContain('12345 clicks')
    })
  })

  describe('edge cases', () => {
    it('handles shortlink name with special characters', () => {
      const shortlink = { ...defaultShortlink, name: 'my-group-2024' }
      const wrapper = mountComponent(shortlink)
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('https://freegle.in/my-group-2024')
    })

    it('handles shortlink with empty name', () => {
      const shortlink = { ...defaultShortlink, name: '' }
      const wrapper = mountComponent(shortlink)
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('https://freegle.in/')
    })

    it('renders correctly with all shortlink properties', () => {
      const shortlink = {
        id: 999,
        name: 'full-test',
        created: '2023-06-01T12:00:00Z',
        clicks: 100,
      }
      const wrapper = mountComponent(shortlink)
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('span.text-muted').exists()).toBe(true)
    })
  })
})
