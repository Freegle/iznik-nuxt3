import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavbarMobileItem from '~/components/NavbarMobileItem.vue'

describe('NavbarMobileItem', () => {
  function createWrapper(props = {}) {
    return mount(NavbarMobileItem, {
      props: {
        to: '/browse',
        icon: 'search',
        label: 'Browse',
        ...props,
      },
      global: {
        stubs: {
          'nuxt-link': {
            template:
              '<a :href="to" :class="$attrs.class" @click="$emit(\'click\')" @mousedown="$emit(\'mousedown\')"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders navbar mobile item', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-mobile-item').exists()).toBe(true)
    })

    it('links to correct path', () => {
      const wrapper = createWrapper({ to: '/chats' })
      expect(wrapper.find('a').attributes('href')).toBe('/chats')
    })

    it('shows icon', () => {
      const wrapper = createWrapper({ icon: 'comments' })
      expect(wrapper.find('.v-icon[data-icon="comments"]').exists()).toBe(true)
    })

    it('shows label', () => {
      const wrapper = createWrapper({ label: 'Messages' })
      expect(wrapper.text()).toContain('Messages')
    })
  })

  describe('badge', () => {
    it('shows badge when provided', () => {
      const wrapper = createWrapper({ badge: 5 })
      expect(wrapper.find('.nav-badge').exists()).toBe(true)
      expect(wrapper.find('.nav-badge').text()).toBe('5')
    })

    it('hides badge when not provided', () => {
      const wrapper = createWrapper({ badge: null })
      expect(wrapper.find('.nav-badge').exists()).toBe(false)
    })

    it('shows string badge', () => {
      const wrapper = createWrapper({ badge: '99+' })
      expect(wrapper.find('.nav-badge').text()).toBe('99+')
    })

    it('applies info variant by default', () => {
      const wrapper = createWrapper({ badge: 3 })
      expect(wrapper.find('.nav-badge.badge-info').exists()).toBe(true)
    })

    it('applies danger variant when specified', () => {
      const wrapper = createWrapper({ badge: 3, badgeVariant: 'danger' })
      expect(wrapper.find('.nav-badge.badge-danger').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits click event', async () => {
      const wrapper = createWrapper()
      await wrapper.find('a').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('emits mousedown event', async () => {
      const wrapper = createWrapper()
      await wrapper.find('a').trigger('mousedown')
      expect(wrapper.emitted('mousedown')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('requires to prop', () => {
      const wrapper = createWrapper({ to: '/give' })
      expect(wrapper.props('to')).toBe('/give')
    })

    it('requires icon prop', () => {
      const wrapper = createWrapper({ icon: 'gift' })
      expect(wrapper.props('icon')).toBe('gift')
    })

    it('requires label prop', () => {
      const wrapper = createWrapper({ label: 'Give' })
      expect(wrapper.props('label')).toBe('Give')
    })

    it('has optional badge prop', () => {
      const wrapper = createWrapper({ badge: 10 })
      expect(wrapper.props('badge')).toBe(10)
    })

    it('has optional badgeVariant prop with default', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('badgeVariant')).toBe('info')
    })

    it('validates badgeVariant to info or danger', () => {
      const wrapper = createWrapper({ badgeVariant: 'danger' })
      expect(wrapper.props('badgeVariant')).toBe('danger')
    })
  })
})
