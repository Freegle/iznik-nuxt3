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
    it.each([
      [1, ['q1']],
      [2, ['q1', 'q2']],
      [3, ['q1', 'q2', 'q3']],
    ])('auto-expands answer when matches=%d', (_, matches) => {
      const wrapper = mountHelpQuestion({ matches, id: 'q1' })
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
    it('expands and collapses on title click', async () => {
      const wrapper = mountHelpQuestion({
        matches: ['q1', 'q2', 'q3', 'q4'],
        id: 'q1',
      })

      // Initially hidden with expand button
      expect(wrapper.text()).not.toContain('Test answer content')
      expect(wrapper.find('button').exists()).toBe(true)

      // Click to expand - answer visible, button gone
      await wrapper.find('h3').trigger('click')
      expect(wrapper.text()).toContain('Test answer content')
      expect(wrapper.find('button').exists()).toBe(false)

      // Click to collapse - answer hidden, button back
      await wrapper.find('h3').trigger('click')
      expect(wrapper.text()).not.toContain('Test answer content')
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('hides question when matches array is empty', () => {
      const wrapper = mountHelpQuestion({ id: 'q1', matches: [] })
      expect(wrapper.element.style.display).toBe('none')
    })

    it.each([
      [4, true],
      [10, true],
    ])('shows expand button when matches=%d (>3)', (count, showsButton) => {
      const matches = Array.from({ length: count }, (_, i) => `q${i + 1}`)
      const wrapper = mountHelpQuestion({ id: 'q1', matches })
      expect(wrapper.find('button').exists()).toBe(showsButton)
    })
  })
})
