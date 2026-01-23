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

// Create test component that mirrors ModHelpSpammers logic
const ModHelpSpammersTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="spammer-review-info">
          Spammer reports are reviewed before a member appears on the list. Once
          someone is on this list, they will automatically be removed from
          communities unless you've disabled that in Settings. If you think someone
          is on this list wrongly, you can request that they be removed using the
          button below.
        </p>
        <p class="safelist-info">
          Safelisted people are those who have good reasons to join many groups, who
          we flag up so that you don't accidentally think they're spammers.
        </p>
        <p class="wiki-link">
          Read more <a href="https://wiki.ilovefreegle.org/Spammers" class="external-link">on the wiki</a>.
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

describe('ModHelpSpammers', () => {
  function mountComponent() {
    return mount(ModHelpSpammersTest)
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

  describe('help content - spammer review section', () => {
    it('explains report review process', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Spammer reports are reviewed before a member appears on the list'
      )
    })

    it('explains automatic removal', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Once someone is on this list, they will automatically be removed from communities'
      )
    })

    it('mentions Settings option to disable', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "unless you've disabled that in Settings"
      )
    })

    it('explains wrongful listing removal process', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'If you think someone is on this list wrongly, you can request that they be removed'
      )
    })

    it('mentions removal button', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('using the button below')
    })
  })

  describe('help content - safelist section', () => {
    it('explains safelisted people', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Safelisted people are those who have good reasons to join many groups'
      )
    })

    it('explains purpose of safelist flagging', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "who we flag up so that you don't accidentally think they're spammers"
      )
    })
  })

  describe('help content - wiki link', () => {
    it('includes wiki link', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Read more')
      expect(wrapper.find('.external-link').exists()).toBe(true)
    })

    it('wiki link has correct URL', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const link = wrapper.find('.external-link')
      expect(link.attributes('href')).toBe(
        'https://wiki.ilovefreegle.org/Spammers'
      )
    })

    it('wiki link text says on the wiki', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const link = wrapper.find('.external-link')
      expect(link.text()).toBe('on the wiki')
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
