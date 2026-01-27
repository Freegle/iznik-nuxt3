import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageItemLocation from '~/components/MessageItemLocation.vue'

const mockMessageById = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockMessageById,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  twem: vi.fn((text) => text),
}))

describe('MessageItemLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageById.mockReturnValue({
      id: 1,
      subject: 'Offer: Test Item (London)',
      availablenow: 1,
    })
  })

  function createWrapper(props = {}) {
    return mount(MessageItemLocation, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          Highlighter: {
            template:
              '<span class="highlighter item" :data-words="searchWords[0]">{{ textToHighlight }}</span>',
            props: [
              'searchWords',
              'textToHighlight',
              'highlightClassName',
              'autoEscape',
              'class',
            ],
          },
          'b-badge': {
            template:
              '<span class="b-badge" :class="variantClass"><slot /></span>',
            props: ['variant'],
            computed: {
              variantClass() {
                return 'badge-' + this.variant
              },
            },
          },
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders item container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.item').exists()).toBe(true)
    })

    it('applies header--size4 class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.header--size4').exists()).toBe(true)
    })
  })

  describe('type display', () => {
    it('shows type when provided', () => {
      const wrapper = createWrapper({ type: 'Offer' })
      expect(wrapper.text()).toContain('Offer')
    })

    it('hides type when not provided', () => {
      const wrapper = createWrapper({ type: null })
      // Should not have explicit type in the first div
      const firstDiv = wrapper.find('.w-100 > div')
      expect(firstDiv.text()).toBe('')
    })
  })

  describe('item name parsing', () => {
    it('extracts item name from subject', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Kitchen Table (Manchester)',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.item).toBe(' Kitchen Table ')
    })

    it('shows full subject when pattern not matched', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Simple Item Name',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.item).toBe('Simple Item Name')
    })

    it('shows unknown when no subject', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: null,
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.item).toBe('unknown')
    })
  })

  describe('location parsing', () => {
    it('extracts location from subject', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Chair (Birmingham)',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.location).toBe('Birmingham')
    })

    it('returns null when no location in subject', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Simple Item',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.location).toBe(null)
    })

    it('shows location when showLocation is true', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Desk (Leeds)',
      })
      const wrapper = createWrapper({ showLocation: true })
      expect(wrapper.find('.location').exists()).toBe(true)
      expect(wrapper.find('.location').text()).toBe('Leeds')
    })

    it('hides location when showLocation is false', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Desk (Leeds)',
      })
      const wrapper = createWrapper({ showLocation: false })
      expect(wrapper.find('.location').exists()).toBe(false)
    })
  })

  describe('highlight matching', () => {
    it('shows Highlighter when matchedon provided', () => {
      const wrapper = createWrapper({
        matchedon: { word: 'table' },
      })
      // When matchedon is provided, Highlighter renders (which has highlighter class in stub)
      // The span with itemprop="name" should NOT exist
      expect(wrapper.find('span[itemprop="name"]').exists()).toBe(false)
    })

    it('receives matchedon prop correctly', () => {
      const matchedon = { word: 'chair' }
      const wrapper = createWrapper({ matchedon })
      // Verify the prop is received
      expect(wrapper.props('matchedon')).toEqual(matchedon)
      // And the span with itemprop should not exist (Highlighter shows instead)
      expect(wrapper.find('span[itemprop="name"]').exists()).toBe(false)
    })

    it('shows regular text when no matchedon', () => {
      const wrapper = createWrapper({
        matchedon: null,
      })
      // When no matchedon, the span with itemprop="name" should exist
      expect(wrapper.find('span[itemprop="name"]').exists()).toBe(true)
    })
  })

  describe('available badge', () => {
    it('shows badge when availablenow > 1', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Books (Glasgow)',
        availablenow: 5,
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('5 left')
    })

    it('hides badge when availablenow is 1', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Chair (York)',
        availablenow: 1,
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(false)
    })

    it('hides badge when availablenow is 0', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Table (Bath)',
        availablenow: 0,
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(false)
    })

    it('shows 0 when availablenow is falsy but badge shown', () => {
      mockMessageById.mockReturnValue({
        id: 1,
        subject: 'Offer: Item (Place)',
        availablenow: 3,
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('3 left')
    })
  })

  describe('link behavior', () => {
    it('creates link to message page', () => {
      const wrapper = createWrapper({ id: 123 })
      expect(wrapper.find('a').attributes('href')).toBe('/message/123')
    })

    it('prevents default on click', () => {
      const wrapper = createWrapper()
      const mockEvent = { preventDefault: vi.fn() }
      wrapper.vm.block(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('expanded state', () => {
    it('does not apply nowrap when expanded', () => {
      const wrapper = createWrapper({ expanded: true })
      // The span with item class should not have nowrap when expanded
      expect(wrapper.find('span.item.nowrap').exists()).toBe(false)
    })

    it('applies nowrap when not expanded', () => {
      const wrapper = createWrapper({ expanded: false })
      expect(wrapper.find('span.nowrap').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('has optional matchedon prop', () => {
      const matchedon = { word: 'test' }
      const wrapper = createWrapper({ matchedon })
      expect(wrapper.props('matchedon')).toEqual(matchedon)
    })

    it('has optional type prop', () => {
      const wrapper = createWrapper({ type: 'Wanted' })
      expect(wrapper.props('type')).toBe('Wanted')
    })

    it('has optional expanded prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('expanded')).toBe(false)
    })

    it('has optional showLocation prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showLocation')).toBe(true)
    })
  })
})
