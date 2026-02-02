import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MicroVolunteeringPhotoRotate from '~/components/MicroVolunteeringPhotoRotate.vue'

describe('MicroVolunteeringPhotoRotate', () => {
  function createWrapper(props = {}) {
    return mount(MicroVolunteeringPhotoRotate, {
      props: {
        photo: {
          path: '/test/photo.jpg',
          rotate: 0,
        },
        ...props,
      },
      global: {
        stubs: {
          'b-img': {
            template: '<img :src="src" :class="$attrs.class" class="b-img" />',
            props: ['src', 'lazy', 'fluid'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders image container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders image with photo path', () => {
      const wrapper = createWrapper({
        photo: { path: '/images/test.png', rotate: 0 },
      })
      expect(wrapper.find('img').attributes('src')).toBe('/images/test.png')
    })

    it('has clickme class on image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').classes()).toContain('clickme')
    })

    it('has square class on image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').classes()).toContain('square')
    })
  })

  describe('initial rotation', () => {
    it('applies rotate0 class when photo.rotate is 0', () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 0 },
      })
      expect(wrapper.find('img').classes()).toContain('rotate0')
    })

    it('applies rotate90 class when photo.rotate is 90', () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 90 },
      })
      expect(wrapper.find('img').classes()).toContain('rotate90')
    })

    it('applies rotate180 class when photo.rotate is 180', () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 180 },
      })
      expect(wrapper.find('img').classes()).toContain('rotate180')
    })

    it('applies rotate270 class when photo.rotate is 270', () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 270 },
      })
      expect(wrapper.find('img').classes()).toContain('rotate270')
    })
  })

  describe('rotation on click', () => {
    it('rotates from 0 to 90 on click', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 0 },
      })
      await wrapper.find('div').trigger('click')
      expect(wrapper.find('img').classes()).toContain('rotate90')
    })

    it('rotates from 90 to 180 on click', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 90 },
      })
      await wrapper.find('div').trigger('click')
      expect(wrapper.find('img').classes()).toContain('rotate180')
    })

    it('rotates from 180 to 270 on click', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 180 },
      })
      await wrapper.find('div').trigger('click')
      expect(wrapper.find('img').classes()).toContain('rotate270')
    })

    it('wraps from 270 to 0 on click', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 270 },
      })
      await wrapper.find('div').trigger('click')
      expect(wrapper.find('img').classes()).toContain('rotate0')
    })
  })

  describe('emits', () => {
    it('emits rotate event with new value on click', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 0 },
      })
      await wrapper.find('div').trigger('click')
      expect(wrapper.emitted('rotate')).toBeTruthy()
      expect(wrapper.emitted('rotate')[0]).toEqual([90])
    })

    it('emits 180 when rotating from 90', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 90 },
      })
      await wrapper.find('div').trigger('click')
      expect(wrapper.emitted('rotate')[0]).toEqual([180])
    })

    it('emits 0 when wrapping from 270', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 270 },
      })
      await wrapper.find('div').trigger('click')
      expect(wrapper.emitted('rotate')[0]).toEqual([0])
    })

    it('emits correct value after multiple clicks', async () => {
      const wrapper = createWrapper({
        photo: { path: '/test.jpg', rotate: 0 },
      })
      await wrapper.find('div').trigger('click')
      await wrapper.find('div').trigger('click')
      await wrapper.find('div').trigger('click')
      const emitted = wrapper.emitted('rotate')
      expect(emitted[0]).toEqual([90])
      expect(emitted[1]).toEqual([180])
      expect(emitted[2]).toEqual([270])
    })
  })

  describe('props', () => {
    it('requires photo prop', () => {
      const photo = { path: '/my/photo.jpg', rotate: 90 }
      const wrapper = createWrapper({ photo })
      expect(wrapper.props('photo')).toEqual(photo)
    })
  })
})
