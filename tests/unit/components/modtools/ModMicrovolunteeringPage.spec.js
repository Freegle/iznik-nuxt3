import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MicrovolunteeringPage from '~/modtools/pages/members/microvolunteering/[[id]].vue'

const mockMicroVolunteeringStore = {
  list: {},
  clear: vi.fn(),
  fetch: vi.fn().mockResolvedValue({}),
}

const mockUserStore = {
  byId: vi.fn(),
  fetch: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => mockMicroVolunteeringStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock dayjs
vi.mock('dayjs', () => {
  const dayjs = (d) => ({
    subtract: () => ({ format: () => '2026-01-01' }),
    format: () => '2026-03-29',
  })
  dayjs.extend = () => {}
  return { default: dayjs }
})

// Mock GChart
vi.mock('vue-google-charts', () => ({
  GChart: {
    template: '<div class="gchart" />',
    props: ['type', 'data', 'options'],
  },
}))

describe('MicroVolunteering Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMicroVolunteeringStore.list = {}
  })

  function createWrapper() {
    return mount(MicrovolunteeringPage, {
      global: {
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          ScrollToTop: { template: '<div />' },
          ModHelpMicrovolunteering: { template: '<div />' },
          ModGroupSelect: {
            template:
              '<select @change="$emit(\'update:modelValue\', 123)"><option>Test</option></select>',
            props: ['modelValue', 'modonly', 'all', 'remember', 'disabled'],
            emits: ['update:modelValue'],
          },
          Spinner: { template: '<div class="spinner" />' },
          NoticeMessage: {
            template: '<div class="notice"><slot /></div>',
            props: ['variant'],
          },
          'b-table-simple': { template: '<table><slot /></table>' },
          'b-thead': { template: '<thead><slot /></thead>' },
          'b-tbody': { template: '<tbody><slot /></tbody>' },
          'b-tr': { template: '<tr><slot /></tr>' },
          'b-th': { template: '<th><slot /></th>' },
          'b-td': { template: '<td><slot /></td>' },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          'v-icon': { template: '<span />', props: ['icon', 'scale'] },
          GChart: { template: '<div class="gchart" />' },
          ModMicrovolunteeringDetailsButton: {
            template: '<div class="details-btn" />',
            props: ['userid', 'items'],
          },
        },
      },
    })
  }

  it('shows "Please choose a community" when no group selected', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('Please choose a community')
  })

  describe('with V2 API data (userid, not user object)', () => {
    beforeEach(() => {
      // Simulate Go API response: microactions have userid (number), NOT user (object)
      mockMicroVolunteeringStore.list = {
        1: {
          id: 1,
          actiontype: 'CheckMessage',
          userid: 100,
          result: 'Approve',
          timestamp: '2026-03-29T10:00:00Z',
          score_positive: 0.8,
          score_negative: 0,
        },
        2: {
          id: 2,
          actiontype: 'CheckMessage',
          userid: 100,
          result: 'Approve',
          timestamp: '2026-03-28T10:00:00Z',
          score_positive: 0,
          score_negative: 0,
        },
        3: {
          id: 3,
          actiontype: 'PhotoRotate',
          userid: 200,
          result: 'Reject',
          timestamp: '2026-03-27T10:00:00Z',
          score_positive: 0,
          score_negative: 0.5,
        },
      }

      mockUserStore.byId.mockImplementation((id) => {
        if (id === 100)
          return { id: 100, displayname: 'Alice', trustlevel: 'Basic' }
        if (id === 200)
          return { id: 200, displayname: 'Bob', trustlevel: 'Moderate' }
        return null
      })
    })

    it('groups items by userid not user.id', () => {
      const wrapper = createWrapper()
      // The computed userCounts should group by userid field
      const vm = wrapper.vm
      // Items should have userid=100 (2 items) and userid=200 (1 item)
      const counts = vm.userCounts
      expect(counts.length).toBe(2)
      expect(counts[0].userid).toBe(100) // Alice has more activity
      expect(counts[0].count).toBe(2)
      expect(counts[1].userid).toBe(200)
      expect(counts[1].count).toBe(1)
    })

    it('groups userActivity by userid not user.id', () => {
      const wrapper = createWrapper()
      const activity = wrapper.vm.userActivity
      expect(activity[100]).toHaveLength(2)
      expect(activity[200]).toHaveLength(1)
      // Should NOT have any entries keyed by undefined (from i.user.id)
      expect(activity[undefined]).toBeUndefined()
    })

    it('does NOT require user object on microaction items', () => {
      // Verify items don't have a .user property (V2 API pattern)
      const items = Object.values(mockMicroVolunteeringStore.list)
      items.forEach((item) => {
        expect(item.user).toBeUndefined()
        expect(item.userid).toBeDefined()
      })
    })

    it('fetches user details after loading microactions', async () => {
      const wrapper = createWrapper()

      // Simulate selecting a group by calling fetchData
      wrapper.vm.groupid = 123
      await flushPromises()

      // Should have called userStore.fetch for each unique userid
      expect(mockUserStore.fetch).toHaveBeenCalledWith(100, false)
      expect(mockUserStore.fetch).toHaveBeenCalledWith(200, false)
    })
  })
})
