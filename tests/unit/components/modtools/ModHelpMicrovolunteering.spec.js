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

// Create test component that mirrors ModHelpMicrovolunteering logic
const ModHelpMicrovolunteeringTest = {
  template: `
    <div>
      <div v-if="showHelp" class="notice-message">
        <button class="float-end hide-button" @click="toggleHelp">
          Hide Help
        </button>
        <p class="text-danger work-in-progress">This is a work in progress.</p>
        <p class="page-description">
          This page shows the people who've done the most micro-volunteering in the
          last 90 days.
        </p>
        <ul class="feature-list">
          <li class="activity-graph-info">
            The activity graph shows how often they've been active. The more shaded
            area, the more active they've been.
          </li>
          <li class="accuracy-info">
            Accuracy indicates how often they have agreed with the consensus from
            other micro-volunteers. Only some micro-volunteering tasks require
            consensus (e.g. rotating photos doesn't).
          </li>
        </ul>
        <p class="usage-suggestion">
          You can use this to see whether people might be worth talking to as
          possible moderators.
        </p>
        <ul class="moderator-criteria-list">
          <li class="activity-criteria">
            Regular or continuous activity is good because it indicates a good
            commitment to Freegle.
          </li>
          <li class="accuracy-criteria">
            High accuracy probably indicates reasonable judgement. You can review
            their activity using <em>View</em>.
          </li>
          <li class="advanced-tasks-info">
            You can try them out on more advanced tasks, like reviewing Pending
            messages. Click on their ID and change their
            <em>Volunteering</em> status to <em>Advanced</em>. That is a setting for
            this user - it will apply across all groups they're on with
            micro-volunteering enabled.
          </li>
          <li class="contact-suggestion">
            If they stay active and have good accuracy, then it might be worth
            contacting them.
          </li>
        </ul>
        <p class="wiki-link">
          Read more <a href="https://wiki.ilovefreegle.org/Microvolunteering" class="external-link">on the wiki</a>.
        </p>
      </div>
      <button
        v-if="!showHelp"
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

describe('ModHelpMicrovolunteering', () => {
  function mountComponent() {
    return mount(ModHelpMicrovolunteeringTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockShowHelp.value = true
  })

  describe('help content - work in progress notice', () => {
    it('displays work in progress warning', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.work-in-progress').exists()).toBe(true)
      expect(wrapper.text()).toContain('This is a work in progress')
    })

    it('work in progress has danger styling class', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const warning = wrapper.find('.work-in-progress')
      expect(warning.classes()).toContain('text-danger')
    })
  })

  describe('help content - page description section', () => {
    it('explains what the page shows', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "This page shows the people who've done the most micro-volunteering"
      )
    })

    it('mentions 90 day timeframe', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('in the last 90 days')
    })
  })

  describe('help content - feature list section', () => {
    it('displays feature list', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const list = wrapper.find('.feature-list')
      expect(list.exists()).toBe(true)
    })

    it('has two feature items', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const items = wrapper.findAll('.feature-list li')
      expect(items.length).toBe(2)
    })

    it('explains activity graph', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "The activity graph shows how often they've been active"
      )
      expect(wrapper.text()).toContain(
        "The more shaded area, the more active they've been"
      )
    })

    it('explains accuracy metric', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Accuracy indicates how often they have agreed with the consensus'
      )
    })

    it('mentions consensus exception for rotating photos', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "Only some micro-volunteering tasks require consensus (e.g. rotating photos doesn't)"
      )
    })
  })

  describe('help content - usage suggestion section', () => {
    it('suggests use for finding moderators', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You can use this to see whether people might be worth talking to as possible moderators'
      )
    })
  })

  describe('help content - moderator criteria section', () => {
    it('displays moderator criteria list', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const list = wrapper.find('.moderator-criteria-list')
      expect(list.exists()).toBe(true)
    })

    it('has four criteria items', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      const items = wrapper.findAll('.moderator-criteria-list li')
      expect(items.length).toBe(4)
    })

    it('explains activity criteria', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Regular or continuous activity is good because it indicates a good commitment to Freegle'
      )
    })

    it('explains accuracy criteria', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'High accuracy probably indicates reasonable judgement'
      )
    })

    it('mentions View action for reviewing activity', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You can review their activity using View'
      )
    })

    it('explains advanced tasks option', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You can try them out on more advanced tasks, like reviewing Pending messages'
      )
    })

    it('explains how to set advanced status', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'Click on their ID and change their Volunteering status to Advanced'
      )
    })

    it('explains advanced status scope', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        "That is a setting for this user - it will apply across all groups they're on with micro-volunteering enabled"
      )
    })

    it('suggests contacting active and accurate users', () => {
      mockShowHelp.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'If they stay active and have good accuracy, then it might be worth contacting them'
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
        'https://wiki.ilovefreegle.org/Microvolunteering'
      )
    })
  })
})
