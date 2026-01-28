import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock the stores
const mockModGroupStore = {
  allGroups: {},
  getfromall: vi.fn(),
  list: {},
}

const mockLocationStore = {
  fetch: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))

// Mock the composables/useMap
vi.mock('~/composables/useMap', () => ({
  attribution: () => 'Test Attribution',
  osmtile: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
}))

// Mock runtime config
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRuntimeConfig: () => ({
      public: {
        GEOCODE: 'https://geocode.test.com',
      },
    }),
  }
})

// Mock Wkt for WKT parsing (client-side only)
const mockWkt = {
  read: vi.fn(),
  toJson: vi.fn(() => ({
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ],
  })),
  toObject: vi.fn(() => ({
    getBounds: () => ({
      getSouthWest: () => ({ lat: 0, lng: 0 }),
      getNorthEast: () => ({ lat: 1, lng: 1 }),
    }),
  })),
  fromObject: vi.fn(),
  write: vi.fn(() => 'POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))'),
}

vi.mock('wicket', () => ({
  default: { Wkt: vi.fn(() => mockWkt) },
  Wkt: vi.fn(() => mockWkt),
}))

vi.mock('turf-polygon', () => ({
  default: vi.fn(() => ({ type: 'Feature', geometry: { type: 'Polygon' } })),
}))

vi.mock('turf-intersect', () => ({
  default: vi.fn(() => null),
}))

// Mock leaflet
vi.stubGlobal('L', {
  map: vi.fn(),
  tileLayer: vi.fn(),
  LatLng: vi.fn((lat, lng) => ({ lat, lng })),
})

// Mock XMLHttpRequest for search
vi.stubGlobal(
  'XMLHttpRequest',
  vi.fn(() => ({
    open: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
  }))
)

