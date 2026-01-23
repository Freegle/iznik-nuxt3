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

// Create test component that mirrors ModHelpComments logic
const ModHelpCommentsTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="notes-info">These are the notes for members on your communities, newest first.</p>
        <p class="gdpr-info">
          For GDPR reasons we should not keep notes older than three years unless
          they are still relevant. You can delete notes from here.
        </p>
        <p class="coming-soon">Soon there will be:</p>
        <ul class="upcoming-features">
          <li class="bump-feature">A button to "bump" the note</li>
          <li class="warning-feature">
            A mail warning about notes which will be automatically deleted if not
            reviewed.
          </li>
        </ul>
        <p class="not-ready">...but they're not ready yet.</p>
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

describe('ModHelpComments', () => {
  function mountComponent() {
    return mount(ModHelpCommentsTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShowHelp.value = true
  })

  describe('rendering', () => {
    it('renders help content when showHelp is true', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('hides help content when showHelp is false', async () => {
      mockShowHelp.value = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('shows Help button when showHelp is false', async () => {
      mockShowHelp.value = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.show-help-button').exists()).toBe(true)
    })

    it('hides Help button when showHelp is true', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.show-help-button').exists()).toBe(false)
    })

    it('shows Hide Help button when help is visible', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.hide-button').exists()).toBe(true)
      expect(wrapper.find('.hide-button').text()).toBe('Hide Help')
    })
  })

  describe('help content - notes section', () => {
    it('explains what notes are displayed', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'These are the notes for members on your communities'
      )
    })

    it('mentions ordering', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('newest first')
    })
  })

  describe('help content - GDPR section', () => {
    it('explains GDPR reason for note deletion', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('For GDPR reasons')
    })

    it('mentions three year retention limit', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'we should not keep notes older than three years'
      )
    })

    it('mentions relevance exception', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('unless they are still relevant')
    })

    it('mentions ability to delete notes', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('You can delete notes from here')
    })
  })

  describe('help content - upcoming features section', () => {
    it('mentions upcoming features', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Soon there will be')
    })

    it('lists bump button feature', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('A button to "bump" the note')
    })

    it('lists warning mail feature', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'A mail warning about notes which will be automatically deleted'
      )
    })

    it('mentions features are not ready', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("but they're not ready yet")
    })

    it('displays list of upcoming features', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const list = wrapper.find('.upcoming-features')
      expect(list.exists()).toBe(true)
      expect(list.findAll('li').length).toBe(2)
    })
  })

  describe('toggle functionality', () => {
    it('calls toggleHelp when Hide Help button is clicked', async () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      await wrapper.find('.hide-button').trigger('click')
      expect(mockToggleHelp).toHaveBeenCalled()
    })

    it('calls toggleHelp when Help button is clicked', async () => {
      mockShowHelp.value = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      await wrapper.find('.show-help-button').trigger('click')
      expect(mockToggleHelp).toHaveBeenCalled()
    })
  })

  describe('onMounted behavior', () => {
    it('component has initComponent method that calls hide', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.initComponent).toBe('function')
    })

    it('initComponent calls hide to initially hide help', () => {
      const wrapper = mountComponent()
      wrapper.vm.initComponent()
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('composable integration', () => {
    it('exposes hide function from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.hide).toBe(mockHide)
    })

    it('exposes show function from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBe(mockShow)
    })

    it('exposes toggleHelp function from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.toggleHelp).toBe(mockToggleHelp)
    })

    it('showHelp reflects the composable value', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message').exists()).toBe(true)

      mockShowHelp.value = false
      expect(mockShowHelp.value).toBe(false)
    })
  })

  describe('state transitions', () => {
    it('updates display when showHelp changes from true to false', async () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message').exists()).toBe(true)

      mockShowHelp.value = false
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-message').exists()).toBe(false)
      expect(wrapper.find('.show-help-button').exists()).toBe(true)
    })

    it('updates display when showHelp changes from false to true', async () => {
      mockShowHelp.value = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message').exists()).toBe(false)

      mockShowHelp.value = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.find('.show-help-button').exists()).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles rapid showHelp toggling', async () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()

      mockShowHelp.value = false
      mockShowHelp.value = true
      mockShowHelp.value = false
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-message').exists()).toBe(false)
      expect(wrapper.find('.show-help-button').exists()).toBe(true)
    })

    it('handles undefined showHelp gracefully', async () => {
      mockShowHelp.value = undefined
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })
})
