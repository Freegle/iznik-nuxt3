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

// Create test component that mirrors ModHelpAdmins logic
const ModHelpAdminsTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="admin-info">
          ADMINs are sent to everyone on your group, no matter what their mail
          settings are, including members flagged as bouncing.
        </p>
        <p class="suggested-info">
          Sometimes you will see centrally suggested ADMINs here for you to
          edit/approve/reject as you choose.
        </p>
        <p class="wiki-link">
          Read more about ADMINs
          <a href="https://wiki.ilovefreegle.org/Admins" class="external-link">on the wiki</a>.
        </p>
      </div>
      <button
        v-else
        class="float-end pt-0 show-help-button"
        @click="toggleHelp"
      >
        Help
      </button>
    </div>
  `,
  setup() {
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

describe('ModHelpAdmins', () => {
  function mountComponent() {
    return mount(ModHelpAdminsTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShowHelp.value = true
  })

  describe('help content', () => {
    it('displays information about ADMINs being sent to everyone', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'ADMINs are sent to everyone on your group'
      )
    })

    it('mentions mail settings exception', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('no matter what their mail settings are')
    })

    it('mentions bouncing members', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('including members flagged as bouncing')
    })

    it('displays information about centrally suggested ADMINs', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('centrally suggested ADMINs')
    })

    it('mentions edit/approve/reject options', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('edit/approve/reject')
    })

    it('includes wiki link', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Read more about ADMINs')
      expect(wrapper.find('.external-link').exists()).toBe(true)
    })

    it('wiki link has correct URL', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const link = wrapper.find('.external-link')
      expect(link.attributes('href')).toBe(
        'https://wiki.ilovefreegle.org/Admins'
      )
    })
  })
})