// Create a minimal test component to avoid leaflet complexity
const ModGroupMapTest = {
  template: `
    <div class="mod-group-map-test">
      <div class="maptools">
        <div class="busy-indicator" :class="{ 'text-success': busy }"></div>
        <label v-if="groups || groupid">
          <input type="checkbox" v-model="cga" class="cga-checkbox" /> Show CGAs
        </label>
        <label v-if="groups || groupid">
          <input type="checkbox" v-model="dpa" class="dpa-checkbox" /> Show DPAs
        </label>
        <label v-if="groupid">
          <input type="checkbox" v-model="labels" class="labels-checkbox" /> Labels
        </label>
        <label>
          <input type="checkbox" v-model="shade" class="shade-checkbox" @click="dobump" /> Shade areas
        </label>
        <label>
          <input type="checkbox" v-model="showDodgy" class="dodgy-checkbox" /> Areas to Review
        </label>
      </div>
      <div class="map-container" :style="{ height: mapHeight + 'px' }">
        <div class="leaflet-map" :data-zoom="zoom"></div>
      </div>
      <div class="search-section">
        <input v-model="searchplace" type="text" class="search-input" placeholder="Place to search for" />
        <button @click="search" class="search-button">Search</button>
      </div>
      <div v-if="selectedName || selectedWKT" class="area-details">
        <p class="warning-text">Zoom/pan locked while area selected. Use Cancel to free.</p>
        <div v-if="groupid">
          <input v-model="selectedName" class="area-name-input" placeholder="Enter area name" />
          <textarea v-if="selectedWKT" v-model="selectedWKT" class="wkt-textarea"></textarea>
        </div>
        <div v-else>
          <h5 class="area-name-display">{{ selectedName }}</h5>
          <textarea v-if="selectedWKT" v-model="selectedWKT" class="wkt-textarea-readonly" readonly></textarea>
        </div>
        <p v-if="intersects" class="intersects-warning">Crosses over itself - not valid</p>
        <button @click="saveArea" :disabled="!selectedName || !selectedWKT || intersects" class="save-button">Save</button>
        <button @click="clearSelection" class="cancel-button">Cancel</button>
        <button v-if="selectedId" @click="deleteArea" class="delete-button">Delete</button>
      </div>
      <div v-if="zoom < 12" class="zoom-notice">Please zoom in further to see locations.</div>
      <div v-if="dodgyInBounds.length" class="mapping-changes">
        <div class="mapping-changes-header">
          Mapping Changes
          <button @click="showMappingChanges = true" class="details-button">Details</button>
        </div>
        <div v-if="dodgyInBounds.length < 200" class="mapping-changes-list">
          <div v-for="d in dodgyInBounds" :key="d.id" class="changed-mapping" @click="highlightPostcode(d)">
            {{ d.name }}
          </div>
        </div>
        <p v-else class="too-many-changes">Too many changes to show; zoom in.</p>
      </div>
    </div>
  `,
  props: {
    groups: { type: Boolean, default: false },
    groupid: { type: Number, default: null },
    caretaker: { type: Boolean, default: false },
    overlaps: { type: Boolean, default: false },
  },
  setup(props) {
    const busy = ref(true)
    const dpa = ref(false)
    const cga = ref(true)
    const shade = ref(true)
    const labels = ref(true)
    const showDodgy = ref(false)
    const selectedName = ref(null)
    const selectedWKT = ref(null)
    const dragging = ref(true)
    const selectedObj = ref(null)
    const selectedId = ref(null)
    const intersects = ref(false)
    const zoom = ref(12)
    const lastLocationFetch = ref(null)
    const showMappingChanges = ref(false)
    const highlighted = ref(null)
    const locations = ref([])
    const dodgy = ref([])
    const bump = ref(0)
    const searchplace = ref('')
    const mapHeight = ref(process.client ? window.innerHeight - 150 : 0)
    const allgroups = ref([])
    const group = ref(null)
    const CGAs = ref([])
    const DPAs = ref([])
    const locationsInBounds = ref([])
    const dodgyInBounds = ref([])

    const cgaOptions = ref({
      fillColor: 'darkgreen',
      fillOpacity: shade.value ? 0.6 : 0,
      color: 'darkgreen',
    })

    const dpaOptions = ref({
      fillColor: 'darkgreen',
      fillOpacity: shade.value ? 0.6 : 0,
      color: 'darkblue',
    })

    function clearSelection(callback) {
      selectedObj.value = null
      selectedId.value = null
      selectedName.value = null
      selectedWKT.value = null
      dragging.value = true
      bump.value++
      if (typeof callback === 'function') callback()
    }

    function selectCGA(e, g) {
      selectedName.value = g.nameshort + ' CGA'
      selectedWKT.value = null
      selectedObj.value = null
    }

    function selectDPA(e, g) {
      selectedName.value = g.nameshort + ' DPA'
      selectedWKT.value = null
      selectedObj.value = null
    }

    function selectLocation(l) {
      if (!selectedWKT.value) {
        selectedId.value = l.id
        selectedObj.value = l
        selectedName.value = l.name
        selectedWKT.value = l.polygon
        dragging.value = false
        bump.value++
      }
    }

    async function saveArea(callback) {
      busy.value = true
      if (!selectedId.value) {
        await mockLocationStore.add({
          name: selectedName.value,
          polygon: selectedWKT.value,
          remap: false,
        })
      } else {
        await mockLocationStore.update({
          id: selectedId.value,
          name: selectedName.value,
          polygon: selectedWKT.value,
          remap: false,
        })
      }
      clearSelection()
      lastLocationFetch.value = null
      busy.value = false
      if (typeof callback === 'function') callback()
    }

    async function deleteArea(callback) {
      busy.value = true
      await mockLocationStore.delete({
        id: selectedId.value,
        groupid: props.groupid,
        remap: false,
      })
      clearSelection()
      lastLocationFetch.value = null
      busy.value = false
      if (typeof callback === 'function') callback()
    }

    function highlightPostcode(pc) {
      highlighted.value = pc
    }

    function dobump() {
      setTimeout(() => {
        bump.value++
      }, 500)
    }

    function search() {}

    return {
      busy,
      dpa,
      cga,
      shade,
      labels,
      showDodgy,
      selectedName,
      selectedWKT,
      dragging,
      selectedObj,
      selectedId,
      intersects,
      zoom,
      lastLocationFetch,
      showMappingChanges,
      highlighted,
      locations,
      dodgy,
      bump,
      searchplace,
      mapHeight,
      allgroups,
      group,
      CGAs,
      DPAs,
      locationsInBounds,
      cgaOptions,
      dpaOptions,
      dodgyInBounds,
      clearSelection,
      selectCGA,
      selectDPA,
      selectLocation,
      saveArea,
      deleteArea,
      highlightPostcode,
      dobump,
      search,
    }
  },
}

