import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMemberSummary from '~/modtools/components/ModMemberSummary.vue'

// Mock user store
const mockUserStore = {
  byId: vi.fn(),
  fetchMT: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock pluralise composable
vi.mock('~/modtools/composables/usePluralise', () => ({
  pluralise: (word, count, withNumber) => {
    const num = withNumber ? `${count} ` : ''
    if (Array.isArray(word)) {
      return num + (count === 1 ? word[0] : word[1])
    }
    return num + (count === 1 ? word : word + 's')
  },
}))

describe('ModMemberSummary', () => {
  // Sample member data
  const createMember = (overrides = {}) => ({
    id: 123,
    userid: 456,
    modmails: 0,
    messagehistory: [],
    info: null,
    ...overrides,
  })

  const createMessageHistory = (items) =>
    items.map((item, idx) => ({
      id: idx + 1,
      type: item.type || 'Offer',
      daysago: item.daysago || 5,
      deleted: item.deleted || false,
      ...item,
    }))

  function mountComponent(props = {}) {
    return mount(ModMemberSummary, {
      props: {
        member: createMember(),
        ...props,
      },
      global: {
        stubs: {
          'b-badge': {
            template:
              '<span class="badge" :class="variant" :title="title" @click="$emit(\'click\')"><slot /></span>',
            props: ['variant', 'title'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
          ModPostingHistoryModal: {
            template: '<div class="posting-history-modal" />',
            methods: { show: vi.fn() },
          },
          ModLogsModal: {
            template: '<div class="logs-modal" />',
            props: ['userid', 'modmailsonly'],
            methods: { show: vi.fn() },
          },
        },
        mocks: {
          pluralise: (word, count, withNumber) => {
            const num = withNumber ? `${count} ` : ''
            if (Array.isArray(word)) {
              return num + (count === 1 ? word[0] : word[1])
            }
            return num + (count === 1 ? word : word + 's')
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue(null)
    mockUserStore.fetchMT.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders OFFER badge', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('OFFER')
    })

    it('renders WANTED badge', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('WANTED')
    })

    it('renders Modmail badge', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Modmail')
    })

    it('shows 0 Modmails when member has no modmails', () => {
      const wrapper = mountComponent({
        member: createMember({ modmails: 0 }),
      })
      expect(wrapper.text()).toContain('0 Modmails')
    })

    it('shows modmail count when member has modmails', () => {
      const wrapper = mountComponent({
        member: createMember({ modmails: 5 }),
      })
      expect(wrapper.text()).toContain('5 Modmails')
    })

    it('shows singular Modmail when count is 1', () => {
      const wrapper = mountComponent({
        member: createMember({ modmails: 1 }),
      })
      expect(wrapper.text()).toContain('1 Modmail')
    })
  })

  describe('badge variants', () => {
    it('shows success variant for OFFER badge when offers > 0', () => {
      const member = createMember({
        messagehistory: createMessageHistory([{ type: 'Offer', daysago: 5 }]),
      })
      const wrapper = mountComponent({ member })
      const badges = wrapper.findAll('.badge')
      const offerBadge = badges[0]
      expect(offerBadge.classes()).toContain('success')
    })

    it('shows light variant for OFFER badge when offers = 0', () => {
      const wrapper = mountComponent({
        member: createMember({ messagehistory: [] }),
      })
      const badges = wrapper.findAll('.badge')
      const offerBadge = badges[0]
      expect(offerBadge.classes()).toContain('light')
    })

    it('shows success variant for WANTED badge when wanteds > 0', () => {
      const member = createMember({
        messagehistory: createMessageHistory([{ type: 'Wanted', daysago: 5 }]),
      })
      const wrapper = mountComponent({ member })
      const badges = wrapper.findAll('.badge')
      const wantedBadge = badges[1]
      expect(wantedBadge.classes()).toContain('success')
    })

    it('shows danger variant for Modmail badge when modmails > 0', () => {
      const wrapper = mountComponent({
        member: createMember({ modmails: 3 }),
      })
      const badges = wrapper.findAll('.badge')
      const modmailBadge = badges[2]
      expect(modmailBadge.classes()).toContain('danger')
    })

    it('shows light variant for Modmail badge when modmails = 0', () => {
      const wrapper = mountComponent({
        member: createMember({ modmails: 0 }),
      })
      const badges = wrapper.findAll('.badge')
      const modmailBadge = badges[2]
      expect(modmailBadge.classes()).toContain('light')
    })
  })

  describe('countType logic', () => {
    it('counts only messages within last 31 days', () => {
      const member = createMember({
        messagehistory: createMessageHistory([
          { type: 'Offer', daysago: 5 }, // counted
          { type: 'Offer', daysago: 30 }, // counted
          { type: 'Offer', daysago: 31 }, // NOT counted (>= 31)
          { type: 'Offer', daysago: 100 }, // NOT counted
        ]),
      })
      const wrapper = mountComponent({ member })
      // Should show "2 OFFERs"
      expect(wrapper.text()).toContain('2 OFFERs')
    })

    it('does not count deleted messages', () => {
      const member = createMember({
        messagehistory: createMessageHistory([
          { type: 'Offer', daysago: 5, deleted: false }, // counted
          { type: 'Offer', daysago: 5, deleted: true }, // NOT counted
        ]),
      })
      const wrapper = mountComponent({ member })
      expect(wrapper.text()).toContain('1 OFFER')
    })

    it('counts Offers and Wanteds separately', () => {
      const member = createMember({
        messagehistory: createMessageHistory([
          { type: 'Offer', daysago: 5 },
          { type: 'Offer', daysago: 10 },
          { type: 'Wanted', daysago: 5 },
        ]),
      })
      const wrapper = mountComponent({ member })
      expect(wrapper.text()).toContain('2 OFFERs')
      expect(wrapper.text()).toContain('1 WANTED')
    })

    it('handles empty messagehistory', () => {
      const wrapper = mountComponent({
        member: createMember({ messagehistory: [] }),
      })
      expect(wrapper.text()).toContain('0 OFFERs')
      expect(wrapper.text()).toContain('0 WANTEDs')
    })

    it('handles missing messagehistory', () => {
      const wrapper = mountComponent({
        member: createMember({ messagehistory: undefined }),
      })
      expect(wrapper.text()).toContain('0 OFFERs')
      expect(wrapper.text()).toContain('0 WANTEDs')
    })
  })

  describe('userinfo computed', () => {
    it('returns member.info when available', () => {
      const member = createMember({
        info: { repliesoffer: 5, replieswanted: 3, expectedreplies: 2 },
      })
      const wrapper = mountComponent({ member })
      // Should show reply badges with these values
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toContain('2 RSVPs')
    })

    it('falls back to userStore when member.info is null', () => {
      mockUserStore.byId.mockReturnValue({
        info: { repliesoffer: 10, replieswanted: 7, expectedreplies: 1 },
      })
      const wrapper = mountComponent({
        member: createMember({ info: null }),
      })
      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('7')
      expect(wrapper.text()).toContain('1 RSVP')
    })

    it('returns null when no info available', () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = mountComponent({
        member: createMember({ info: null }),
      })
      // Reply badges should not be shown when userinfo is null
      // Count badges - should only have 3 (Offer, Wanted, Modmail)
      const badges = wrapper.findAll('.badge')
      expect(badges.length).toBe(3)
    })

    it('shows reply badges when userinfo is available', () => {
      const member = createMember({
        info: { repliesoffer: 5, replieswanted: 3, expectedreplies: 2 },
      })
      const wrapper = mountComponent({ member })
      // Should have 6 badges total
      const badges = wrapper.findAll('.badge')
      expect(badges.length).toBe(6)
    })
  })

  describe('onMounted', () => {
    it('fetches user data when member.id exists and not in store', () => {
      mockUserStore.byId.mockReturnValue(null)
      mountComponent({
        member: createMember({ id: 789 }),
      })
      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        id: 789,
        info: true,
        emailhistory: true,
      })
    })

    it('does not fetch when user already in store', () => {
      mockUserStore.byId.mockReturnValue({ id: 789, info: {} })
      mountComponent({
        member: createMember({ id: 789 }),
      })
      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })

    it('does not fetch when member.id is falsy', () => {
      mountComponent({
        member: createMember({ id: null }),
      })
      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })
  })

  describe('click handlers', () => {
    it('clicking OFFER badge triggers showHistory with Offer type', async () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      await badges[0].trigger('click')
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
      expect(wrapper.vm.type).toBe('Offer')
    })

    it('clicking WANTED badge triggers showHistory with Wanted type', async () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      await badges[1].trigger('click')
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
      expect(wrapper.vm.type).toBe('Wanted')
    })

    it('clicking Modmail badge triggers showModmails', async () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      await badges[2].trigger('click')
      expect(wrapper.vm.showLogsModal).toBe(true)
    })
  })

  describe('badge titles', () => {
    it('OFFER badge has correct title', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      expect(badges[0].attributes('title')).toBe('Recent OFFERs')
    })

    it('WANTED badge has correct title', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      expect(badges[1].attributes('title')).toBe('Recent WANTEDs')
    })

    it('Modmail badge has correct title', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      expect(badges[2].attributes('title')).toBe('Recent ModMails')
    })
  })

  describe('RSVP badge', () => {
    it('shows danger variant when expectedreplies > 0', () => {
      const member = createMember({
        info: { repliesoffer: 0, replieswanted: 0, expectedreplies: 5 },
      })
      const wrapper = mountComponent({ member })
      const badges = wrapper.findAll('.badge')
      const rsvpBadge = badges[5] // 6th badge
      expect(rsvpBadge.classes()).toContain('danger')
    })

    it('shows light variant when expectedreplies = 0', () => {
      const member = createMember({
        info: { repliesoffer: 0, replieswanted: 0, expectedreplies: 0 },
      })
      const wrapper = mountComponent({ member })
      const badges = wrapper.findAll('.badge')
      const rsvpBadge = badges[5]
      expect(rsvpBadge.classes()).toContain('light')
    })

    it('handles undefined expectedreplies', () => {
      const member = createMember({
        info: { repliesoffer: 0, replieswanted: 0 },
      })
      const wrapper = mountComponent({ member })
      expect(wrapper.text()).toContain('0 RSVPs')
    })
  })
})
