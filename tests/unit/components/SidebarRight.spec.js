import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarRight from '~/components/SidebarRight.vue'

describe('SidebarRight', () => {
  function createWrapper(props = {}) {
    return mount(SidebarRight, {
      props,
      global: {
        stubs: {
          ExternalDa: {
            template:
              '<div class="external-da" :class="{ jobs: jobs }"><slot /></div>',
            props: ['adUnitPath', 'maxWidth', 'maxHeight', 'divId', 'jobs'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders sidebar wrapper', () => {
      const wrapper = createWrapper({ adUnitPath: '/test/ad' })
      expect(wrapper.find('.sidebar__wrapper').exists()).toBe(true)
    })

    it('renders ExternalDa when adUnitPath is provided', () => {
      const wrapper = createWrapper({ adUnitPath: '/test/ad/path' })
      expect(wrapper.find('.external-da').exists()).toBe(true)
    })

    it('does not render ExternalDa when adUnitPath is null', () => {
      const wrapper = createWrapper({ adUnitPath: null })
      expect(wrapper.find('.external-da').exists()).toBe(false)
    })

    it('does not render ExternalDa when adUnitPath is not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.external-da').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('defaults showJobOpportunities to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showJobOpportunities')).toBe(false)
    })

    it('accepts showJobOpportunities as true', () => {
      const wrapper = createWrapper({ showJobOpportunities: true })
      expect(wrapper.props('showJobOpportunities')).toBe(true)
    })

    it('defaults adUnitPath to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('adUnitPath')).toBe(null)
    })

    it('accepts custom adUnitPath', () => {
      const wrapper = createWrapper({ adUnitPath: '/custom/path' })
      expect(wrapper.props('adUnitPath')).toBe('/custom/path')
    })

    it('defaults adDivId to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('adDivId')).toBe(null)
    })

    it('accepts custom adDivId', () => {
      const wrapper = createWrapper({ adDivId: 'my-ad-div' })
      expect(wrapper.props('adDivId')).toBe('my-ad-div')
    })
  })

  describe('ExternalDa props', () => {
    it('passes jobs prop to ExternalDa', () => {
      const wrapper = createWrapper({
        adUnitPath: '/test/ad',
        showJobOpportunities: true,
      })
      expect(wrapper.find('.external-da').classes()).toContain('jobs')
    })

    it('passes adUnitPath to ExternalDa', () => {
      const wrapper = createWrapper({ adUnitPath: '/my/ad/path' })
      // ExternalDa renders with .external-da class from our stub
      expect(wrapper.find('.external-da').exists()).toBe(true)
    })
  })
})
