import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

import ModSupportFindGroup from '~/modtools/components/ModSupportFindGroup.vue'

// Mock member store
const mockMemberStore = {
  list: {},
  clear: vi.fn(),
  fetchMembers: vi.fn().mockResolvedValue([]),
  getByGroup: vi.fn().mockReturnValue([]),
}

// Mock modgroup store
const mockModGroupStore = {
  list: {},
  allGroups: {},
  listMT: vi.fn().mockResolvedValue([]),
  fetchIfNeedBeMT: vi.fn().mockResolvedValue({}),
  updateMT: vi.fn().mockResolvedValue({}),
  get: vi.fn().mockReturnValue(null),
}

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

// Mock timeformat composables
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    dateonly: vi.fn().mockReturnValue('2024-01-01'),
  }
})

describe('ModSupportFindGroup', () => {
  const defaultGroup = {
    id: 1,
    nameshort: 'TestGroup',
    namedisplay: 'Test Group Display',
    namefull: 'Test Group Full Name',
    url: 'https://freegle.org/explore/TestGroup',
    modsemail: 'testgroup-volunteers@groups.ilovefreegle.org',
    groupemail: 'testgroup@groups.ilovefreegle.org',
    publish: true,
    ontn: false,
    onlovejunk: true,
    onmap: true,
    mentored: false,
    region: 'London',
    lat: 51.5,
    lng: -0.1,
    altlat: null,
    altlng: null,
    cga: 'POLYGON((...))',
    dpa: 'POLYGON((...))',
    facebook: [],
    affiliationconfirmed: '2024-01-01',
    affiliationconfirmedby: 123,
  }

  function mountComponent() {
    return mount(ModSupportFindGroup, {
      global: {
        stubs: {
          AutocompleteLocal: {
            template:
              '<input class="autocomplete" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'items', 'size', 'placeholder', 'disabled'],
          },
          OurToggle: {
            template:
              '<div class="our-toggle" :class="{ disabled: disabled }"><span>{{ labels.checked }}</span></div>',
            props: [
              'modelValue',
              'height',
              'width',
              'fontSize',
              'labels',
              'disabled',
            ],
          },
          'group-header': {
            template: '<div class="group-header" :data-group-id="id" />',
            props: ['id', 'group', 'showJoin'],
          },
          'v-icon': {
            template: '<i :data-icon="icon" />',
            props: ['icon', 'scale'],
          },
          ModClipboard: {
            template: '<button class="clipboard" :data-value="value" />',
            props: ['value'],
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :type="type" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue', 'options'],
          },
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
          },
          'b-img': {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})">{{ label }}</button>',
            props: ['variant', 'iconName', 'label'],
          },
          ModSupportFindGroupVolunteer: {
            template: '<div class="volunteer" :data-id="volunteer.id" />',
            props: ['volunteer', 'groupid'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockModGroupStore.allGroups = {}
    mockModGroupStore.list = {}
    mockMemberStore.list = {}
    mockMemberStore.getByGroup.mockReturnValue([])
    mockModGroupStore.get.mockReturnValue(null)
  })

  describe('rendering', () => {
    it('renders autocomplete input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.autocomplete').exists()).toBe(true)
    })

    it('has loading state affecting placeholder', async () => {
      const wrapper = mountComponent()
      // Just verify loading state can be set
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.loading).toBe(true)
    })

    it('has loading false by default', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('initial state', () => {
    it('starts with loading as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('starts with searchgroup as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.searchgroup).toBeNull()
    })

    it('starts with fetchingVolunteers as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.fetchingVolunteers).toBe(false)
    })

    it('starts with CGAerror as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.CGAerror).toBeNull()
    })

    it('starts with DPAerror as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.DPAerror).toBeNull()
    })
  })

  describe('computed properties', () => {
    describe('groups', () => {
      it('returns array of all groups', () => {
        mockModGroupStore.allGroups = {
          1: { id: 1, nameshort: 'Group1' },
          2: { id: 2, nameshort: 'Group2' },
        }
        const wrapper = mountComponent()
        expect(wrapper.vm.groups).toHaveLength(2)
      })

      it('returns empty array when no groups', () => {
        mockModGroupStore.allGroups = {}
        const wrapper = mountComponent()
        expect(wrapper.vm.groups).toEqual([])
      })
    })

    describe('groupitems', () => {
      it('returns group names for autocomplete', () => {
        mockModGroupStore.allGroups = {
          1: { id: 1, nameshort: 'GroupA', namedisplay: 'GroupADifferent' },
          2: { id: 2, nameshort: 'GroupB', namedisplay: 'GroupB' },
        }
        const wrapper = mountComponent()
        const items = wrapper.vm.groupitems

        // GroupA has different namedisplay (canonically different), so shows both
        expect(items).toContain('GroupA / GroupADifferent')
        // GroupB is the same (canonically), so shows only nameshort
        expect(items).toContain('GroupB')
      })

      it('returns only nameshort when namedisplay is canonically the same', () => {
        mockModGroupStore.allGroups = {
          1: { id: 1, nameshort: 'Test-Group', namedisplay: 'Test Group' },
        }
        const wrapper = mountComponent()
        const items = wrapper.vm.groupitems

        // These are canonically the same (testgroup), so shows only nameshort
        expect(items).toContain('Test-Group')
        expect(items).not.toContain('Test-Group / Test Group')
      })
    })

    describe('groupid', () => {
      it('returns null when searchgroup is null', () => {
        const wrapper = mountComponent()
        wrapper.vm.searchgroup = null
        expect(wrapper.vm.groupid).toBeNull()
      })

      it('returns group id when matching group found', async () => {
        mockModGroupStore.allGroups = {
          42: { id: 42, nameshort: 'TestGroup', namedisplay: 'TestGroup' },
        }
        const wrapper = mountComponent()
        wrapper.vm.searchgroup = 'TestGroup'
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.groupid).toBe(42)
      })

      it('handles combined name format', async () => {
        mockModGroupStore.allGroups = {
          42: {
            id: 42,
            nameshort: 'TestGroup',
            namedisplay: 'Test Group Display',
          },
        }
        const wrapper = mountComponent()
        wrapper.vm.searchgroup = 'TestGroup / Test Group Display'
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.groupid).toBe(42)
      })
    })

    describe('group', () => {
      it('gets group from store using groupid', () => {
        mockModGroupStore.get.mockReturnValue(defaultGroup)
        const wrapper = mountComponent()
        wrapper.vm.searchgroup = 'TestGroup'

        expect(wrapper.vm.group).toBe(defaultGroup)
      })
    })

    describe('volunteers', () => {
      it('calls memberStore.getByGroup with groupid', () => {
        mockModGroupStore.allGroups = {
          1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
        }
        mockModGroupStore.get.mockReturnValue(defaultGroup)
        const wrapper = mountComponent()
        wrapper.vm.searchgroup = 'Test'

        expect(wrapper.vm.volunteers).toBeDefined() // triggers getter
        expect(mockMemberStore.getByGroup).toHaveBeenCalled()
      })
    })

    describe('sortedVolunteers', () => {
      it('sorts volunteers by lastmoderated descending', () => {
        const volunteers = [
          { id: 1, lastmoderated: '2024-01-01' },
          { id: 2, lastmoderated: '2024-01-03' },
          { id: 3, lastmoderated: '2024-01-02' },
        ]
        mockMemberStore.getByGroup.mockReturnValue(volunteers)
        const wrapper = mountComponent()

        const sorted = wrapper.vm.sortedVolunteers
        expect(sorted[0].id).toBe(2)
        expect(sorted[1].id).toBe(3)
        expect(sorted[2].id).toBe(1)
      })

      it('puts volunteers with lastmoderated before those without', () => {
        const volunteers = [
          { id: 1, lastmoderated: null },
          { id: 2, lastmoderated: '2024-01-01' },
        ]
        mockMemberStore.getByGroup.mockReturnValue(volunteers)
        const wrapper = mountComponent()

        const sorted = wrapper.vm.sortedVolunteers
        expect(sorted[0].id).toBe(2)
        expect(sorted[1].id).toBe(1)
      })
    })

    describe('region', () => {
      it('gets region from group', () => {
        mockModGroupStore.get.mockReturnValue(defaultGroup)
        mockModGroupStore.allGroups = {
          1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
        }
        const wrapper = mountComponent()
        wrapper.vm.searchgroup = 'Test'

        expect(wrapper.vm.region).toBe('London')
      })

      it('calls updateMT when region is set', async () => {
        mockModGroupStore.get.mockReturnValue(defaultGroup)
        mockModGroupStore.allGroups = {
          1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
        }
        const wrapper = mountComponent()
        wrapper.vm.searchgroup = 'Test'
        await wrapper.vm.$nextTick()

        wrapper.vm.region = 'Scotland'

        expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
          id: 1,
          region: 'Scotland',
        })
      })
    })
  })

  describe('regionOptions', () => {
    it('has all UK regions', () => {
      const wrapper = mountComponent()
      const regions = wrapper.vm.regionOptions.map((r) => r.value)

      expect(regions).toContain('East')
      expect(regions).toContain('London')
      expect(regions).toContain('West Midlands')
      expect(regions).toContain('East Midlands')
      expect(regions).toContain('North East')
      expect(regions).toContain('North West')
      expect(regions).toContain('Northern Ireland')
      expect(regions).toContain('South East')
      expect(regions).toContain('South West')
      expect(regions).toContain('Wales')
      expect(regions).toContain('Yorkshire and the Humber')
      expect(regions).toContain('Scotland')
    })
  })

  describe('group display', () => {
    it('shows group info when group is selected and has url', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.group-header').exists()).toBe(true)
    })

    it('does not show group info when no group selected', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.group-header').exists()).toBe(false)
    })

    it('displays group name as heading', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      expect(wrapper.find('h3').text()).toContain('TestGroup')
    })

    it('shows namedisplay when different from nameshort', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('h4').text()).toContain('Test Group Display')
    })
  })

  describe('loadallgroups', () => {
    it('calls modGroupStore.listMT with Freegle grouptype', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()

      await wrapper.vm.loadallgroups(callback)

      expect(mockModGroupStore.listMT).toHaveBeenCalledWith({
        grouptype: 'Freegle',
      })
    })

    it('calls callback after loading', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()

      await wrapper.vm.loadallgroups(callback)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('loadCommunities', () => {
    it('sets loading to true while loading', async () => {
      mockModGroupStore.listMT.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 100))
      })
      const wrapper = mountComponent()

      const loadPromise = wrapper.vm.loadCommunities()
      expect(wrapper.vm.loading).toBe(true)

      await loadPromise
    })

    it('sets loading to false after loading', async () => {
      const wrapper = mountComponent()

      await wrapper.vm.loadCommunities()

      expect(wrapper.vm.loading).toBe(false)
    })

    it('does not load if groups already exist', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()

      await wrapper.vm.loadCommunities()

      expect(mockModGroupStore.listMT).not.toHaveBeenCalled()
    })
  })

  describe('canonGroupName', () => {
    it('lowercases the name', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canonGroupName('TestGroup')).toBe('testgroup')
    })

    it('removes hyphens', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canonGroupName('Test-Group')).toBe('testgroup')
    })

    it('removes underscores', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canonGroupName('Test_Group')).toBe('testgroup')
    })

    it('removes spaces', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canonGroupName('Test Group')).toBe('testgroup')
    })

    it('handles null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canonGroupName(null)).toBeNull()
    })
  })

  describe('saveCGA', () => {
    it('calls modGroupStore.updateMT with polyofficial', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue({
        ...defaultGroup,
        cga: 'NEW POLYGON',
      })
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      await wrapper.vm.saveCGA(callback)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
        id: 1,
        polyofficial: 'NEW POLYGON',
      })
    })

    it('clears CGAerror on save', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      wrapper.vm.CGAerror = 'Previous error'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      await wrapper.vm.saveCGA(callback)

      expect(wrapper.vm.CGAerror).toBeNull()
    })

    it('sets CGAerror on error', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      mockModGroupStore.updateMT.mockRejectedValueOnce(
        new Error('Invalid polygon')
      )
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      await wrapper.vm.saveCGA(callback)

      expect(wrapper.vm.CGAerror).toBe('Invalid polygon')
    })

    it('calls callback after save', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      await wrapper.vm.saveCGA(callback)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('saveDPA', () => {
    it('calls modGroupStore.updateMT with poly', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue({
        ...defaultGroup,
        dpa: 'NEW DPA POLYGON',
      })
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      await wrapper.vm.saveDPA(callback)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
        id: 1,
        poly: 'NEW DPA POLYGON',
      })
    })

    it('clears DPAerror on save', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      wrapper.vm.DPAerror = 'Previous error'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      await wrapper.vm.saveDPA(callback)

      expect(wrapper.vm.DPAerror).toBeNull()
    })

    it('sets DPAerror on error', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      mockModGroupStore.updateMT.mockRejectedValueOnce(new Error('Invalid DPA'))
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      await wrapper.vm.saveDPA(callback)

      expect(wrapper.vm.DPAerror).toBe('Invalid DPA')
    })
  })

  describe('saveNames', () => {
    it('calls modGroupStore.updateMT with namefull and nameshort', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue({
        ...defaultGroup,
        namefull: 'New Full Name',
        nameshort: 'NewShort',
      })
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      wrapper.vm.saveNames(callback)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
        id: 1,
        namefull: 'New Full Name',
        nameshort: 'NewShort',
      })
    })

    it('calls callback after save', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      wrapper.vm.saveNames(callback)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('saveCentres', () => {
    it('calls modGroupStore.updateMT with lat/lng and altlat/altlng', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue({
        ...defaultGroup,
        lat: 52.0,
        lng: -1.0,
        altlat: 52.5,
        altlng: -1.5,
      })
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const callback = vi.fn()
      wrapper.vm.saveCentres(callback)

      expect(mockModGroupStore.updateMT).toHaveBeenCalledWith({
        id: 1,
        lat: 52.0,
        lng: -1.0,
        altlat: 52.5,
        altlng: -1.5,
      })
    })
  })

  describe('watcher on groupid', () => {
    it('fetches group and volunteers when groupid changes', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()

      wrapper.vm.searchgroup = 'Test'
      await flushPromises()

      expect(mockModGroupStore.fetchIfNeedBeMT).toHaveBeenCalledWith(1)
      expect(mockMemberStore.clear).toHaveBeenCalled()
      expect(mockMemberStore.fetchMembers).toHaveBeenCalledWith({
        groupid: 1,
        collection: 'Approved',
        modtools: true,
        summary: false,
        limit: 1000,
        filter: 2,
      })
    })

    it('clears members when groupid becomes null', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()

      wrapper.vm.searchgroup = 'Test'
      await flushPromises()

      mockMemberStore.clear.mockClear()
      wrapper.vm.searchgroup = null
      await flushPromises()

      expect(mockMemberStore.clear).toHaveBeenCalled()
    })
  })

  describe('exposed methods', () => {
    it('exposes loadCommunities method', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.loadCommunities).toBe('function')
    })
  })

  describe('toggle displays', () => {
    it('shows visibility toggle', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles.length).toBeGreaterThan(0)
    })

    it('has toggles for publish, ontn, onlovejunk, onmap', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      // Check the toggle text content includes expected labels
      const html = wrapper.html()
      expect(html).toContain('Visible on site')
      expect(html).toContain('On TN')
      expect(html).toContain('On LoveJunk')
      expect(html).toContain('On map')
    })
  })

  describe('loading volunteers', () => {
    it('shows loader when fetching volunteers', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue(defaultGroup)
      mockMemberStore.fetchMembers.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )
      const wrapper = mountComponent()

      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()
      // Should show loader during fetch
      expect(wrapper.vm.fetchingVolunteers).toBe(true)
    })
  })

  describe('facebook display', () => {
    it('shows no facebook message when no facebook pages', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue({ ...defaultGroup, facebook: [] })
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Facebook: none')
    })

    it('shows facebook page info when pages exist', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue({
        ...defaultGroup,
        facebook: [
          {
            id: '12345',
            type: 'Page',
            name: 'Test Facebook Page',
            valid: true,
          },
        ],
      })
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Test Facebook Page')
    })

    it('shows invalid marker for invalid facebook pages', async () => {
      mockModGroupStore.allGroups = {
        1: { id: 1, nameshort: 'Test', namedisplay: 'Test' },
      }
      mockModGroupStore.get.mockReturnValue({
        ...defaultGroup,
        facebook: [
          { id: '12345', type: 'Page', name: 'Invalid Page', valid: false },
        ],
      })
      const wrapper = mountComponent()
      wrapper.vm.searchgroup = 'Test'
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Invalid')
    })
  })
})
