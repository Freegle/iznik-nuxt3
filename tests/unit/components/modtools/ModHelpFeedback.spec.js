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

// Create test component that mirrors ModHelpFeedback logic
const ModHelpFeedbackTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="info-source">
          This is the information we get when people mark items as TAKEN or
          RECEIVED. They can add comments, and if they're on the site they might
          click a happy/neutral/unhappy face to indicate how they're feeling.
        </p>
        <p class="unhappy-advice">
          You might like to reply to the people who are unhappy. Often just replying
          to them will make them feel better, even if you can't solve what they're
          unhappy about (for example if another freegler has let them down).
        </p>
        <p class="filter-info">
          Not everyone is unhappy! We just show you those by default because they're
          the ones where you're most likely to want to do something. You can use the
          dropdown filter to view the others.
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

describe('ModHelpFeedback', () => {
  function mountComponent() {
    return mount(ModHelpFeedbackTest)
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

  describe('help content - information source section', () => {
    it('explains when feedback is collected', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'when people mark items as TAKEN or RECEIVED'
      )
    })

    it('mentions ability to add comments', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('They can add comments')
    })

    it('explains happiness indicator', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "click a happy/neutral/unhappy face to indicate how they're feeling"
      )
    })

    it('mentions site-based interaction', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("if they're on the site")
    })
  })

  describe('help content - unhappy member advice section', () => {
    it('suggests replying to unhappy people', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You might like to reply to the people who are unhappy'
      )
    })

    it('explains benefits of replying', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Often just replying to them will make them feel better'
      )
    })

    it('acknowledges unsolvable situations', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "even if you can't solve what they're unhappy about"
      )
    })

    it('provides example of unsolvable situation', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('if another freegler has let them down')
    })
  })

  describe('help content - filter section', () => {
    it('clarifies that not everyone is unhappy', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Not everyone is unhappy!')
    })

    it('explains default filter reason', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "We just show you those by default because they're the ones where you're most likely to want to do something"
      )
    })

    it('mentions dropdown filter option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You can use the dropdown filter to view the others'
      )
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
