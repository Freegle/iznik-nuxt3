import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GiveAsk from '~/components/GiveAsk.vue'

describe('GiveAsk', () => {
  function mountGiveAsk(props = {}) {
    return mount(GiveAsk, {
      props,
      global: {
        stubs: {
          'b-button': {
            template:
              "<button :class=\"[variant ? 'btn-' + variant : '', 'm-1', $attrs.class]\"><slot /></button>",
            props: ['to', 'variant'],
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders two buttons for Give and Ask', () => {
      const wrapper = mountGiveAsk()
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(2)
    })

    it('renders Give button with gift icon', () => {
      const wrapper = mountGiveAsk()
      const giveButton = wrapper.findAll('button')[0]
      expect(giveButton.text()).toContain('Give')
      expect(giveButton.find('[data-icon="gift"]').exists()).toBe(true)
    })

    it('renders Ask button with shopping-cart icon', () => {
      const wrapper = mountGiveAsk()
      const askButton = wrapper.findAll('button')[1]
      expect(askButton.text()).toContain('Ask')
      expect(askButton.find('[data-icon="shopping-cart"]').exists()).toBe(true)
    })

    it('both buttons have primary variant', () => {
      const wrapper = mountGiveAsk()
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('btn-primary')
      })
    })
  })

  describe('mobile prop', () => {
    it('applies mobile display classes when mobile=true', () => {
      const wrapper = mountGiveAsk({ mobile: true })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('d-block')
      expect(container.classes()).toContain('d-xl-none')
    })

    it('does not apply mobile display classes when mobile=false', () => {
      const wrapper = mountGiveAsk({ mobile: false })
      const container = wrapper.find('div')
      expect(container.classes()).not.toContain('d-block')
      expect(container.classes()).not.toContain('d-xl-none')
    })
  })

  describe('styling', () => {
    it('container has bg-white class', () => {
      const wrapper = mountGiveAsk()
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-white')
    })

    it('buttons are wrapped in flex container', () => {
      const wrapper = mountGiveAsk()
      const flexContainer = wrapper.find('.d-flex')
      expect(flexContainer.exists()).toBe(true)
      expect(flexContainer.classes()).toContain('justify-content-between')
      expect(flexContainer.classes()).toContain('flex-wrap')
    })
  })
})
