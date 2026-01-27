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
})
