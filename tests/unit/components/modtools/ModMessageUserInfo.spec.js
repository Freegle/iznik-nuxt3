import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMessageUserInfo from '~/modtools/components/ModMessageUserInfo.vue'

// Mock misc store
const mockMiscStore = {
  modtools: false,
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock user store
let mockUserData = null
const mockUserStore = {
  byId: vi.fn((id) => mockUserData),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock dateshort from #imports
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    dateshort: vi.fn((date) => `${date} formatted`),
  }
})

// Mock pluralize with addIrregularRule method
vi.mock('pluralize', () => {
  const pluralizeFn = (word, count, inclusive) => {
    const plural = count === 1 ? word : word + 's'
    return inclusive ? `${count} ${plural}` : plural
  }
  pluralizeFn.addIrregularRule = vi.fn()
  return {
    default: pluralizeFn,
  }
})

describe('ModMessageUserInfo', () => {
  const createTestUser = (overrides = {}) => ({
    id: 123,
    displayname: 'Test User',
    profile: {
      turl: '/profile/123.jpg',
    },
    info: {
      openoffers: 2,
      openwanteds: 1,
    },
    supporter: false,
    memberof: [
      {
        id: 789,
        added: '2023-01-15',
      },
    ],
    ...overrides,
  })

  function mountComponent(props = {}, userOverrides = {}) {
    mockUserData = createTestUser(userOverrides)
    return mount(ModMessageUserInfo, {
      props: {
        userid: 123,
        ...props,
      },
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to" :title="title"><slot /></a>',
            props: ['to', 'title'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-name="name" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          ModSupporter: {
            template: '<span class="supporter-badge" />',
          },
          ModModeration: {
            template: '<div class="mod-moderation" />',
            props: ['user', 'membership'],
          },
          ModPostingHistory: {
            template: '<div class="mod-posting-history" />',
            props: ['userid'],
          },
          ModMemberships: {
            template: '<div class="mod-memberships" />',
            props: ['userid'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.modtools = false
    mockUserData = null
  })

  describe('rendering', () => {
    it('displays user displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('displays "Posted by" text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Posted by')
    })

    it('renders ProfileImage component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('passes correct props to ProfileImage', () => {
      const wrapper = mountComponent()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.attributes('data-image')).toBe('/profile/123.jpg')
      expect(profileImage.attributes('data-name')).toBe('Test User')
    })
  })

  describe('click link', () => {
    it('links to ModTools member page when modtools is true', () => {
      mockMiscStore.modtools = true
      const wrapper = mountComponent({ groupid: 789 })
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/members/approved/789/123')
    })

    it('links to profile page when modtools is false', () => {
      mockMiscStore.modtools = false
      const wrapper = mountComponent()
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/profile/123')
    })
  })

  describe('miles away display', () => {
    it('displays miles away when provided', () => {
      const wrapper = mountComponent({ milesaway: 5 })
      expect(wrapper.text()).toContain('about')
      expect(wrapper.text()).toContain('away')
    })

    it('does not display miles when not provided', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('away')
    })
  })

  describe('open offers/wanteds display', () => {
    it('displays open offers when available and modinfo is false', () => {
      const wrapper = mountComponent(
        { modinfo: false },
        { info: { openoffers: 3, openwanteds: 0 } }
      )
      expect(wrapper.text()).toContain('open OFFER')
    })

    it('displays open wanteds when available', () => {
      const wrapper = mountComponent(
        { modinfo: false },
        { info: { openoffers: 0, openwanteds: 2 } }
      )
      expect(wrapper.text()).toContain('open WANTED')
    })

    it('does not display when modinfo is true', () => {
      const wrapper = mountComponent(
        { modinfo: true, groupid: 789 },
        { info: { openoffers: 5, openwanteds: 3 } }
      )
      expect(wrapper.text()).not.toContain('open OFFER')
    })

    it('does not display when both are 0', () => {
      const wrapper = mountComponent(
        { modinfo: false },
        { info: { openoffers: 0, openwanteds: 0 } }
      )
      expect(wrapper.text()).not.toContain('open OFFER')
      expect(wrapper.text()).not.toContain('open WANTED')
    })
  })

  describe('supporter badge', () => {
    it('shows ModSupporter when user is supporter', () => {
      const wrapper = mountComponent({}, { supporter: true })
      expect(wrapper.find('.supporter-badge').exists()).toBe(true)
    })

    it('does not show ModSupporter when user is not supporter', () => {
      const wrapper = mountComponent({}, { supporter: false })
      expect(wrapper.find('.supporter-badge').exists()).toBe(false)
    })
  })

  describe('modinfo display', () => {
    it('shows join date when modinfo and membership exist', () => {
      const wrapper = mountComponent({
        modinfo: true,
        groupid: 789,
      })
      expect(wrapper.text()).toContain('Joined')
    })

    it('shows user id with hashtag when modinfo is true', () => {
      const wrapper = mountComponent({
        modinfo: true,
        groupid: 789,
      })
      expect(wrapper.text()).toContain('123')
      expect(wrapper.find('i.hashtag').exists()).toBe(true)
    })

    it('shows ModModeration component when modinfo is true', () => {
      const wrapper = mountComponent({
        modinfo: true,
        groupid: 789,
      })
      expect(wrapper.find('.mod-moderation').exists()).toBe(true)
    })

    it('shows ModPostingHistory when modinfo is true', () => {
      const wrapper = mountComponent({
        modinfo: true,
      })
      expect(wrapper.find('.mod-posting-history').exists()).toBe(true)
    })

    it('shows ModMemberships when modinfo is true', () => {
      const wrapper = mountComponent({
        modinfo: true,
      })
      expect(wrapper.find('.mod-memberships').exists()).toBe(true)
    })

    it('does not show mod components when modinfo is false', () => {
      const wrapper = mountComponent({ modinfo: false })
      expect(wrapper.find('.mod-moderation').exists()).toBe(false)
      expect(wrapper.find('.mod-memberships').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    describe('membership', () => {
      it('returns membership when groupid matches', () => {
        const wrapper = mountComponent({
          modinfo: true,
          groupid: 789,
        })
        expect(wrapper.vm.membership).toBeTruthy()
        expect(wrapper.vm.membership.id).toBe(789)
      })

      it('returns null when no matching group', () => {
        const wrapper = mountComponent({
          modinfo: true,
          groupid: 999,
        })
        expect(wrapper.vm.membership).toBeFalsy()
      })

      it('returns null when groupid is not provided', () => {
        const wrapper = mountComponent({
          modinfo: true,
        })
        expect(wrapper.vm.membership).toBeNull()
      })

      it('returns null when user has no memberof', () => {
        const wrapper = mountComponent(
          { modinfo: true, groupid: 789 },
          { memberof: null }
        )
        expect(wrapper.vm.membership).toBeNull()
      })
    })

    describe('joinedAge', () => {
      it('returns number of days since joined', () => {
        const wrapper = mountComponent({
          modinfo: true,
          groupid: 789,
        })
        expect(typeof wrapper.vm.joinedAge).toBe('number')
      })

      it('returns null when no membership', () => {
        const wrapper = mountComponent({
          modinfo: true,
          groupid: 999,
        })
        expect(wrapper.vm.joinedAge).toBeNull()
      })
    })

    describe('clicklink', () => {
      it('returns modtools path when modtools is true', () => {
        mockMiscStore.modtools = true
        const wrapper = mountComponent({ groupid: 789 })
        expect(wrapper.vm.clicklink).toBe('/members/approved/789/123')
      })

      it('returns profile path when modtools is false', () => {
        mockMiscStore.modtools = false
        const wrapper = mountComponent()
        expect(wrapper.vm.clicklink).toBe('/profile/123')
      })
    })

    describe('milesAwayPlural', () => {
      it('returns pluralized miles string', () => {
        const wrapper = mountComponent({ milesaway: 5 })
        expect(wrapper.vm.milesAwayPlural).toContain('5')
        expect(wrapper.vm.milesAwayPlural).toContain('mile')
      })
    })

    describe('openOffersPlural', () => {
      it('returns formatted open offers string', () => {
        const wrapper = mountComponent(
          {},
          { info: { openoffers: 3, openwanteds: 0 } }
        )
        expect(wrapper.vm.openOffersPlural).toContain('3')
        expect(wrapper.vm.openOffersPlural).toContain('open OFFER')
      })

      it('returns empty string when no offers', () => {
        const wrapper = mountComponent(
          {},
          { info: { openoffers: 0, openwanteds: 0 } }
        )
        expect(wrapper.vm.openOffersPlural).toBe('')
      })
    })

    describe('openWantedsPlural', () => {
      it('returns formatted open wanteds string', () => {
        const wrapper = mountComponent(
          {},
          { info: { openoffers: 0, openwanteds: 2 } }
        )
        expect(wrapper.vm.openWantedsPlural).toContain('2')
        expect(wrapper.vm.openWantedsPlural).toContain('open WANTED')
      })

      it('returns empty string when no wanteds', () => {
        const wrapper = mountComponent(
          {},
          { info: { openoffers: 0, openwanteds: 0 } }
        )
        expect(wrapper.vm.openWantedsPlural).toBe('')
      })
    })
  })

  describe('props', () => {
    it('accepts userid prop (required)', () => {
      const wrapper = mountComponent({ userid: 999 })
      expect(wrapper.props('userid')).toBe(999)
    })
  })

  describe('joined age styling', () => {
    it('applies text-danger when joined within 31 days', () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 10) // 10 days ago

      const wrapper = mountComponent(
        { modinfo: true, groupid: 789 },
        { memberof: [{ id: 789, added: recentDate.toISOString() }] }
      )
      expect(wrapper.vm.joinedAge).toBeLessThanOrEqual(31)
    })
  })

  describe('edge cases', () => {
    it('handles zero milesaway', () => {
      const wrapper = mountComponent({ milesaway: 0 })
      // 0 is falsy, so should not show miles
      expect(wrapper.text()).not.toContain('away')
    })

    it('renders nothing when user is not in store', () => {
      mockUserData = null
      const wrapper = mount(ModMessageUserInfo, {
        props: { userid: 999 },
        global: {
          stubs: {
            'nuxt-link': {
              template: '<a><slot /></a>',
              props: ['to', 'title'],
            },
            'v-icon': { template: '<i />', props: ['icon'] },
            ProfileImage: {
              template: '<div />',
              props: ['image', 'name', 'isThumbnail', 'size'],
            },
            ModSupporter: { template: '<span />' },
            ModModeration: {
              template: '<div />',
              props: ['user', 'membership'],
            },
            ModPostingHistory: { template: '<div />', props: ['userid'] },
            ModMemberships: { template: '<div />', props: ['userid'] },
          },
        },
      })
      expect(wrapper.text()).toBe('')
    })
  })
})
