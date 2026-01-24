import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import VisualiseUser from '~/components/VisualiseUser.vue'

vi.mock('leaflet/dist/leaflet-src.esm', () => ({}))

describe('VisualiseUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(VisualiseUser, {
                id: 1,
                icon: '/icon.jpg',
                lat: 51.5074,
                lng: -0.1278,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'l-marker': {
            template:
              '<div class="l-marker" :data-lat="latLng?.[0]" :data-lng="latLng?.[1]" :data-duration="duration"><slot /></div>',
            props: ['latLng', 'title', 'duration'],
          },
          'l-icon': {
            template: '<div class="l-icon"><slot /></div>',
          },
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-size="size" :data-border="border" />',
            props: ['image', 'border', 'size', 'lazy'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders marker after mount sets position from props', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(VisualiseUser)
      // onMounted sets currlat/currlng from props
      expect(component.vm.currlat).toBe(51.5074)
      expect(component.vm.currlng).toBe(-0.1278)
    })

    it('renders marker after mount sets position', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(VisualiseUser)

      // Manually trigger what onMounted does
      component.vm.currlat = 51.5074
      component.vm.currlng = -0.1278
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })

    it('renders ProfileImage inside marker', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(VisualiseUser)

      component.vm.currlat = 51.5074
      component.vm.currlng = -0.1278
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('passes icon prop to ProfileImage', async () => {
      const wrapper = await createWrapper({ icon: '/test-icon.jpg' })
      const component = wrapper.findComponent(VisualiseUser)

      component.vm.currlat = 51.5074
      component.vm.currlng = -0.1278
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.profile-image').attributes('data-image')).toBe(
        '/test-icon.jpg'
      )
    })

    it('uses lg-always size for ProfileImage', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(VisualiseUser)

      component.vm.currlat = 51.5074
      component.vm.currlng = -0.1278
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.profile-image').attributes('data-size')).toBe(
        'lg-always'
      )
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 5 })
      expect(wrapper.findComponent(VisualiseUser).props('id')).toBe(5)
    })

    it('requires icon prop', async () => {
      const wrapper = await createWrapper({ icon: '/user.png' })
      expect(wrapper.findComponent(VisualiseUser).props('icon')).toBe(
        '/user.png'
      )
    })

    it('requires lat prop', async () => {
      const wrapper = await createWrapper({ lat: 52.2297 })
      expect(wrapper.findComponent(VisualiseUser).props('lat')).toBe(52.2297)
    })

    it('requires lng prop', async () => {
      const wrapper = await createWrapper({ lng: 21.0122 })
      expect(wrapper.findComponent(VisualiseUser).props('lng')).toBe(21.0122)
    })
  })

  describe('position state', () => {
    it('sets position from props after mount', async () => {
      const wrapper = await createWrapper({ lat: 40.7128, lng: -74.006 })
      const component = wrapper.findComponent(VisualiseUser)
      expect(component.vm.currlat).toBe(40.7128)
      expect(component.vm.currlng).toBe(-74.006)
    })
  })

  describe('marker animation', () => {
    it('sets duration to 2000ms', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(VisualiseUser)

      component.vm.currlat = 51.5074
      component.vm.currlng = -0.1278
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.l-marker').attributes('data-duration')).toBe('2000')
    })
  })
})
