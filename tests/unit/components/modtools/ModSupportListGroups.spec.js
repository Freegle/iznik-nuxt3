import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModSupportListGroups from '~/modtools/components/ModSupportListGroups.vue'

// Mock modgroup store
const mockModGroupStore = {
  allGroups: {},
  listMT: vi.fn().mockResolvedValue({}),
}

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

// Mock dayjs
vi.mock('dayjs', () => ({
  default: (date) => ({
    format: () => (date ? `formatted:${date}` : '-'),
  }),
}))

describe('ModSupportListGroups', () => {
  const createGroup = (overrides = {}) => ({
    id: 1,
    nameshort: 'TestGroup',
    namedisplay: 'Test Group Display',
    lastautoapprove: '2024-01-15T10:00:00Z',
    recentautoapprovespercent: 25,
    recentautoapproves: 10,
    activeownercount: 2,
    activemodcount: 5,
    lastmoderated: '2024-01-20T10:00:00Z',
    publish: 1,
    onhere: 1,
    ontn: 0,
    onlovejunk: 1,
    region: 'Scotland',
    lat: 55.9533,
    lng: -3.1883,
    founded: '2010-01-01',
    affiliationconfirmed: '2024-01-01T00:00:00Z',
    backupownersactive: 1,
    backupmodsactive: 2,
    mentored: false,
    ...overrides,
  })

  function mountComponent() {
    return mount(ModSupportListGroups, {
      global: {
        stubs: {
          // The HotTable and HotColumn are already mocked via vitest.config.mts aliases
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockModGroupStore.allGroups = {}
    mockModGroupStore.listMT = vi.fn().mockResolvedValue({})

    // Mock import.meta.client
    vi.stubGlobal('import', { meta: { client: true } })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('shows loading message when busy', async () => {
      const wrapper = mountComponent()
      wrapper.vm.busy = true
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Loading communities...')
    })

    it('hides loading message when not busy', () => {
      const wrapper = mountComponent()
      wrapper.vm.busy = false
      expect(wrapper.text()).not.toContain('Loading communities...')
    })

    it('shows info text when groups are loaded', async () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = { 1: createGroup() }
      wrapper.vm.fetched = true
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain(
        'Here you can see info about all Freegle groups'
      )
    })

    it('mentions caretaker groups in description', async () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = { 1: createGroup() }
      wrapper.vm.fetched = true
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('caretaker groups')
    })
  })

  describe('groups computed', () => {
    it('returns empty array when no groups', () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = {}
      expect(wrapper.vm.groups).toEqual([])
    })

    it('returns array of groups from store', () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = {
        1: createGroup({ id: 1, nameshort: 'GroupA' }),
        2: createGroup({ id: 2, nameshort: 'GroupB' }),
      }
      expect(wrapper.vm.groups.length).toBe(2)
    })

    it('sorts groups by nameshort alphabetically (case insensitive)', () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = {
        1: createGroup({ id: 1, nameshort: 'Zebra' }),
        2: createGroup({ id: 2, nameshort: 'alpha' }),
        3: createGroup({ id: 3, nameshort: 'Beta' }),
      }

      const sortedGroups = wrapper.vm.groups
      expect(sortedGroups[0].nameshort).toBe('alpha')
      expect(sortedGroups[1].nameshort).toBe('Beta')
      expect(sortedGroups[2].nameshort).toBe('Zebra')
    })
  })

  describe('fetchCommunities', () => {
    it('calls modGroupStore.listMT with correct params', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.fetchCommunities()

      expect(mockModGroupStore.listMT).toHaveBeenCalledWith({
        grouptype: 'Freegle',
        support: true,
      })
    })

    it('sets busy to true while fetching', async () => {
      const wrapper = mountComponent()

      let resolvePromise
      mockModGroupStore.listMT = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve
        })
      })

      const fetchPromise = wrapper.vm.fetchCommunities()
      expect(wrapper.vm.busy).toBe(true)

      resolvePromise({})
      await fetchPromise

      expect(wrapper.vm.busy).toBe(false)
    })

    it('sets fetched to true after fetching', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.fetched).toBe(false)

      await wrapper.vm.fetchCommunities()

      expect(wrapper.vm.fetched).toBe(true)
    })

    it('does not refetch if already fetched', async () => {
      const wrapper = mountComponent()
      wrapper.vm.fetched = true

      await wrapper.vm.fetchCommunities()

      expect(mockModGroupStore.listMT).not.toHaveBeenCalled()
    })

    it('calls callback when provided', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()

      await wrapper.vm.fetchCommunities(callback)

      expect(callback).toHaveBeenCalled()
    })

    it('calls callback even when already fetched', async () => {
      const wrapper = mountComponent()
      wrapper.vm.fetched = true
      const callback = vi.fn()

      await wrapper.vm.fetchCommunities(callback)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('renderer functions', () => {
    describe('idRenderer', () => {
      it('sets lightblue background for mentored groups', () => {
        const wrapper = mountComponent()
        mockModGroupStore.allGroups = {
          0: createGroup({ id: 1, mentored: true }),
        }

        const td = document.createElement('td')
        wrapper.vm.idRenderer(null, td, 0, 0, null, 123)

        expect(td.style.backgroundColor).toBe('lightblue')
        expect(td.innerHTML).toBe('123')
      })

      it('does not set background for non-mentored groups', () => {
        const wrapper = mountComponent()
        mockModGroupStore.allGroups = {
          0: createGroup({ id: 1, mentored: false }),
        }

        const td = document.createElement('td')
        wrapper.vm.idRenderer(null, td, 0, 0, null, 456)

        expect(td.style.backgroundColor).toBe('')
        expect(td.innerHTML).toBe('456')
      })
    })

    describe('dateRenderer', () => {
      it('formats date value', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.dateRenderer(null, td, 0, 0, null, '2024-01-15')

        expect(td.innerHTML).toBe('formatted:2024-01-15')
        expect(td.style.textAlign).toBe('center')
      })

      it('shows dash for null value', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.dateRenderer(null, td, 0, 0, null, null)

        expect(td.innerHTML).toBe('-')
      })

      it('shows dash for empty value', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.dateRenderer(null, td, 0, 0, null, '')

        expect(td.innerHTML).toBe('-')
      })
    })

    describe('autoApprovesRenderer', () => {
      it('shows percentage with % suffix', () => {
        const wrapper = mountComponent()
        mockModGroupStore.allGroups = {
          0: createGroup({ publish: 1 }),
        }
        const td = document.createElement('td')

        wrapper.vm.autoApprovesRenderer(null, td, 0, 0, null, 45)

        expect(td.innerHTML).toBe('45%')
        expect(td.style.textAlign).toBe('center')
      })

      it('sets orange background when >= 50% and published', () => {
        const wrapper = mountComponent()
        mockModGroupStore.allGroups = {
          0: createGroup({ publish: 1 }),
        }
        const td = document.createElement('td')

        wrapper.vm.autoApprovesRenderer(null, td, 0, 0, null, 50)

        expect(td.style.backgroundColor).toBe('orange')
      })

      it('sets orange background when > 50% and published', () => {
        const wrapper = mountComponent()
        mockModGroupStore.allGroups = {
          0: createGroup({ publish: 1 }),
        }
        const td = document.createElement('td')

        wrapper.vm.autoApprovesRenderer(null, td, 0, 0, null, 75)

        expect(td.style.backgroundColor).toBe('orange')
      })

      it('does not set orange background when < 50%', () => {
        const wrapper = mountComponent()
        mockModGroupStore.allGroups = {
          0: createGroup({ publish: 1 }),
        }
        const td = document.createElement('td')

        wrapper.vm.autoApprovesRenderer(null, td, 0, 0, null, 49)

        expect(td.style.backgroundColor).toBe('')
      })

      it('handles negative values', () => {
        const wrapper = mountComponent()
        mockModGroupStore.allGroups = {
          0: createGroup({ publish: 0 }),
        }
        const td = document.createElement('td')

        wrapper.vm.autoApprovesRenderer(null, td, 0, 0, null, -30)

        expect(td.innerHTML).toBe('30%')
      })
    })

    describe('centreRenderer', () => {
      it('centers text and displays value', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.centreRenderer(null, td, 0, 0, null, 42)

        expect(td.innerHTML).toBe('42')
        expect(td.style.textAlign).toBe('center')
      })
    })

    describe('latlngRenderer', () => {
      it('rounds to 2 decimal places', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.latlngRenderer(null, td, 0, 0, null, 55.95333333)

        expect(td.innerHTML).toBe('55.95')
        expect(td.style.textAlign).toBe('center')
      })

      it('handles negative values', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.latlngRenderer(null, td, 0, 0, null, -3.18833333)

        expect(td.innerHTML).toBe('-3.19')
      })
    })

    describe('boolRenderer', () => {
      it('shows Y for value 1', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.boolRenderer(null, td, 0, 0, null, 1)

        expect(td.innerHTML).toBe('Y')
        expect(td.style.textAlign).toBe('center')
      })

      it('shows N for value 0', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.boolRenderer(null, td, 0, 0, null, 0)

        expect(td.innerHTML).toBe('N')
      })

      it('shows N for null value', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.boolRenderer(null, td, 0, 0, null, null)

        expect(td.innerHTML).toBe('N')
      })
    })

    describe('caretakerRenderer', () => {
      it('shows Y for truthy value', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.caretakerRenderer(null, td, 0, 0, null, true)

        expect(td.innerHTML).toBe('Y')
        expect(td.style.textAlign).toBe('center')
      })

      it('shows N for falsy value', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.caretakerRenderer(null, td, 0, 0, null, false)

        expect(td.innerHTML).toBe('N')
      })

      it('shows N for null', () => {
        const wrapper = mountComponent()
        const td = document.createElement('td')

        wrapper.vm.caretakerRenderer(null, td, 0, 0, null, null)

        expect(td.innerHTML).toBe('N')
      })
    })
  })

  describe('cells function', () => {
    it('returns editor false to disable editing', () => {
      const wrapper = mountComponent()
      const result = wrapper.vm.cells()
      expect(result).toEqual({ editor: false })
    })
  })

  describe('expose', () => {
    it('exposes fetchCommunities method', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.fetchCommunities).toBe('function')
    })
  })

  describe('height calculation', () => {
    it('starts with default height of 600', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.height).toBe(600)
    })
  })

  describe('HotTable columns', () => {
    it('renders expected columns', async () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = { 1: createGroup() }
      wrapper.vm.fetched = true
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()

      const columns = wrapper.findAll('.hot-column')
      const titles = columns.map((c) => c.attributes('data-title'))

      expect(titles).toContain('ID')
      expect(titles).toContain('Short Name')
      expect(titles).toContain('Display Name')
      expect(titles).toContain('Last Auto-Approve')
      expect(titles).toContain('Auto-Approve %')
      expect(titles).toContain('Auto-Approves')
      expect(titles).toContain('Active-owner')
      expect(titles).toContain('Active Mods')
      expect(titles).toContain('Last Moderated')
      expect(titles).toContain('Publish?')
      expect(titles).toContain('FD?')
      expect(titles).toContain('TN?')
      expect(titles).toContain('LJ?')
      expect(titles).toContain('Region')
      expect(titles).toContain('Lat')
      expect(titles).toContain('Lng')
      expect(titles).toContain('Founded')
      expect(titles).toContain('Affiliation Confirmed')
      expect(titles).toContain('Backup Owners Active')
      expect(titles).toContain('Backup Mods Active')
      expect(titles).toContain('Caretaker?')
    })
  })

  describe('edge cases', () => {
    it('handles groups with missing properties', () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = {
        1: {
          id: 1,
          nameshort: 'PartialGroup',
          // Missing most properties
        },
      }

      expect(wrapper.vm.groups.length).toBe(1)
      expect(wrapper.vm.groups[0].nameshort).toBe('PartialGroup')
    })

    it('handles empty allGroups object', () => {
      const wrapper = mountComponent()
      mockModGroupStore.allGroups = {}
      expect(wrapper.vm.groups).toEqual([])
    })
  })
})