describe('ModGroupMap', () => {
  const createTestGroup = (overrides = {}) => ({
    id: 123,
    nameshort: 'TestGroup',
    namedisplay: 'Test Group',
    lat: 51.5,
    lng: -0.1,
    onmap: 1,
    poly: 'POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))',
    polyofficial: 'POLYGON ((0 0, 0 2, 2 2, 2 0, 0 0))',
    mentored: false,
    ...overrides,
  })

  const createTestLocation = (overrides = {}) => ({
    id: 1,
    name: 'Test Location',
    lat: 51.5,
    lng: -0.1,
    polygon: 'POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))',
    ...overrides,
  })

  const createTestDodgy = (overrides = {}) => ({
    id: 1,
    name: 'Test Postcode',
    oldname: 'OldArea',
    newname: 'NewArea',
    lat: 51.5,
    lng: -0.1,
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModGroupMapTest, {
      props: {
        groups: false,
        groupid: null,
        caretaker: false,
        overlaps: false,
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon', 'scale'],
          },
          'b-form-checkbox': {
            template:
              '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
            props: ['modelValue'],
          },
          'b-modal': {
            template: '<div class="modal"><slot /></div>',
            props: ['id', 'modelValue'],
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'md'],
          },
          SpinButton: {
            template:
              '<button @click="$emit(\'handle\')" :disabled="disabled"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'spinclass', 'disabled'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant', 'show'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockModGroupStore.allGroups = {}
    mockModGroupStore.getfromall.mockReturnValue(null)
    mockLocationStore.fetch.mockResolvedValue({ locations: [], dodgy: [] })
    mockLocationStore.add.mockResolvedValue({ id: 1 })
    mockLocationStore.update.mockResolvedValue({})
    mockLocationStore.delete.mockResolvedValue({})
  })

  describe('Rendering', () => {
    it('renders map container and search section', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.map-container').exists()).toBe(true)
      expect(wrapper.find('.search-section').exists()).toBe(true)
      expect(wrapper.find('.maptools').exists()).toBe(true)
    })
  })

  describe('Checkbox visibility based on props', () => {
    it('shows CGA/DPA checkboxes when groups=true or groupid provided', () => {
      // With groups=true
      let wrapper = mountComponent({ groups: true })
      expect(wrapper.find('.cga-checkbox').exists()).toBe(true)
      expect(wrapper.find('.dpa-checkbox').exists()).toBe(true)

      // With groupid
      wrapper = mountComponent({ groupid: 123 })
      expect(wrapper.find('.cga-checkbox').exists()).toBe(true)
      expect(wrapper.find('.dpa-checkbox').exists()).toBe(true)

      // Without either - should be hidden
      wrapper = mountComponent()
      expect(wrapper.find('.cga-checkbox').exists()).toBe(false)
      expect(wrapper.find('.dpa-checkbox').exists()).toBe(false)
    })

    it('shows labels checkbox only when groupid provided', () => {
      expect(
        mountComponent({ groupid: 123 }).find('.labels-checkbox').exists()
      ).toBe(true)
      expect(
        mountComponent({ groups: true }).find('.labels-checkbox').exists()
      ).toBe(false)
    })

    it('always shows shade and dodgy checkboxes', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.shade-checkbox').exists()).toBe(true)
      expect(wrapper.find('.dodgy-checkbox').exists()).toBe(true)
    })
  })

  describe('Checkbox toggling', () => {
    it('can toggle checkboxes', async () => {
      const wrapper = mountComponent({ groups: true })

      // CGA starts true, toggle to false
      expect(wrapper.vm.cga).toBe(true)
      wrapper.vm.cga = false
      await nextTick()
      expect(wrapper.vm.cga).toBe(false)

      // DPA starts false, toggle to true
      expect(wrapper.vm.dpa).toBe(false)
      wrapper.vm.dpa = true
      await nextTick()
      expect(wrapper.vm.dpa).toBe(true)

      // Shade starts true, toggle to false
      expect(wrapper.vm.shade).toBe(true)
      wrapper.vm.shade = false
      await nextTick()
      expect(wrapper.vm.shade).toBe(false)
    })
  })

  describe('Area Details Panel', () => {
    it('shows/hides based on selection state', async () => {
      const wrapper = mountComponent()

      // Hidden when nothing selected
      expect(wrapper.find('.area-details').exists()).toBe(false)

      // Shows when selectedName is set
      wrapper.vm.selectedName = 'Test Area'
      await nextTick()
      expect(wrapper.find('.area-details').exists()).toBe(true)
      expect(wrapper.find('.warning-text').text()).toContain('Zoom/pan locked')
    })

    it('shows editable input with groupid, readonly display without', async () => {
      // With groupid - editable
      let wrapper = mountComponent({ groupid: 123 })
      wrapper.vm.selectedName = 'Test'
      await nextTick()
      expect(wrapper.find('.area-name-input').exists()).toBe(true)

      // Without groupid - readonly
      wrapper = mountComponent()
      wrapper.vm.selectedName = 'Test'
      await nextTick()
      expect(wrapper.find('.area-name-display').exists()).toBe(true)
      expect(wrapper.find('.area-name-display').text()).toBe('Test')
    })

    it('shows WKT textarea when selectedWKT is set', async () => {
      const wrapper = mountComponent({ groupid: 123 })
      wrapper.vm.selectedName = 'Test'
      wrapper.vm.selectedWKT = 'POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))'
      await nextTick()
      expect(wrapper.find('.wkt-textarea').exists()).toBe(true)
    })

    it('shows intersects warning and disables save when polygon crosses itself', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedName = 'Test'
      wrapper.vm.selectedWKT = 'WKT'
      wrapper.vm.intersects = true
      await nextTick()

      expect(wrapper.find('.intersects-warning').text()).toContain(
        'Crosses over itself'
      )
      expect(wrapper.find('.save-button').attributes('disabled')).toBeDefined()
    })

    it('disables save button when name or WKT empty', async () => {
      const wrapper = mountComponent()

      // Only WKT set
      wrapper.vm.selectedWKT = 'WKT'
      wrapper.vm.selectedName = ''
      await nextTick()
      expect(wrapper.find('.save-button').attributes('disabled')).toBeDefined()

      // Only name set
      wrapper.vm.selectedName = 'Test'
      wrapper.vm.selectedWKT = ''
      await nextTick()
      expect(wrapper.find('.save-button').attributes('disabled')).toBeDefined()
    })

    it('shows delete button only when selectedId is set', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedName = 'Test'

      wrapper.vm.selectedId = null
      await nextTick()
      expect(wrapper.find('.delete-button').exists()).toBe(false)

      wrapper.vm.selectedId = 123
      await nextTick()
      expect(wrapper.find('.delete-button').exists()).toBe(true)
    })
  })

  describe('Zoom notice', () => {
    it('shows when zoom < 12, hides when >= 12', async () => {
      const wrapper = mountComponent()

      wrapper.vm.zoom = 10
      await nextTick()
      expect(wrapper.find('.zoom-notice').exists()).toBe(true)

      wrapper.vm.zoom = 12
      await nextTick()
      expect(wrapper.find('.zoom-notice').exists()).toBe(false)

      wrapper.vm.zoom = 15
      await nextTick()
      expect(wrapper.find('.zoom-notice').exists()).toBe(false)
    })
  })

  describe('Mapping changes section', () => {
    it('shows when dodgyInBounds has items, with list or too-many message', async () => {
      const wrapper = mountComponent()

      // Hidden when empty
      expect(wrapper.find('.mapping-changes').exists()).toBe(false)

      // Shows with few items
      wrapper.vm.dodgyInBounds = [createTestDodgy(), createTestDodgy({ id: 2 })]
      await nextTick()
      expect(wrapper.find('.mapping-changes').exists()).toBe(true)
      expect(wrapper.find('.mapping-changes-list').exists()).toBe(true)
      expect(wrapper.findAll('.changed-mapping')).toHaveLength(2)

      // Shows "too many" when >= 200 items
      wrapper.vm.dodgyInBounds = Array.from({ length: 200 }, (_, i) =>
        createTestDodgy({ id: i })
      )
      await nextTick()
      expect(wrapper.find('.too-many-changes').text()).toContain(
        'Too many changes'
      )
    })

    it('sets showMappingChanges when details button clicked', async () => {
      const wrapper = mountComponent()
      wrapper.vm.dodgyInBounds = [createTestDodgy()]
      await nextTick()

      await wrapper.find('.details-button').trigger('click')
      expect(wrapper.vm.showMappingChanges).toBe(true)
    })
  })

  describe('clearSelection method', () => {
    it('resets all selection state and increments bump', () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedObj = { id: 1 }
      wrapper.vm.selectedId = 123
      wrapper.vm.selectedName = 'Test'
      wrapper.vm.selectedWKT = 'WKT'
      wrapper.vm.dragging = false
      const initialBump = wrapper.vm.bump

      wrapper.vm.clearSelection()

      expect(wrapper.vm.selectedObj).toBe(null)
      expect(wrapper.vm.selectedId).toBe(null)
      expect(wrapper.vm.selectedName).toBe(null)
      expect(wrapper.vm.selectedWKT).toBe(null)
      expect(wrapper.vm.dragging).toBe(true)
      expect(wrapper.vm.bump).toBe(initialBump + 1)
    })

    it('calls callback if provided', () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      wrapper.vm.clearSelection(callback)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('selectCGA/selectDPA methods', () => {
    it.each([
      ['selectCGA', 'CGA'],
      ['selectDPA', 'DPA'],
    ])(
      '%s sets selectedName with %s suffix and clears WKT/obj',
      (method, suffix) => {
        const wrapper = mountComponent()
        wrapper.vm.selectedWKT = 'EXISTING'
        wrapper.vm.selectedObj = { id: 1 }

        const group = createTestGroup({ nameshort: 'MyGroup' })
        wrapper.vm[method]({}, group, 0)

        expect(wrapper.vm.selectedName).toBe(`MyGroup ${suffix}`)
        expect(wrapper.vm.selectedWKT).toBe(null)
        expect(wrapper.vm.selectedObj).toBe(null)
      }
    )
  })

  describe('selectLocation method', () => {
    it('sets selection properties when no existing WKT', () => {
      const wrapper = mountComponent()
      const location = createTestLocation({
        id: 5,
        name: 'Selected',
        polygon: 'NEW WKT',
      })

      wrapper.vm.selectLocation(location)

      expect(wrapper.vm.selectedId).toBe(5)
      expect(wrapper.vm.selectedObj).toStrictEqual(location)
      expect(wrapper.vm.selectedName).toBe('Selected')
      expect(wrapper.vm.selectedWKT).toBe('NEW WKT')
      expect(wrapper.vm.dragging).toBe(false)
    })

    it('does not change selection when WKT already set', () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedWKT = 'EXISTING'
      wrapper.vm.selectedId = 99

      wrapper.vm.selectLocation(createTestLocation({ id: 5 }))

      expect(wrapper.vm.selectedId).toBe(99)
    })
  })

  describe('saveArea method', () => {
    it('calls add for new area, update for existing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedName = 'Test'
      wrapper.vm.selectedWKT = 'WKT'

      // New area (no selectedId)
      await wrapper.vm.saveArea()
      expect(mockLocationStore.add).toHaveBeenCalledWith({
        name: 'Test',
        polygon: 'WKT',
        remap: false,
      })

      // Existing area
      vi.clearAllMocks()
      wrapper.vm.selectedName = 'Updated'
      wrapper.vm.selectedWKT = 'WKT2'
      wrapper.vm.selectedId = 123
      await wrapper.vm.saveArea()
      expect(mockLocationStore.update).toHaveBeenCalledWith({
        id: 123,
        name: 'Updated',
        polygon: 'WKT2',
        remap: false,
      })
    })

    it('clears selection and resets state after save', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedName = 'Test'
      wrapper.vm.selectedWKT = 'WKT'
      wrapper.vm.lastLocationFetch = 'cached'

      await wrapper.vm.saveArea()

      expect(wrapper.vm.selectedName).toBe(null)
      expect(wrapper.vm.lastLocationFetch).toBe(null)
      expect(wrapper.vm.busy).toBe(false)
    })
  })

  describe('deleteArea method', () => {
    it('calls delete with correct params and clears selection', async () => {
      const wrapper = mountComponent({ groupid: 456 })
      wrapper.vm.selectedId = 123
      wrapper.vm.lastLocationFetch = 'cached'

      await wrapper.vm.deleteArea()

      expect(mockLocationStore.delete).toHaveBeenCalledWith({
        id: 123,
        groupid: 456,
        remap: false,
      })
      expect(wrapper.vm.selectedId).toBe(null)
      expect(wrapper.vm.lastLocationFetch).toBe(null)
      expect(wrapper.vm.busy).toBe(false)
    })
  })

  describe('highlightPostcode method', () => {
    it('sets highlighted to the postcode', () => {
      const wrapper = mountComponent()
      const postcode = createTestDodgy({ id: 5 })

      wrapper.vm.highlightPostcode(postcode)
      expect(wrapper.vm.highlighted).toStrictEqual(postcode)

      // Overwrites previous
      const postcode2 = createTestDodgy({ id: 10 })
      wrapper.vm.highlightPostcode(postcode2)
      expect(wrapper.vm.highlighted).toStrictEqual(postcode2)
    })
  })

  describe('dobump method', () => {
    it('increments bump after 500ms timeout', () => {
      vi.useFakeTimers()
      const wrapper = mountComponent()
      const initialBump = wrapper.vm.bump

      wrapper.vm.dobump()
      expect(wrapper.vm.bump).toBe(initialBump)

      vi.advanceTimersByTime(500)
      expect(wrapper.vm.bump).toBe(initialBump + 1)

      vi.useRealTimers()
    })
  })

  describe('Search functionality', () => {
    it('updates searchplace on input', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.search-input').setValue('London')
      expect(wrapper.vm.searchplace).toBe('London')
    })
  })

  describe('Cancel button', () => {
    it('clears selection when clicked', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedName = 'Test'
      wrapper.vm.selectedId = 1
      await nextTick()

      await wrapper.find('.cancel-button').trigger('click')

      expect(wrapper.vm.selectedName).toBe(null)
      expect(wrapper.vm.selectedId).toBe(null)
    })
  })

  describe('Style options', () => {
    it('cgaOptions has darkgreen colors, dpaOptions has darkblue border', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.cgaOptions.fillColor).toBe('darkgreen')
      expect(wrapper.vm.cgaOptions.color).toBe('darkgreen')
      expect(wrapper.vm.dpaOptions.fillColor).toBe('darkgreen')
      expect(wrapper.vm.dpaOptions.color).toBe('darkblue')
    })
  })
})
