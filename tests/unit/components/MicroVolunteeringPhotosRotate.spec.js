import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MicroVolunteeringPhotosRotate from '~/components/MicroVolunteeringPhotosRotate.vue'

const mockMicroVolunteeringStore = {
  respond: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => mockMicroVolunteeringStore,
}))

describe('MicroVolunteeringPhotosRotate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(MicroVolunteeringPhotosRotate, {
      props: {
        photos: [
          { id: 1, path: 'https://example.com/photo1.jpg' },
          { id: 2, path: 'https://example.com/photo2.jpg' },
          { id: 3, path: 'https://example.com/photo3.jpg' },
        ],
        ...props,
      },
      global: {
        stubs: {
          MicroVolunteeringPhotoRotate: {
            template:
              '<div class="photo-rotate" :data-id="photo.id" @click="$emit(\'rotate\', 90)" />',
            props: ['photo'],
            emits: ['rotate'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})">{{ label }}</button>',
            props: ['iconName', 'variant', 'size', 'label'],
            emits: ['handle'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders header text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe(
        'Click any photos that need rotating'
      )
    })

    it('renders photo rotate components for each photo', () => {
      const wrapper = createWrapper()
      const photos = wrapper.findAll('.photo-rotate')
      expect(photos).toHaveLength(3)
    })

    it('renders done button', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('.spin-button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('All photos look good')
    })

    it('renders layout grid', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.layout').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires photos array', () => {
      const wrapper = createWrapper({
        photos: [{ id: 99, path: 'test.jpg' }],
      })
      const photos = wrapper.findAll('.photo-rotate')
      expect(photos).toHaveLength(1)
      expect(photos[0].attributes('data-id')).toBe('99')
    })
  })

  describe('photo initialization', () => {
    it('initializes photos with rotate property set to 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.currentPhotos[0].rotate).toBe(0)
      expect(wrapper.vm.currentPhotos[1].rotate).toBe(0)
      expect(wrapper.vm.currentPhotos[2].rotate).toBe(0)
    })

    it('creates deep copy of photos to avoid mutations', () => {
      const originalPhotos = [{ id: 1, path: 'test.jpg' }]
      const wrapper = createWrapper({ photos: originalPhotos })

      wrapper.vm.currentPhotos[0].rotate = 90
      expect(originalPhotos[0].rotate).toBeUndefined()
    })
  })

  describe('rotate method', () => {
    it('updates photo rotation', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.photo-rotate').trigger('click')

      expect(wrapper.vm.currentPhotos[0].rotate).toBe(90)
    })

    it('only updates the clicked photo', async () => {
      const wrapper = createWrapper()
      const photos = wrapper.findAll('.photo-rotate')

      await photos[1].trigger('click')

      expect(wrapper.vm.currentPhotos[0].rotate).toBe(0)
      expect(wrapper.vm.currentPhotos[1].rotate).toBe(90)
      expect(wrapper.vm.currentPhotos[2].rotate).toBe(0)
    })
  })

  describe('done method', () => {
    it('calls store respond for each photo', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.spin-button').trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledTimes(3)
    })

    it('sends Approve response for unrotated photos', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.spin-button').trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        photoid: 1,
        response: 'Approve',
        deg: 0,
      })
    })

    it('sends Reject response for rotated photos', async () => {
      const wrapper = createWrapper()

      // Rotate first photo
      wrapper.vm.currentPhotos[0].rotate = 90

      await wrapper.find('.spin-button').trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        photoid: 1,
        response: 'Reject',
        deg: 90,
      })
    })

    it('emits done event after all responses', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.spin-button').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('done')).toHaveLength(1)
    })
  })

  describe('empty state', () => {
    it('handles empty photos array', () => {
      const wrapper = createWrapper({ photos: [] })
      expect(wrapper.findAll('.photo-rotate')).toHaveLength(0)
    })
  })

  describe('single photo', () => {
    it('handles single photo correctly', async () => {
      const wrapper = createWrapper({
        photos: [{ id: 1, path: 'single.jpg' }],
      })

      expect(wrapper.findAll('.photo-rotate')).toHaveLength(1)

      await wrapper.find('.spin-button').trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledTimes(1)
    })
  })
})
