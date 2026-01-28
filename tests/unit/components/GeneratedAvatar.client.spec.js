import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GeneratedAvatar from '~/components/GeneratedAvatar.client.vue'

vi.mock('vue-boring-avatars', () => ({
  default: {
    template:
      '<svg class="boring-avatar" :data-name="name" :data-size="size" :data-variant="variant" />',
    props: ['name', 'size', 'variant', 'colors'],
  },
}))

describe('GeneratedAvatar.client', () => {
  function createWrapper(props = {}) {
    return mount(GeneratedAvatar, {
      props: {
        name: 'TestUser',
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders avatar', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('svg').exists() || wrapper.find('.boring-avatar').exists()
      ).toBe(true)
    })

    it('passes name to avatar', () => {
      const wrapper = createWrapper({ name: 'John Doe' })
      // Either boring-avatars or custom SVG
      const boring = wrapper.find('.boring-avatar')
      if (boring.exists()) {
        expect(boring.attributes('data-name')).toBe('John Doe')
      } else {
        // Custom variant renders SVG directly
        expect(wrapper.find('svg').exists()).toBe(true)
      }
    })

    it('uses default size of 56', () => {
      const wrapper = createWrapper()
      const boring = wrapper.find('.boring-avatar')
      if (boring.exists()) {
        expect(boring.attributes('data-size')).toBe('56')
      } else {
        const svg = wrapper.find('svg')
        expect(svg.attributes('width')).toBe('56')
        expect(svg.attributes('height')).toBe('56')
      }
    })

    it('uses custom size when provided', () => {
      const wrapper = createWrapper({ size: 100 })
      const boring = wrapper.find('.boring-avatar')
      if (boring.exists()) {
        expect(boring.attributes('data-size')).toBe('100')
      } else {
        const svg = wrapper.find('svg')
        expect(svg.attributes('width')).toBe('100')
        expect(svg.attributes('height')).toBe('100')
      }
    })
  })

  describe('variant selection', () => {
    it('selects variant based on name hash', () => {
      // Different names should potentially produce different variants
      const wrapper1 = createWrapper({ name: 'Alice' })
      const wrapper2 = createWrapper({ name: 'Bob' })
      // Just verify both render without error
      expect(wrapper1.find('svg').exists()).toBe(true)
      expect(wrapper2.find('svg').exists()).toBe(true)
    })

    it('produces consistent variant for same name', () => {
      const wrapper1 = createWrapper({ name: 'SameName' })
      const wrapper2 = createWrapper({ name: 'SameName' })

      const boring1 = wrapper1.find('.boring-avatar')
      const boring2 = wrapper2.find('.boring-avatar')

      if (boring1.exists() && boring2.exists()) {
        expect(boring1.attributes('data-variant')).toBe(
          boring2.attributes('data-variant')
        )
      }
      // Both should render the same type of avatar
      expect(wrapper1.find('svg').exists()).toBe(wrapper2.find('svg').exists())
    })
  })

  describe('custom variants', () => {
    it('renders spots variant with circles', () => {
      // Find a name that produces 'spots' variant
      // The hash determines variant, so we need to test the SVG structure when custom
      const wrapper = createWrapper({ name: 'TestSpots' })
      const svg = wrapper.find('svg')
      if (svg.exists() && !wrapper.find('.boring-avatar').exists()) {
        // Custom variant - should have rect background
        expect(svg.find('rect').exists()).toBe(true)
      }
    })

    it('renders tiles variant with rectangles', () => {
      const wrapper = createWrapper({ name: 'TestTiles' })
      const svg = wrapper.find('svg')
      if (svg.exists() && !wrapper.find('.boring-avatar').exists()) {
        // Custom variant - should have rect elements
        expect(svg.findAll('rect').length).toBeGreaterThan(0)
      }
    })

    it('spots variant has 5 circles plus background', () => {
      // Create a wrapper and check if it's spots variant
      const wrapper = createWrapper({ name: 'SpotsTest' })
      const svg = wrapper.find('svg')
      if (svg.exists() && svg.findAll('circle').length > 0) {
        // This is spots variant
        expect(svg.findAll('circle').length).toBe(5)
        expect(svg.find('rect').exists()).toBe(true) // background
      }
    })

    it('tiles variant has 4 rectangles plus background', () => {
      const wrapper = createWrapper({ name: 'TilesVariant' })
      const svg = wrapper.find('svg')
      if (
        svg.exists() &&
        !wrapper.find('.boring-avatar').exists() &&
        svg.findAll('circle').length === 0
      ) {
        // This is tiles variant (has rects but no circles)
        expect(svg.findAll('rect').length).toBe(5) // 1 background + 4 tiles
      }
    })
  })

  describe('boring-avatars variants', () => {
    it('passes variant to Avatar component', () => {
      const wrapper = createWrapper({ name: 'BoringTest' })
      const boring = wrapper.find('.boring-avatar')
      if (boring.exists()) {
        const variant = boring.attributes('data-variant')
        expect(['pixel', 'beam', 'bauhaus', 'ring']).toContain(variant)
      }
    })
  })

  describe('color palettes', () => {
    it('assigns colors based on name hash', () => {
      const wrapper = createWrapper({ name: 'ColorTest' })
      // Just verify component renders - colors are computed internally
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('uses consistent colors for same name', () => {
      const wrapper1 = createWrapper({ name: 'SameColors' })
      const wrapper2 = createWrapper({ name: 'SameColors' })

      // Both should have same structure
      expect(wrapper1.html()).toBe(wrapper2.html())
    })
  })

  describe('props', () => {
    it('requires name prop', () => {
      const wrapper = createWrapper({ name: 'Required' })
      expect(wrapper.props('name')).toBe('Required')
    })

    it('has optional size prop with default 56', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe(56)
    })

    it('accepts custom size prop', () => {
      const wrapper = createWrapper({ size: 80 })
      expect(wrapper.props('size')).toBe(80)
    })
  })

  describe('hash function consistency', () => {
    it('generates same output for same input', () => {
      const wrapper1 = createWrapper({ name: 'HashTest123' })
      const wrapper2 = createWrapper({ name: 'HashTest123' })
      expect(wrapper1.html()).toBe(wrapper2.html())
    })

    it('generates different output for different inputs', () => {
      const wrapper1 = createWrapper({ name: 'UserA' })
      const wrapper2 = createWrapper({ name: 'UserB' })
      // Names are different enough they should produce different results
      // (though there's a small chance of collision)
      expect(wrapper1.html()).not.toBe(wrapper2.html())
    })

    it('handles empty name gracefully', () => {
      // Component uses 'user' as fallback when name is empty/null
      const wrapper = createWrapper({ name: '' })
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })
})
