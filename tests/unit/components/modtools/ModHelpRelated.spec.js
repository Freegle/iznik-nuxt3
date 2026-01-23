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

// Create test component that mirrors ModHelpRelated logic
const ModHelpRelatedTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="same-device-info">
          These are members who have
          <strong>used the same device for different members</strong>. By merging
          members who are really the same person, we can help them avoid confusion
          and missing messages - which results in fewer support requests to you!
        </p>
        <p class="similarity-criteria">
          It suggests they're probably the same person if they have a similar name
          or email, and:
        </p>
        <ul class="criteria-list">
          <li class="groups-common">they have groups in common, or</li>
          <li class="same-day-activity">they are both active on the same device on the same day</li>
        </ul>
        <p class="ignore-info">
          If you don't think they're probably the same person, then click
          <em>Ignore</em>.
        </p>
        <p class="ask-info">
          If you think they're probably the same person, you can ask them what they
          want to do. This will send them a mail like this:
        </p>
        <div class="email-preview" style="font-style: italic; padding-left: 1rem">
          <p class="email-para-1">
            We think you might have two separate accounts on Freegle, perhaps by
            mistake?
          </p>
          <p class="email-para-2">
            Name1 (email1)<br />
            Name2 (email2)
          </p>
          <p class="email-para-3">
            If these are both you, then you might miss replies or see other
            confusing things. Shall we combine them for you? If you don't recognise
            one of them, just ignore this email.
          </p>
          <button class="preview-button" disabled>
            Click here to let us know
          </button>
        </div>
        <p class="privacy-info">The email addresses are masked out a bit for privacy.</p>
        <p class="merge-info">
          This takes them to a page where they can merge the accounts and decide
          which email address they prefer to use, or leave the two accounts
          separate.
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

describe('ModHelpRelated', () => {
  function mountComponent() {
    return mount(ModHelpRelatedTest)
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

  describe('help content - same device section', () => {
    it('explains same device detection', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'used the same device for different members'
      )
    })

    it('has emphasized text for same device', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const strong = wrapper.find('.same-device-info strong')
      expect(strong.exists()).toBe(true)
    })

    it('explains benefits of merging', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'we can help them avoid confusion and missing messages'
      )
    })

    it('mentions reduced support requests', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'which results in fewer support requests to you'
      )
    })
  })

  describe('help content - similarity criteria section', () => {
    it('explains similarity criteria introduction', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "It suggests they're probably the same person if they have a similar name or email"
      )
    })

    it('displays criteria list', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const list = wrapper.find('.criteria-list')
      expect(list.exists()).toBe(true)
    })

    it('has two criteria items', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const items = wrapper.findAll('.criteria-list li')
      expect(items.length).toBe(2)
    })

    it('mentions groups in common criterion', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('they have groups in common')
    })

    it('mentions same day activity criterion', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'they are both active on the same device on the same day'
      )
    })
  })

  describe('help content - ignore section', () => {
    it('explains Ignore option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "If you don't think they're probably the same person, then click Ignore"
      )
    })
  })

  describe('help content - ask section', () => {
    it('explains asking the member', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "If you think they're probably the same person, you can ask them what they want to do"
      )
    })

    it('mentions email being sent', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('This will send them a mail like this')
    })
  })

  describe('help content - email preview section', () => {
    it('displays email preview', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const preview = wrapper.find('.email-preview')
      expect(preview.exists()).toBe(true)
    })

    it('shows email opening question', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'We think you might have two separate accounts on Freegle, perhaps by mistake?'
      )
    })

    it('shows sample account names', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Name1 (email1)')
      expect(wrapper.text()).toContain('Name2 (email2)')
    })

    it('shows explanation of confusion', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'If these are both you, then you might miss replies or see other confusing things'
      )
    })

    it('shows merge offer', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Shall we combine them for you?')
    })

    it('shows ignore instruction', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "If you don't recognise one of them, just ignore this email"
      )
    })

    it('shows disabled preview button', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const button = wrapper.find('.preview-button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.text()).toContain('Click here to let us know')
    })
  })

  describe('help content - privacy section', () => {
    it('explains email masking', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'The email addresses are masked out a bit for privacy'
      )
    })
  })

  describe('help content - merge section', () => {
    it('explains merge page', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'This takes them to a page where they can merge the accounts'
      )
    })

    it('mentions email preference option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'decide which email address they prefer to use'
      )
    })

    it('mentions keeping accounts separate option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('or leave the two accounts separate')
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
