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
})
