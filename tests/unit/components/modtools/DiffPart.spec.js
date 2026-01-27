import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DiffPart from '~/modtools/components/DiffPart.vue'

describe('DiffPart', () => {
  // Helper to mount component with specific part data
  function mountDiffPart(partOverrides = {}) {
    const defaultPart = {
      value: 'test text',
      added: false,
      removed: false,
      ...partOverrides,
    }
    return mount(DiffPart, {
      props: { part: defaultPart },
    })
  }

  // Helper to get the span element (component has a comment + span, so VTU wraps in div)
  function getSpan(wrapper) {
    return wrapper.find('span')
  }

  describe('rendering', () => {
    it('renders the part value text', () => {
      const wrapper = mountDiffPart({ value: 'Hello World' })
      expect(getSpan(wrapper).text()).toBe('Hello World')
    })

    it('renders as a span element', () => {
      const wrapper = mountDiffPart()
      expect(getSpan(wrapper).exists()).toBe(true)
      expect(getSpan(wrapper).element.tagName).toBe('SPAN')
    })
  })

  describe('unchanged text (default state)', () => {
    it('applies text-black class for unchanged text', () => {
      const wrapper = mountDiffPart({ added: false, removed: false })
      expect(getSpan(wrapper).classes()).toContain('text-black')
    })

    it('has title "Unchanged" for unchanged text', () => {
      const wrapper = mountDiffPart({ added: false, removed: false })
      expect(getSpan(wrapper).attributes('title')).toBe('Unchanged')
    })

    it('does not have warning or danger classes', () => {
      const wrapper = mountDiffPart({ added: false, removed: false })
      const span = getSpan(wrapper)
      expect(span.classes()).not.toContain('text-warning')
      expect(span.classes()).not.toContain('text-danger')
      expect(span.classes()).not.toContain('strike')
    })
  })

  describe('added text', () => {
    it('applies text-warning class for added text', () => {
      const wrapper = mountDiffPart({ added: true })
      expect(getSpan(wrapper).classes()).toContain('text-warning')
    })

    it('has title "Added" for added text', () => {
      const wrapper = mountDiffPart({ added: true })
      expect(getSpan(wrapper).attributes('title')).toBe('Added')
    })

    it('does not have removed classes', () => {
      const wrapper = mountDiffPart({ added: true })
      const span = getSpan(wrapper)
      expect(span.classes()).not.toContain('text-danger')
      expect(span.classes()).not.toContain('strike')
    })
  })

  describe('removed text', () => {
    it('applies strike and text-danger classes for removed text', () => {
      const wrapper = mountDiffPart({ removed: true })
      const span = getSpan(wrapper)
      expect(span.classes()).toContain('strike')
      expect(span.classes()).toContain('text-danger')
      expect(span.classes()).toContain('text-muted')
    })

    it('has title "Removed" for removed text', () => {
      const wrapper = mountDiffPart({ removed: true })
      expect(getSpan(wrapper).attributes('title')).toBe('Removed')
    })

    it('does not have added classes', () => {
      const wrapper = mountDiffPart({ removed: true })
      expect(getSpan(wrapper).classes()).not.toContain('text-warning')
    })
  })

  describe('props validation', () => {
    it('accepts part object with value, added, and removed properties', () => {
      const wrapper = mountDiffPart({
        value: 'Custom text',
        added: true,
        removed: false,
      })
      expect(getSpan(wrapper).text()).toBe('Custom text')
    })
  })
})
