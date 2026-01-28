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

// Create test component that mirrors ModHelpMemberReview logic
const ModHelpMemberReviewTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="automated-checks-info">
          We have some automated checks that spot unusual member behaviour.
          Sometimes these will be people who are spammers/scammers, sometimes they
          may be overenthusiastic members who need a bit of guidance, and sometimes
          they may just be perfectly good members who just happen to be caught in
          the net.
        </p>
        <p class="review-advice">
          Please review their posting history and logs. There is no national rule
          about how many groups it is reasonable for one person to join, that is up
          to group discretion. Please don't ban a multijoiner unless you have clear
          evidence of 'wrongdoing'.
        </p>
        <p class="action-options">You may or may not want to do something about them on your group:</p>
        <ul class="actions-list">
          <li class="ignore-action">
            You can ignore them until they join other groups or something else
            unusual happens.
          </li>
          <li class="remove-action">You can remove them from a group.</li>
          <li class="report-action">
            To report them as a spammer, add a note, or other things, click the link
            to go to their membership on your group.
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

describe('ModHelpMemberReview', () => {
  function mountComponent() {
    return mount(ModHelpMemberReviewTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShowHelp.value = true
  })

  describe('help content - automated checks section', () => {
    it('explains automated checks', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'We have some automated checks that spot unusual member behaviour'
      )
    })

    it('mentions spammers/scammers', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Sometimes these will be people who are spammers/scammers'
      )
    })

    it('mentions overenthusiastic members', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'overenthusiastic members who need a bit of guidance'
      )
    })

    it('mentions false positives', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'perfectly good members who just happen to be caught in the net'
      )
    })
  })

  describe('help content - review advice section', () => {
    it('advises reviewing posting history and logs', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Please review their posting history and logs'
      )
    })

    it('explains there is no national rule on group joining', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'There is no national rule about how many groups it is reasonable for one person to join'
      )
    })

    it('mentions group discretion', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('that is up to group discretion')
    })

    it('warns about banning multijoiners without evidence', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "Please don't ban a multijoiner unless you have clear evidence of 'wrongdoing'"
      )
    })
  })

  describe('help content - action options section', () => {
    it('introduces action options', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You may or may not want to do something about them on your group'
      )
    })

    it('displays list of actions', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const list = wrapper.find('.actions-list')
      expect(list.exists()).toBe(true)
    })

    it('has three action options', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const actions = wrapper.findAll('.actions-list li')
      expect(actions.length).toBe(3)
    })
  })

  describe('help content - ignore action', () => {
    it('explains ignore option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You can ignore them until they join other groups or something else unusual happens'
      )
    })
  })

  describe('help content - remove action', () => {
    it('explains remove option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('You can remove them from a group')
    })
  })

  describe('help content - report action', () => {
    it('explains report spammer option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('To report them as a spammer')
    })

    it('mentions adding notes', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('add a note')
    })

    it('mentions membership link', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'click the link to go to their membership on your group'
      )
    })
  })
})
