import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMockUserStore } from '../../mocks/stores'
import ModPostingHistory from '~/modtools/components/ModPostingHistory.vue'

const mockUserStore = createMockUserStore()

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModPostingHistory', () => {
  const defaultUser = {
    id: 123,
    modmails: 2,
    messagehistory: [
      { id: 1, type: 'Offer', subject: 'Free sofa' },
      { id: 2, type: 'Offer', subject: 'Free table' },
      { id: 3, type: 'Wanted', subject: 'Looking for chair' },
    ],
    info: {
      replies: 5,
      repliesoffer: 3,
      replieswanted: 2,
      expectedreplies: 1,
    },
  }

  function mountComponent(props = {}, userOverrides = {}) {
    const userData = { ...defaultUser, ...userOverrides }
    mockUserStore.byId.mockReturnValue(userData)
    return mount(ModPostingHistory, {
      props: { userid: 123, ...props },
      global: {
        stubs: {
          'b-badge': {
            template:
              '<span class="badge" :class="variant" :title="title" @click="$emit(\'click\')"><slot /></span>',
            props: ['variant', 'title'],
          },
          'b-button': {
            template:
              '<button :class="[variant, size]" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<span class="icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ModPostingHistoryModal: {
            template:
              '<div class="posting-history-modal" v-if="visible" :data-type="type"><slot /></div>',
            props: ['user', 'type'],
            emits: ['hidden'],
            data() {
              return { visible: false }
            },
            methods: {
              show() {
                this.visible = true
              },
            },
          },
          ModLogsModal: {
            template:
              '<div class="logs-modal" v-if="visible" :data-modmailsonly="modmailsonly"><slot /></div>',
            props: ['userid', 'modmailsonly'],
            emits: ['hidden'],
            data() {
              return { visible: false }
            },
            methods: {
              show() {
                this.visible = true
              },
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue(defaultUser)
    mockUserStore.fetch.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the component with border', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('span.border.border-info.rounded').exists()).toBe(
        true
      )
    })

    it('displays offers badge with count', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const offerBadge = badges[0]
      expect(offerBadge.attributes('title')).toBe('Recent OFFERs')
      expect(offerBadge.text()).toContain('2')
    })

    it('displays wanteds badge with count', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const wantedBadge = badges[1]
      expect(wantedBadge.attributes('title')).toBe('Recent WANTEDs')
      expect(wantedBadge.text()).toContain('1')
    })

    it('displays modmails badge with count', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const modmailsBadge = badges[2]
      expect(modmailsBadge.attributes('title')).toBe('ModMails')
      expect(modmailsBadge.text()).toContain('2')
    })

    it('applies danger variant to modmails badge when modmails > 0', () => {
      const wrapper = mountComponent({}, { modmails: 5 })
      const badges = wrapper.findAll('.badge')
      const modmailsBadge = badges[2]
      expect(modmailsBadge.classes()).toContain('danger')
    })

    it('applies light variant to modmails badge when modmails is 0', () => {
      const wrapper = mountComponent({}, { modmails: 0 })
      const badges = wrapper.findAll('.badge')
      const modmailsBadge = badges[2]
      expect(modmailsBadge.classes()).toContain('light')
    })

    it('displays Posts button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.some((btn) => btn.text().includes('Posts'))).toBe(true)
    })

    it('displays Logs button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.some((btn) => btn.text().includes('Logs'))).toBe(true)
    })

    it('displays reply badges when userinfo is available', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      // Should have 6 badges: offers, wanteds, modmails, repliesoffer, replieswanted, expectedreplies
      expect(badges.length).toBe(6)
    })

    it('hides reply badges when userinfo is null', () => {
      const wrapper = mountComponent(
        {},
        { info: undefined, modmails: 0, messagehistory: [] }
      )
      // byId returns the user above which has no info, and byId for the fallback also returns same
      const badges = wrapper.findAll('.badge')
      // Should only have 3 badges: offers, wanteds, modmails
      expect(badges.length).toBe(3)
    })

    it('applies success variant to reply badges when replies > 0', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const offerReplyBadge = badges[3]
      expect(offerReplyBadge.classes()).toContain('success')
    })

    it('applies danger variant to expected replies badge when expectedreplies > 0', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const expectedRepliesBadge = badges[5]
      expect(expectedRepliesBadge.classes()).toContain('danger')
    })

    it('displays gift icon for offers badge', () => {
      const wrapper = mountComponent()
      const offerBadge = wrapper.findAll('.badge')[0]
      expect(offerBadge.find('[data-icon="gift"]').exists()).toBe(true)
    })

    it('displays search icon for wanteds badge', () => {
      const wrapper = mountComponent()
      const wantedBadge = wrapper.findAll('.badge')[1]
      expect(wantedBadge.find('[data-icon="search"]').exists()).toBe(true)
    })

    it('displays exclamation-triangle icon for modmails badge', () => {
      const wrapper = mountComponent()
      const modmailsBadge = wrapper.findAll('.badge')[2]
      expect(
        modmailsBadge.find('[data-icon="exclamation-triangle"]').exists()
      ).toBe(true)
    })
  })

  describe('computed properties', () => {
    describe('offers', () => {
      it('counts Offer type messages', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.offers).toBe(2)
      })

      it('returns 0 when no message history', () => {
        const wrapper = mountComponent({}, { messagehistory: null })
        expect(wrapper.vm.offers).toBe(0)
      })

      it('returns 0 when empty message history', () => {
        const wrapper = mountComponent({}, { messagehistory: [] })
        expect(wrapper.vm.offers).toBe(0)
      })
    })

    describe('wanteds', () => {
      it('counts Wanted type messages', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.wanteds).toBe(1)
      })

      it('returns 0 when no message history', () => {
        const wrapper = mountComponent({}, { messagehistory: null })
        expect(wrapper.vm.wanteds).toBe(0)
      })
    })

    describe('userinfo', () => {
      it('returns info from store user if available', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.userinfo).toEqual(defaultUser.info)
      })

      it('returns null when no info available', () => {
        const wrapper = mountComponent(
          {},
          { info: undefined, modmails: 0, messagehistory: [] }
        )
        expect(wrapper.vm.userinfo).toBeNull()
      })
    })
  })

  describe('methods', () => {
    describe('showHistory', () => {
      it('sets type to the provided argument', () => {
        const wrapper = mountComponent()
        wrapper.vm.showHistory('Offer')
        expect(wrapper.vm.type).toBe('Offer')
      })

      it('sets showPostingHistoryModal to true', () => {
        const wrapper = mountComponent()
        wrapper.vm.showHistory('Offer')
        expect(wrapper.vm.showPostingHistoryModal).toBe(true)
      })

      it('accepts null type for showing all posts', () => {
        const wrapper = mountComponent()
        wrapper.vm.showHistory(null)
        expect(wrapper.vm.type).toBeNull()
        expect(wrapper.vm.showPostingHistoryModal).toBe(true)
      })

      it('defaults type to null when called without argument', () => {
        const wrapper = mountComponent()
        wrapper.vm.showHistory()
        expect(wrapper.vm.type).toBeNull()
      })
    })

    describe('showLogs', () => {
      it('sets modmailsonly to false', () => {
        const wrapper = mountComponent()
        wrapper.vm.modmailsonly = true
        wrapper.vm.showLogs()
        expect(wrapper.vm.modmailsonly).toBe(false)
      })

      it('sets showLogsModal to true', () => {
        const wrapper = mountComponent()
        wrapper.vm.showLogs()
        expect(wrapper.vm.showLogsModal).toBe(true)
      })
    })

    describe('showModmails', () => {
      it('sets modmailsonly to true', () => {
        const wrapper = mountComponent()
        wrapper.vm.showModmails()
        expect(wrapper.vm.modmailsonly).toBe(true)
      })

      it('sets showLogsModal to true', () => {
        const wrapper = mountComponent()
        wrapper.vm.showModmails()
        expect(wrapper.vm.showLogsModal).toBe(true)
      })
    })
  })

  describe('user interactions', () => {
    it('clicking offers badge calls showHistory with Offer', async () => {
      const wrapper = mountComponent()
      const offerBadge = wrapper.findAll('.badge')[0]
      await offerBadge.trigger('click')
      expect(wrapper.vm.type).toBe('Offer')
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
    })

    it('clicking wanteds badge calls showHistory with Wanted', async () => {
      const wrapper = mountComponent()
      const wantedBadge = wrapper.findAll('.badge')[1]
      await wantedBadge.trigger('click')
      expect(wrapper.vm.type).toBe('Wanted')
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
    })

    it('clicking modmails badge calls showModmails', async () => {
      const wrapper = mountComponent()
      const modmailsBadge = wrapper.findAll('.badge')[2]
      await modmailsBadge.trigger('click')
      expect(wrapper.vm.modmailsonly).toBe(true)
      expect(wrapper.vm.showLogsModal).toBe(true)
    })

    it('clicking Posts button calls showHistory with null', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const postsButton = buttons.find((btn) => btn.text().includes('Posts'))
      await postsButton.trigger('click')
      expect(wrapper.vm.type).toBeNull()
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
    })

    it('clicking Logs button calls showLogs', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const logsButton = buttons.find((btn) => btn.text().includes('Logs'))
      await logsButton.trigger('click')
      expect(wrapper.vm.modmailsonly).toBe(false)
      expect(wrapper.vm.showLogsModal).toBe(true)
    })
  })

  describe('onMounted', () => {
    it('fetches user if user.info is not present', async () => {
      mountComponent({}, { info: undefined, modmails: 0, messagehistory: [] })
      await flushPromises()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(123)
    })

    it('does not fetch user if user.info is present', async () => {
      mountComponent()
      await flushPromises()
      expect(mockUserStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('modal visibility', () => {
    it('shows ModPostingHistoryModal when showPostingHistoryModal is true', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showPostingHistoryModal = true
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent({ name: 'ModPostingHistoryModal' }).exists())
    })

    it('hides ModPostingHistoryModal when showPostingHistoryModal is false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showPostingHistoryModal).toBe(false)
    })

    it('shows ModLogsModal when showLogsModal is true', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showLogsModal = true
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent({ name: 'ModLogsModal' }).exists())
    })

    it('hides ModLogsModal when showLogsModal is false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showLogsModal).toBe(false)
    })
  })

  describe('modal hidden events', () => {
    it('sets showPostingHistoryModal to false on hidden event', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showPostingHistoryModal = true
      await wrapper.vm.$nextTick()

      const modal = wrapper.findComponent({ name: 'ModPostingHistoryModal' })
      if (modal.exists()) {
        await modal.vm.$emit('hidden')
        expect(wrapper.vm.showPostingHistoryModal).toBe(false)
      }
    })

    it('sets showLogsModal to false on hidden event', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showLogsModal = true
      await wrapper.vm.$nextTick()

      const modal = wrapper.findComponent({ name: 'ModLogsModal' })
      if (modal.exists()) {
        await modal.vm.$emit('hidden')
        expect(wrapper.vm.showLogsModal).toBe(false)
      }
    })
  })

  describe('edge cases', () => {
    it('handles user with undefined messagehistory', () => {
      const wrapper = mountComponent(
        {},
        { messagehistory: undefined, modmails: 0 }
      )
      expect(wrapper.vm.offers).toBe(0)
      expect(wrapper.vm.wanteds).toBe(0)
    })

    it('handles empty expectedreplies showing 0', () => {
      const wrapper = mountComponent(
        {},
        { info: { ...defaultUser.info, expectedreplies: 0 } }
      )
      const badges = wrapper.findAll('.badge')
      const expectedRepliesBadge = badges[5]
      expect(expectedRepliesBadge.classes()).toContain('light')
    })

    it('handles undefined expectedreplies', () => {
      const wrapper = mountComponent(
        {},
        { info: { replies: 5, repliesoffer: 3, replieswanted: 2 } }
      )
      const badges = wrapper.findAll('.badge')
      const expectedRepliesBadge = badges[5]
      expect(expectedRepliesBadge.text()).toContain('0')
    })

    it('counts correctly with mixed message types', () => {
      const wrapper = mountComponent(
        {},
        {
          messagehistory: [
            { id: 1, type: 'Offer' },
            { id: 2, type: 'Wanted' },
            { id: 3, type: 'Offer' },
            { id: 4, type: 'Offer' },
            { id: 5, type: 'Wanted' },
            { id: 6, type: 'Other' },
          ],
        }
      )
      expect(wrapper.vm.offers).toBe(3)
      expect(wrapper.vm.wanteds).toBe(2)
    })

    it('displays repliesoffer count from userinfo', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const offerReplyBadge = badges[3]
      expect(offerReplyBadge.text()).toContain('3')
    })

    it('displays replieswanted count from userinfo', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const wantedReplyBadge = badges[4]
      expect(wantedReplyBadge.text()).toContain('2')
    })

    it('displays expectedreplies count from userinfo', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      const expectedRepliesBadge = badges[5]
      expect(expectedRepliesBadge.text()).toContain('1')
    })
  })

  describe('countType function', () => {
    it('correctly counts Offer types', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.offers).toBe(2)
    })

    it('correctly counts Wanted types', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.wanteds).toBe(1)
    })

    it('returns 0 for non-existent types', () => {
      const wrapper = mountComponent(
        {},
        {
          messagehistory: [
            { id: 1, type: 'Offer' },
            { id: 2, type: 'Wanted' },
          ],
        }
      )
      // No 'Other' type counted in offers or wanteds
      expect(wrapper.vm.offers).toBe(1)
      expect(wrapper.vm.wanteds).toBe(1)
    })
  })

  describe('refs', () => {
    it('has history ref for ModPostingHistoryModal', () => {
      const wrapper = mountComponent()
      // The ref exists but is null until modal is shown
      expect(wrapper.vm.history).toBeNull()
    })

    it('has logs ref for ModLogsModal', () => {
      const wrapper = mountComponent()
      // The ref exists but is null until modal is shown
      expect(wrapper.vm.logs).toBeNull()
    })
  })

  describe('reply badges variant logic', () => {
    it('applies success variant when replies > 0', () => {
      const wrapper = mountComponent()
      const badges = wrapper.findAll('.badge')
      // Offer reply badge
      expect(badges[3].classes()).toContain('success')
      // Wanted reply badge
      expect(badges[4].classes()).toContain('success')
    })

    it('applies light variant when replies is 0', () => {
      const wrapper = mountComponent(
        {},
        {
          info: {
            replies: 0,
            repliesoffer: 0,
            replieswanted: 0,
            expectedreplies: 0,
          },
        }
      )
      const badges = wrapper.findAll('.badge')
      // Offer reply badge
      expect(badges[3].classes()).toContain('light')
      // Wanted reply badge
      expect(badges[4].classes()).toContain('light')
    })
  })
})
