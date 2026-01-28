import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VueThermometer from '~/components/VueThermometer.vue'

describe('VueThermometer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(VueThermometer, {
      props: {
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders the container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.vue-thermometer').exists()).toBe(true)
    })

    it('renders an SVG element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders circles for thermometer bulb', () => {
      const wrapper = createWrapper()
      const circles = wrapper.findAll('circle')
      expect(circles.length).toBeGreaterThanOrEqual(2)
    })

    it('renders rectangles for thermometer body', () => {
      const wrapper = createWrapper()
      const rects = wrapper.findAll('rect')
      expect(rects.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('custom class', () => {
    it('applies custom class when provided', () => {
      const wrapper = createWrapper({ customClass: 'my-custom-class' })
      expect(wrapper.find('.vue-thermometer').classes()).toContain(
        'my-custom-class'
      )
    })

    it('does not add extra class when not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.vue-thermometer').classes()).toEqual([
        'vue-thermometer',
      ])
    })
  })

  describe('dimensions', () => {
    it('uses default width and height', () => {
      const wrapper = createWrapper()
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('90')
      expect(svg.attributes('height')).toBe('300')
    })

    it('applies custom dimensions via options', async () => {
      const wrapper = createWrapper({
        options: {
          layout: {
            width: 120,
            height: 400,
          },
        },
      })
      await wrapper.vm.$nextTick()

      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('120')
      expect(svg.attributes('height')).toBe('400')
    })
  })

  describe('value and level calculation', () => {
    it('calculates level correctly at minimum', () => {
      const wrapper = createWrapper({ value: -20, min: -20, max: 25 })
      expect(wrapper.vm.level).toBe(0)
    })

    it('calculates level correctly at maximum', () => {
      const wrapper = createWrapper({ value: 25, min: -20, max: 25 })
      expect(wrapper.vm.level).toBe(100)
    })

    it('calculates level correctly at midpoint', () => {
      const wrapper = createWrapper({ value: 2.5, min: -20, max: 25 })
      expect(wrapper.vm.level).toBe(50)
    })

    it('handles custom min/max range', () => {
      const wrapper = createWrapper({ value: 50, min: 0, max: 100 })
      expect(wrapper.vm.level).toBe(50)
    })
  })

  describe('scale display', () => {
    it('uses default scale', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('scale')).toBe('°C')
    })

    it('accepts custom scale', () => {
      const wrapper = createWrapper({ scale: '°F' })
      expect(wrapper.props('scale')).toBe('°F')
    })

    it('displays scale in text elements', () => {
      const wrapper = createWrapper({ scale: '£' })
      const texts = wrapper.findAll('text')
      expect(texts.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain('£')
    })
  })

  describe('ticks', () => {
    it('generates correct number of ticks by default', () => {
      const wrapper = createWrapper()
      // Default ticks is 10
      expect(wrapper.vm.ticks.length).toBe(10)
    })

    it('tick array starts from max and ends at min', () => {
      const wrapper = createWrapper({ min: 0, max: 100 })
      const ticks = wrapper.vm.ticks
      expect(ticks[0]).toBe(100)
      expect(ticks[ticks.length - 1]).toBe(0)
    })

    it('renders tick paths when enabled', () => {
      const wrapper = createWrapper()
      const paths = wrapper.findAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('thermo height calculation', () => {
    it('calculates thermo height based on level', () => {
      const wrapperLow = createWrapper({ value: -20, min: -20, max: 25 })
      const wrapperHigh = createWrapper({ value: 25, min: -20, max: 25 })

      expect(wrapperLow.vm.thermoHeight).toBeLessThan(
        wrapperHigh.vm.thermoHeight
      )
    })

    it('calculates thermo offset inversely to height', () => {
      const wrapperLow = createWrapper({ value: -20, min: -20, max: 25 })
      const wrapperHigh = createWrapper({ value: 25, min: -20, max: 25 })

      expect(wrapperLow.vm.thermoOffset).toBeGreaterThan(
        wrapperHigh.vm.thermoOffset
      )
    })
  })

  describe('color options', () => {
    it('uses default thermo color', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.defaultOptions.thermo.color).toBe('#FF0000')
    })

    it('applies custom thermo color via options', async () => {
      const wrapper = createWrapper({
        options: {
          thermo: {
            color: '#00FF00',
          },
        },
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.defaultOptions.thermo.color).toBe('#00FF00')
    })

    it('applies custom background color via options', async () => {
      const wrapper = createWrapper({
        options: {
          thermo: {
            backgroundColor: '#FFFFFF',
          },
        },
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.defaultOptions.thermo.backgroundColor).toBe('#FFFFFF')
    })
  })

  describe('text options', () => {
    it('uses default text color', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.defaultOptions.text.color).toBe('black')
    })

    it('uses default font size', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.defaultOptions.text.fontSize).toBe(10)
    })

    it('can disable text via options', async () => {
      const wrapper = createWrapper({
        options: {
          text: {
            textEnabled: false,
          },
        },
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.defaultOptions.text.textEnabled).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('calculates baseXOffset correctly', () => {
      const wrapper = createWrapper()
      // Default width is 90, so 90/5 = 18
      expect(wrapper.vm.baseXOffset).toBe(18)
    })

    it('calculates glassWidth correctly', () => {
      const wrapper = createWrapper()
      // Default width is 90, so 90/6 + 6 = 21
      expect(wrapper.vm.glassWidth).toBe(21)
    })

    it('calculates thermoWidth correctly', () => {
      const wrapper = createWrapper()
      // Default width is 90, so 90/6 = 15
      expect(wrapper.vm.thermoWidth).toBe(15)
    })

    it('calculates tickStepSize correctly', () => {
      const wrapper = createWrapper({ min: 0, max: 100 })
      // (100 - 0) / (10 - 1) = 11.11...
      expect(wrapper.vm.tickStep).toBeCloseTo(11.11, 1)
    })

    it('calculates roundDotPositionX correctly', () => {
      const wrapper = createWrapper()
      // baseXOffset + glassWidth * 0.5 = 18 + 21 * 0.5 = 28.5
      expect(wrapper.vm.roundDotPositionX).toBe(28.5)
    })
  })

  describe('props', () => {
    it('has value prop defaulting to 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('value')).toBe(0)
    })

    it('has min prop defaulting to -20', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('min')).toBe(-20)
    })

    it('has max prop defaulting to 25', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('max')).toBe(25)
    })

    it('has scale prop defaulting to °C', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('scale')).toBe('°C')
    })

    it('accepts custom value', () => {
      const wrapper = createWrapper({ value: 15 })
      expect(wrapper.props('value')).toBe(15)
    })

    it('accepts custom min', () => {
      const wrapper = createWrapper({ min: 0 })
      expect(wrapper.props('min')).toBe(0)
    })

    it('accepts custom max', () => {
      const wrapper = createWrapper({ max: 100 })
      expect(wrapper.props('max')).toBe(100)
    })
  })

  describe('methods', () => {
    it('offsetText returns calculated offset', () => {
      const wrapper = createWrapper()
      const offset = wrapper.vm.offsetText(0)
      expect(typeof offset).toBe('number')
      expect(offset).toBeGreaterThan(0)
    })

    it('offsetLine returns path string', () => {
      const wrapper = createWrapper()
      const path = wrapper.vm.offsetLine(0)
      expect(typeof path).toBe('string')
      expect(path).toContain('m')
      expect(path).toContain('l')
    })
  })
})
