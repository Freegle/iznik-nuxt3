import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberships from '~/modtools/components/ModMemberships.vue'

// Mock user store
let mockUserData = null
const mockUserStore = {
  byId: vi.fn((id) => mockUserData),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModMemberships', () => {
  const createUser = (overrides = {}) => ({
    id: 456,
    displayname: 'Test User',
    memberof: [
      {
        id: 1,
        membershipid: 101,
        namedisplay: 'Group One',
        added: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        membershipid: 102,
        namedisplay: 'Group Two',
        added: '2024-02-01T10:00:00Z',
      },
    ],
    applied: [],
    ...overrides,
  })

  // Helper to create multiple groups
  const createGroups = (count, prefix = 'Group') =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      membershipid: 100 + i + 1,
      namedisplay: `${prefix} ${i + 1}`,
      added: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))

  // Helper to create applied groups
  const createApplied = (count) =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      userid: 456,
      namedisplay: `Applied ${i + 1}`,
      added: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))

  function mountComponent(props = {}, userOverrides = {}) {
    mockUserData = createUser(userOverrides)
    return mount(ModMemberships, {
      props: {
        userid: 456,
        ...props,
      },
      global: {
        stubs: {
          'b-badge': {
            template:
              '<span class="badge" :class="variant" @click="$emit(\'click\')"><slot /></span>',
            props: ['variant'],
          },
        },
        mocks: {
          timeago: (val) => `${dayjs().diff(dayjs(val), 'days')} days ago`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserData = null
  })

  describe('rendering', () => {
    it('renders the component when user exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it.each([
      ['null', null],
      ['empty array', []],
    ])('shows "Not on any communities" when memberof is %s', (_, memberof) => {
      const wrapper = mountComponent({}, { memberof })
      expect(wrapper.text()).toContain('Not on any communities')
    })

    it('shows group names when memberof has entries', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Group One')
      expect(wrapper.text()).toContain('Group Two')
    })

    it('truncates long group names to 32 characters', () => {
      const wrapper = mountComponent(
        {},
        {
          memberof: [
            {
              id: 1,
              membershipid: 101,
              namedisplay: 'This Is A Very Long Group Name That Exceeds Limit',
              added: '2024-01-01T10:00:00Z',
            },
          ],
        }
      )
      expect(wrapper.text()).toContain('This Is A Very Long Group Name T...')
      expect(wrapper.text()).not.toContain('That Exceeds Limit')
    })

    it('shows time ago for each membership', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('days ago')
    })
  })

  describe('memberof computed', () => {
    it('returns null when user has no memberof', () => {
      const wrapper = mountComponent({}, { memberof: null })
      expect(wrapper.vm.memberof).toBeNull()
    })

    it('sorts memberships by date descending (newest first)', () => {
      const wrapper = mountComponent(
        {},
        {
          memberof: [
            {
              id: 1,
              membershipid: 101,
              namedisplay: 'Old Group',
              added: '2023-01-01T10:00:00Z',
            },
            {
              id: 2,
              membershipid: 102,
              namedisplay: 'New Group',
              added: '2024-06-01T10:00:00Z',
            },
            {
              id: 3,
              membershipid: 103,
              namedisplay: 'Mid Group',
              added: '2024-03-01T10:00:00Z',
            },
          ],
        }
      )
      expect(wrapper.vm.memberof[0].namedisplay).toBe('New Group')
      expect(wrapper.vm.memberof[1].namedisplay).toBe('Mid Group')
      expect(wrapper.vm.memberof[2].namedisplay).toBe('Old Group')
    })

    it('shows first 3 memberships by default, all when allmemberships is true', async () => {
      const wrapper = mountComponent({}, { memberof: createGroups(5) })

      // Default: shows first 3
      expect(wrapper.vm.memberof.length).toBe(3)

      // Toggle to show all
      wrapper.vm.allmemberships = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.memberof.length).toBe(5)
    })
  })

  describe('hiddenmemberofs computed', () => {
    it.each([
      ['allmemberships is true', { memberof: createGroups(4) }, true, 0],
      [
        'memberof has 3 or fewer entries',
        { memberof: createGroups(2) },
        false,
        0,
      ],
      ['memberof is null', { memberof: null }, false, 0],
      ['more than 3 memberships', { memberof: createGroups(5) }, false, 2],
    ])(
      'returns correct count when %s',
      async (_, userOverrides, allmemberships, expected) => {
        const wrapper = mountComponent({}, userOverrides)
        if (allmemberships) {
          wrapper.vm.allmemberships = true
          await wrapper.vm.$nextTick()
        }
        expect(wrapper.vm.hiddenmemberofs).toBe(expected)
      }
    )
  })

  describe('expand badge', () => {
    it('shows/hides badge based on hidden memberships and toggles allmemberships', async () => {
      // With hidden memberships - badge shows
      const wrapperWithHidden = mountComponent(
        {},
        { memberof: createGroups(4) }
      )
      expect(wrapperWithHidden.text()).toContain('+1 groups')
      expect(wrapperWithHidden.vm.allmemberships).toBe(false)

      // Toggle to show all
      wrapperWithHidden.vm.allmemberships = !wrapperWithHidden.vm.allmemberships
      await wrapperWithHidden.vm.$nextTick()
      expect(wrapperWithHidden.vm.allmemberships).toBe(true)

      // Without hidden memberships - no badge
      const wrapperNoHidden = mountComponent({}, { memberof: createGroups(1) })
      expect(wrapperNoHidden.text()).not.toContain('+')
    })
  })

  describe('applied groups', () => {
    it('shows applied groups and filters out existing memberships', () => {
      const wrapper = mountComponent(
        {},
        {
          memberof: [
            {
              id: 1,
              membershipid: 101,
              namedisplay: 'Group 1',
              added: '2024-01-01',
            },
          ],
          applied: [
            {
              id: 1,
              userid: 456,
              namedisplay: 'Group 1',
              added: '2024-06-01',
            }, // Same id as memberof
            {
              id: 2,
              userid: 456,
              namedisplay: 'Applied Group',
              added: '2024-06-01',
            },
          ],
        }
      )
      expect(wrapper.text()).toContain('Applied Group')
      expect(wrapper.text()).toContain('joined')
      expect(wrapper.vm.filteredApplied.length).toBe(1)
      expect(wrapper.vm.filteredApplied[0].namedisplay).toBe('Applied Group')
    })

    it('returns empty array when user has no applied', () => {
      const wrapper = mountComponent({}, { applied: null })
      expect(wrapper.vm.filteredApplied).toEqual([])
    })

    it('shows first 3 applied by default, all when allapplied is true', async () => {
      const wrapper = mountComponent(
        {},
        {
          memberof: [],
          applied: createApplied(5),
        }
      )

      // Default: shows first 3
      expect(wrapper.vm.visibleApplied.length).toBe(3)

      // Toggle to show all
      wrapper.vm.allapplied = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.visibleApplied.length).toBe(5)
    })
  })

  describe('hiddenapplieds computed', () => {
    it.each([
      ['allapplied is true', 4, true, 0],
      ['more than 3 applied', 5, false, 2],
    ])(
      'returns correct count when %s',
      async (_, appliedCount, allapplied, expected) => {
        const wrapper = mountComponent(
          {},
          {
            memberof: [],
            applied: createApplied(appliedCount),
          }
        )
        if (allapplied) {
          wrapper.vm.allapplied = true
          await wrapper.vm.$nextTick()
        }
        expect(wrapper.vm.hiddenapplieds).toBe(expected)
      }
    )

    it('shows applied badge when hidden applied exist', () => {
      const wrapper = mountComponent(
        {},
        {
          memberof: [],
          applied: createApplied(4),
        }
      )
      expect(wrapper.text()).toContain('+1 applied')
    })
  })

  describe('daysago function', () => {
    it.each([
      ['10 days ago', 10, 10],
      ['today', 0, 0],
    ])('returns %s correctly', (_, daysBack, expected) => {
      const wrapper = mountComponent()
      const date = dayjs().subtract(daysBack, 'days').toISOString()
      expect(wrapper.vm.daysago(date)).toBe(expected)
    })
  })

  describe('recent membership styling', () => {
    it.each([
      ['text-danger for memberships within 31 days', 15, '.text-danger', true],
      [
        'text-muted for memberships older than 31 days',
        60,
        '.text-muted',
        true,
      ],
    ])('applies %s', (_, daysBack, selector, shouldExist) => {
      const wrapper = mountComponent(
        {},
        {
          memberof: [
            {
              id: 1,
              membershipid: 101,
              namedisplay: 'Test Group',
              added: dayjs().subtract(daysBack, 'days').toISOString(),
            },
          ],
        }
      )
      expect(wrapper.find(selector).exists()).toBe(shouldExist)
    })
  })
})
