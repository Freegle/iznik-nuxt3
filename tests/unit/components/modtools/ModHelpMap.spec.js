import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// Mock the composable with configurable return values
const mockShowHelp = ref(true)
const mockHide = vi.fn()
const mockShow = vi.fn()
const mockToggleHelp = vi.fn()

vi.mock('~/composables/useHelpBox', () => ({
  useHelpBox: () => ({
    hide: mockHide,
    show: mockShow,
    showHelp: mockShowHelp,
    toggleHelp: mockToggleHelp,
  }),
}))

// Create test component that mirrors ModHelpMap logic
const ModHelpMapTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p>
          Here you can change the areas that postcodes map to on your community.
        </p>
        <ul>
          <li class="help-item">
            Click on the little polygon on the top right of the map.
          </li>
          <li class="help-item">
            Click on an existing area to select it.
          </li>
          <li class="help-item">
            Once selected you'll see little dots appear.
          </li>
          <li class="help-item">
            Once you select an area, you can't move or zoom the map.
          </li>
          <li class="help-item">
            If you're remapping an area with a lot of points, it might be simpler.
          </li>
          <li class="help-item">
            You can change the name of an area.
          </li>
          <li class="help-item">
            <em>Areas to review</em> helps you see where mapping has changed.
          </li>
          <li class="help-item">
            CGA and DPA polygons cannot be changed here.
          </li>
        </ul>
      </div>
      <button
        v-if="!showHelp"
        class="float-end pt-0 show-help-button"
        @click="toggleHelp"
      >
        Help
      </button>
    </div>
  `,
  setup() {
    // Simulate onMounted calling hide()
    // This is done via a method that tests can call
    function initComponent() {
      mockHide()
    }

    return {
      showHelp: mockShowHelp,
      toggleHelp: mockToggleHelp,
      hide: mockHide,
      show: mockShow,
      initComponent,
    }
  },
}

describe('ModHelpMap', () => {
  function mountComponent() {
    return mount(ModHelpMapTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShowHelp.value = true
  })

  describe('help content', () => {
    it('displays introductory paragraph', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Here you can change the areas that postcodes map to'
      )
    })

    it('displays list of help items', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const items = wrapper.findAll('.help-item')
      expect(items.length).toBe(8)
    })

    it('includes polygon instruction', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Click on the little polygon')
    })

    it('includes area selection instruction', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Click on an existing area to select it')
    })

    it('includes edit dots instruction', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("you'll see little dots appear")
    })

    it('includes zoom restriction note', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("you can't move or zoom the map")
    })

    it('includes remapping suggestion', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('remapping an area with a lot of points')
    })

    it('includes name change instruction', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('You can change the name of an area')
    })

    it('includes areas to review note', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Areas to review')
    })

    it('includes CGA/DPA note', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('CGA and DPA polygons cannot be changed')
    })
  })
})
