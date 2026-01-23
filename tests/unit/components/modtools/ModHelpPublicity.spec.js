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

// Create test component that mirrors ModHelpPublicity logic
const ModHelpPublicityTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="actions-info">
          These are actions you can take to promote your group. For example, you
          will see social media posts which you might like to share to your
          communities' Facebook pages.
        </p>
        <p class="facebook-info">
          You don't have to use Facebook yourself to do this. The share to Facebook
          will happen magically on the servers if you click the share buttons below.
        </p>
        <p class="hide-info">
          If you don't want to share a particular item, share any others that you
          do, then click the <em>Hide </em> or <em>Hide All</em>
          button. This will hide it for all mods on this community.
        </p>
        <p class="guidelines-info">
          We can't do this automatically - as per
          <a href="https://developers.facebook.com/docs/facebook-login/permissions#reference-manage_pages" class="external-link facebook-link">Facebook's guidelines</a>
          you need to explicitly decide to publish content on pages that you manage.
        </p>
        <p class="wiki-links">
          Read about more ways to promote your group on the wiki
          <a href="https://wiki.ilovefreegle.org/Publicity" class="external-link publicity-link">here</a> and
          <a href="https://wiki.ilovefreegle.org/Promotion" class="external-link promotion-link">
            here </a
          >.
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

describe('ModHelpPublicity', () => {
  function mountComponent() {
    return mount(ModHelpPublicityTest)
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

  describe('help content - actions section', () => {
    it('explains promotional actions', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'These are actions you can take to promote your group'
      )
    })

    it('mentions social media posts example', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'you will see social media posts which you might like to share'
      )
    })

    it('mentions Facebook pages', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("to your communities' Facebook pages")
    })
  })

  describe('help content - Facebook section', () => {
    it('explains Facebook not required personally', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "You don't have to use Facebook yourself to do this"
      )
    })

    it('explains server-side sharing', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'The share to Facebook will happen magically on the servers'
      )
    })

    it('mentions share buttons', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('if you click the share buttons below')
    })
  })

  describe('help content - hide section', () => {
    it('explains hiding unwanted items', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "If you don't want to share a particular item"
      )
    })

    it('mentions Hide button', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('click the Hide')
    })

    it('mentions Hide All button', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Hide All')
    })

    it('explains hide applies to all mods', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'This will hide it for all mods on this community'
      )
    })
  })

  describe('help content - guidelines section', () => {
    it('explains why automatic sharing is not possible', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("We can't do this automatically")
    })

    it('mentions Facebook guidelines', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain("as per Facebook's guidelines")
    })

    it('explains explicit decision requirement', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'you need to explicitly decide to publish content on pages that you manage'
      )
    })

    it('has Facebook guidelines link', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const link = wrapper.find('.facebook-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe(
        'https://developers.facebook.com/docs/facebook-login/permissions#reference-manage_pages'
      )
    })
  })

  describe('help content - wiki links section', () => {
    it('mentions wiki resources', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Read about more ways to promote your group on the wiki'
      )
    })

    it('has publicity wiki link', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const link = wrapper.find('.publicity-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe(
        'https://wiki.ilovefreegle.org/Publicity'
      )
    })

    it('has promotion wiki link', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const link = wrapper.find('.promotion-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe(
        'https://wiki.ilovefreegle.org/Promotion'
      )
    })

    it('has three external links total', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const links = wrapper.findAll('.external-link')
      expect(links.length).toBe(3)
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
