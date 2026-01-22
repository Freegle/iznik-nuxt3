import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelpQuestion from '~/components/HelpQuestion.vue'

describe('HelpQuestion', () => {
  function mountHelpQuestion(props = {}, slots = {}) {
    const defaultProps = {
      id: 'question-1',
      matches: ['question-1', 'question-2', 'question-3'],
    }
    return mount(HelpQuestion, {
      props: { ...defaultProps, ...props },
      slots: {
        title: '<span>Test Question Title</span>',
        default: '<p>Test answer content</p>',
        ...slots,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="variant ? \'btn-\' + variant : \'\'" @click="handleClick"><slot /></button>',
            props: ['variant'],
            emits: ['click'],
            methods: {
              handleClick(e) {
                // Emit both the custom event and let the native click bubble
                this.$emit('click', e)
              },
            },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders when id is in matches array', () => {
      const wrapper = mountHelpQuestion({
        id: 'question-1',
        matches: ['question-1', 'question-2'],
      })
      expect(wrapper.isVisible()).toBe(true)
    })

    it('hides when id is not in matches array', () => {
      const wrapper = mountHelpQuestion({
        id: 'question-99',
        matches: ['question-1', 'question-2'],
      })
      // v-show uses display:none, check the style
      expect(wrapper.element.style.display).toBe('none')
    })

    it('renders with the correct id attribute', () => {
      const wrapper = mountHelpQuestion({ id: 'my-question' })
      expect(wrapper.attributes('id')).toBe('my-question')
    })

    it('renders h3 for title slot', () => {
      const wrapper = mountHelpQuestion()
      expect(wrapper.find('h3').exists()).toBe(true)
    })

    it('displays title slot content', () => {
      const wrapper = mountHelpQuestion(
        {},
        { title: '<span>Custom Title</span>' }
      )
      expect(wrapper.find('h3').text()).toContain('Custom Title')
    })

    it('title has text-black class', () => {
      const wrapper = mountHelpQuestion()
      expect(wrapper.find('h3').classes()).toContain('text-black')
    })
  })

  describe('auto-expand behavior when few matches', () => {
    it('shows answer content when matches <= 3', () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3'],
        id: 'q1',
      })
      expect(wrapper.text()).toContain('Test answer content')
    })

    it('shows answer for exactly 3 matches', () => {
      const wrapper = mountHelpQuestion({
        matches: ['a', 'b', 'c'],
        id: 'a',
      })
      expect(wrapper.text()).toContain('Test answer content')
    })

    it('shows answer for 2 matches', () => {
      const wrapper = mountHelpQuestion({
        matches: ['a', 'b'],
        id: 'a',
      })
      expect(wrapper.text()).toContain('Test answer content')
    })

    it('shows answer for 1 match', () => {
      const wrapper = mountHelpQuestion({
        matches: ['a'],
        id: 'a',
      })
      expect(wrapper.text()).toContain('Test answer content')
    })
  })

  describe('collapsed behavior when many matches', () => {
    it('shows "Click to show answer" button when matches > 3 and not expanded', () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('Click to show answer')
    })

    it('hides answer content when matches > 3 and not expanded', () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })
      expect(wrapper.text()).not.toContain('Test answer content')
    })

    it('button has white variant', () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })
      expect(wrapper.find('button').classes()).toContain('btn-white')
    })
  })

  describe('expand toggle functionality', () => {
    it('expand function toggles expanded state', async () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })

      // Initially hidden (matches > 3 and not expanded)
      expect(wrapper.text()).not.toContain('Test answer content')

      // The expand function is called by clicking either the h3 or the button
      // Testing via h3 since it directly triggers the expand function
      await wrapper.find('h3').trigger('click')

      // Now visible
      expect(wrapper.text()).toContain('Test answer content')
    })

    it('shows answer after clicking the title (h3)', async () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })

      // Initially hidden
      expect(wrapper.text()).not.toContain('Test answer content')

      // Click the title to expand
      await wrapper.find('h3').trigger('click')

      // Now visible
      expect(wrapper.text()).toContain('Test answer content')
    })

    it('toggles expanded state on title click', async () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })

      // Click to expand
      await wrapper.find('h3').trigger('click')
      expect(wrapper.text()).toContain('Test answer content')

      // Click to collapse
      await wrapper.find('h3').trigger('click')
      expect(wrapper.text()).not.toContain('Test answer content')
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('hides the expand button once expanded', async () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })

      // Button exists initially
      expect(wrapper.find('button').exists()).toBe(true)

      // Click to expand
      await wrapper.find('h3').trigger('click')

      // Button should be gone (showing content instead)
      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('props validation', () => {
    it('accepts id prop', () => {
      const wrapper = mountHelpQuestion({ id: 'test-id' })
      expect(wrapper.props('id')).toBe('test-id')
    })

    it('accepts matches array prop', () => {
      const matches = ['a', 'b', 'c']
      const wrapper = mountHelpQuestion({ id: 'a', matches })
      expect(wrapper.props('matches')).toEqual(matches)
    })
  })

  describe('edge cases', () => {
    it('handles empty matches array (question hidden)', () => {
      const wrapper = mountHelpQuestion({
        id: 'question-1',
        matches: [],
      })
      // v-show uses display:none, check the style
      expect(wrapper.element.style.display).toBe('none')
    })

    it('handles matches array with exactly 4 items (threshold)', () => {
      const wrapper = mountHelpQuestion({
        id: 'q1',
        matches: ['q1', 'q2', 'q3', 'q4'],
      })
      // 4 > 3, so should show expand button
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('expands correctly with many matches', async () => {
      const wrapper = mountHelpQuestion({
        id: 'q1',
        matches: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
      })

      await wrapper.find('h3').trigger('click')
      expect(wrapper.text()).toContain('Test answer content')
    })
  })
})
