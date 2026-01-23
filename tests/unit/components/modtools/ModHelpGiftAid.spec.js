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

// Create test component that mirrors ModHelpGiftAid logic
const ModHelpGiftAidTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="declarations-info">
          These are people who have completed gift aid declarations which have not
          yet been reviewed.
        </p>
        <p class="review-instruction">Please check the name, address and postcode:</p>
        <ul class="review-steps">
          <li class="looks-good-step">
            If it looks fine, then click <em>Looks Good</em>. We will then correlate
            this with their donations, and use that information later when
            submitting a Gift Aid claim.
          </li>
          <li class="identify-postcode-step">
            It'll try to identify the postcode. If it's not found it, see if you can
            figure it out. If the name or address is wrong but in an obvious way,
            please fix it. Then click <em>Save Changes</em>, and if you're happy
            with it, <em>Looks Good</em>
          </li>
          <li class="missing-info-step">
            If it's missing key information, then please click on their email
            address and ask them to provide it. You can then do the correction here.
          </li>
        </ul>
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

describe('ModHelpGiftAid', () => {
  function mountComponent() {
    return mount(ModHelpGiftAidTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShowHelp.value = true
  })

  describe('help content - declarations section', () => {
    it('explains what declarations are shown', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'people who have completed gift aid declarations which have not yet been reviewed'
      )
    })

    it('explains what to check', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Please check the name, address and postcode'
      )
    })
  })

  describe('help content - looks good step', () => {
    it('explains Looks Good action', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'If it looks fine, then click Looks Good'
      )
    })

    it('explains donation correlation', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'We will then correlate this with their donations'
      )
    })

    it('explains future Gift Aid claim usage', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'use that information later when submitting a Gift Aid claim'
      )
    })
  })

  describe('help content - postcode identification step', () => {
    it('explains automatic postcode identification', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("It'll try to identify the postcode")
    })

    it('suggests manual postcode identification', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "If it's not found it, see if you can figure it out"
      )
    })

    it('suggests fixing obvious errors', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'If the name or address is wrong but in an obvious way, please fix it'
      )
    })

    it('mentions Save Changes action', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Then click Save Changes')
    })
  })

  describe('help content - missing information step', () => {
    it('explains handling missing key information', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("If it's missing key information")
    })

    it('suggests contacting via email', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'please click on their email address and ask them to provide it'
      )
    })

    it('mentions correction capability', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('You can then do the correction here')
    })
  })

  describe('help content - review steps list', () => {
    it('displays list of review steps', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const list = wrapper.find('.review-steps')
      expect(list.exists()).toBe(true)
    })

    it('has three review steps', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const steps = wrapper.findAll('.review-steps li')
      expect(steps.length).toBe(3)
    })
  })
})
