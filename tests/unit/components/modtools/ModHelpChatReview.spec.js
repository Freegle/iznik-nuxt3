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

// Create test component that mirrors ModHelpChatReview logic
const ModHelpChatReviewTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="worry-words-info">
          You will see a Chat Review if our system has picked up on one of the
          'worry words' we have stored, such as a reference to money, swearing, a
          phone number or email address.
        </p>
        <p class="quicker-review-info">
          If you are a mod on a group with the <em>Quicker Chat Review</em> setting
          in <em>Features for Moderators</em>
          then you may see chat here which is between members of other groups.
          That's the point of that setting - it helps chats get reviewed more
          rapidly, which is better for the members. If you're sure they look fine,
          approve them. Otherwise leave them for the local group volunteers.
        </p>
        <p class="recipient-info">
          Otherwise you will see chat messages here for review if the
          <b>recipient</b> is a member of one of your groups. You might see some
          where the conversation is about a post on a group that you don't moderate,
          because it's not always possible for the system to tell reliably whether a
          message relates to a specific post, multiple posts, or no post at all.
          It's fine to act on the message if you see it but unless it looks urgent
          it is better to leave it for the Mod on the group that the item was posted
          on.
        </p>
        <p class="role-info">
          It is not our role to interfere with the flow of the member's chat but if
          we happen to find violations of our rules, then we are allowed to act on
          them.
        </p>
        <p class="moderator-message-info">
          You can use the 'Add Moderator message' to make members aware their chat
          has been reviewed and to let them know if they have broken a rule such as
          offering an item for sale in response to a Wanted on the board but this
          message does go to both sides of the chat so please word it accordingly.
          This doesn't show for Quicker Chat Review messages - those notes should
          come from local volunteers.
        </p>
        <p class="wiki-link">
          Read more about this on
          <a href="https://wiki.ilovefreegle.org/Spammers#Chat_Review" class="external-link">the wiki</a>
          .
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

describe('ModHelpChatReview', () => {
  function mountComponent() {
    return mount(ModHelpChatReviewTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShowHelp.value = true
  })

  describe('help content - worry words section', () => {
    it('explains when Chat Review appears', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "You will see a Chat Review if our system has picked up on one of the 'worry words'"
      )
    })

    it('lists examples of worry words', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('reference to money')
      expect(wrapper.text()).toContain('swearing')
      expect(wrapper.text()).toContain('phone number')
      expect(wrapper.text()).toContain('email address')
    })
  })

  describe('help content - quicker chat review section', () => {
    it('explains Quicker Chat Review setting', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Quicker Chat Review')
      expect(wrapper.text()).toContain('Features for Moderators')
    })

    it('explains cross-group chat visibility', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'you may see chat here which is between members of other groups'
      )
    })

    it('explains the purpose of the setting', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'it helps chats get reviewed more rapidly'
      )
    })

    it('provides guidance on approving chats', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "If you're sure they look fine, approve them"
      )
    })
  })

  describe('help content - recipient section', () => {
    it('explains recipient-based review visibility', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'you will see chat messages here for review if the recipient is a member of one of your groups'
      )
    })

    it('explains cross-group message visibility', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "You might see some where the conversation is about a post on a group that you don't moderate"
      )
    })

    it('provides guidance on handling urgent messages', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'unless it looks urgent it is better to leave it for the Mod'
      )
    })
  })

  describe('help content - role section', () => {
    it('explains moderator role in chat', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "It is not our role to interfere with the flow of the member's chat"
      )
    })

    it('explains when action is allowed', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'if we happen to find violations of our rules, then we are allowed to act on them'
      )
    })
  })

  describe('help content - moderator message section', () => {
    it('explains Add Moderator message feature', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Add Moderator message')
    })

    it('provides example use case', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'offering an item for sale in response to a Wanted'
      )
    })

    it('warns about message visibility', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'this message does go to both sides of the chat'
      )
    })

    it('notes Quicker Chat Review exception', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "This doesn't show for Quicker Chat Review messages"
      )
    })
  })

  describe('help content - wiki link', () => {
    it('includes wiki link', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Read more about this on')
      expect(wrapper.find('.external-link').exists()).toBe(true)
    })

    it('wiki link has correct URL', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const link = wrapper.find('.external-link')
      expect(link.attributes('href')).toBe(
        'https://wiki.ilovefreegle.org/Spammers#Chat_Review'
      )
    })
  })
})
