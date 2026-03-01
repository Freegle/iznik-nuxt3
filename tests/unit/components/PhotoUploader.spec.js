import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import PhotoUploader from '~/components/PhotoUploader.vue'

// Mock defineAsyncComponent to return a stub for vuedraggable
vi.stubGlobal('defineAsyncComponent', (fn) => {
  return defineComponent({
    name: 'MockedDraggable',
    props: {
      modelValue: { type: Array, default: () => [] },
      itemKey: { type: [String, Function], default: null },
      animation: { type: Number, default: 0 },
      ghostClass: { type: String, default: '' },
    },
    emits: ['update:modelValue', 'start', 'end'],
    setup(props, { slots }) {
      return () => {
        const items = props.modelValue || []
        const children = items.map((element, index) => {
          if (slots.item) {
            return slots.item({ element, index })
          }
          return null
        })
        return h('div', { class: 'mocked-draggable thumbnail-strip' }, children)
      }
    },
  })
})

// Mock Capacitor Camera
vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn(),
    pickImages: vi.fn(),
  },
  CameraSource: {
    Camera: 'CAMERA',
    Photos: 'PHOTOS',
  },
  CameraResultType: {
    Uri: 'uri',
  },
}))

// Mock tus-js-client
const mockTusUpload = {
  abort: vi.fn(),
  start: vi.fn(),
  findPreviousUploads: vi.fn().mockResolvedValue([]),
  resumeFromPreviousUpload: vi.fn(),
  url: 'https://upload.example.com/files/abc123',
}

vi.mock('tus-js-client', () => ({
  Upload: vi.fn((file, options) => {
    // Store options for later use
    mockTusUpload._options = options
    return mockTusUpload
  }),
}))

// Mock Uppy and related
vi.mock('@uppy/core', () => ({
  default: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    close: vi.fn(),
    clear: vi.fn(),
    retryAll: vi.fn(),
  })),
}))

vi.mock('@uppy/vue', () => ({
  DashboardModal: {
    name: 'DashboardModal',
    template: '<div class="uppy-dashboard-modal" />',
    props: ['uppy', 'open', 'props'],
  },
}))

vi.mock('@uppy/tus', () => ({
  default: vi.fn(),
}))

vi.mock('@uppy/compressor', () => ({
  default: vi.fn(),
}))

// Mock image store
const mockImageStore = {
  post: vi.fn().mockResolvedValue({
    id: 1,
    url: '/images/uploaded.jpg',
    uid: 'uid123',
    info: { width: 800, height: 600 },
  }),
}

vi.mock('~/stores/image', () => ({
  useImageStore: () => mockImageStore,
}))

// Mock mobile store
const mockMobileStore = {
  isApp: false,
}

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

// Mock photo quality composable
const mockAnalyzePhotoQuality = vi.fn().mockResolvedValue({
  hasIssues: false,
  overallSeverity: 'none',
  warnings: [],
})

const mockGetQualityMessage = vi.fn().mockReturnValue({
  title: 'Photo looks good!',
  message: 'Your photo has good clarity and lighting.',
  severity: 'success',
})

vi.mock('~/composables/usePhotoQuality', () => ({
  analyzePhotoQuality: (...args) => mockAnalyzePhotoQuality(...args),
  getQualityMessage: (...args) => mockGetQualityMessage(...args),
}))

// Mock runtime config
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    TUS_UPLOADER: 'https://upload.example.com/files/',
  },
}))

// Mock fetch for blob conversion
global.fetch = vi.fn().mockResolvedValue({
  blob: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'image/jpeg' })),
})

describe('PhotoUploader', () => {
  let wrapper = null

  beforeEach(() => {
    vi.clearAllMocks()
    mockMobileStore.isApp = false
    mockAnalyzePhotoQuality.mockResolvedValue({
      hasIssues: false,
      overallSeverity: 'none',
      warnings: [],
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  function createWrapper(props = {}) {
    wrapper = mount(PhotoUploader, {
      props: {
        modelValue: [],
        ...props,
      },
      global: {
        stubs: {
          PhotoCard: {
            template:
              '<div class="photo-card" :data-ouruid="ouruid" :data-uploading="uploading" :data-error="error" :data-show-rotate="showRotate" @click="$emit(\'select\')"><button class="remove-btn" @click.stop="$emit(\'remove\')" /><button class="rotate-btn" @click.stop="$emit(\'rotate\')" /><button class="retry-btn" @click.stop="$emit(\'retry\')" /><button class="quality-btn" @click.stop="$emit(\'showQuality\')" /></div>',
            props: [
              'ouruid',
              'src',
              'selected',
              'uploading',
              'progress',
              'error',
              'qualityWarning',
              'showRotate',
              'externalmods',
            ],
            emits: ['remove', 'rotate', 'retry', 'showQuality', 'select'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'width'],
          },
          'b-modal': {
            template:
              '<div v-if="modelValue" class="b-modal" :data-title="title"><slot /><slot name="footer" /></div>',
            props: [
              'modelValue',
              'title',
              'hideFooter',
              'centered',
              'bodyClass',
            ],
            emits: ['update:modelValue', 'ok', 'cancel'],
          },
          'b-button': {
            template:
              '<button :class="[\'b-button\', variant]" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'disabled'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'size'],
          },
          Transition: {
            template: '<div class="transition"><slot /></div>',
          },
          DashboardModal: {
            template: '<div class="uppy-dashboard-modal" />',
            props: ['uppy', 'open', 'props'],
          },
        },
      },
    })
    return wrapper
  }

  describe('rendering', () => {
    it('renders the uploader container', () => {
      createWrapper()
      expect(wrapper.find('.app-photo-uploader').exists()).toBe(true)
    })

    it('shows empty state when no photos', () => {
      createWrapper()
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('shows camera icon in empty state', () => {
      createWrapper()
      expect(wrapper.find('.empty-icon').exists()).toBe(true)
      expect(wrapper.find('.empty-icon [data-icon="camera"]').exists()).toBe(
        true
      )
    })

    it('displays empty title', () => {
      createWrapper({ emptyTitle: 'Add your photos here' })
      expect(wrapper.find('.empty-title').text()).toBe('Add your photos here')
    })

    it('uses default empty title', () => {
      createWrapper()
      expect(wrapper.find('.empty-title').text()).toBe(
        'Add photos of your item'
      )
    })

    it('displays empty subtitle', () => {
      createWrapper({ emptySubtitle: 'Great photos help' })
      expect(wrapper.find('.empty-subtitle').text()).toBe('Great photos help')
    })

    it('uses default empty subtitle', () => {
      createWrapper()
      expect(wrapper.find('.empty-subtitle').text()).toContain(
        'better response'
      )
    })

    it('shows Add Photos button in empty state', () => {
      createWrapper()
      expect(wrapper.find('.add-photos-button').exists()).toBe(true)
      expect(wrapper.find('.add-photos-button').text()).toContain('Add Photos')
    })

    it('shows skip link', () => {
      createWrapper()
      expect(wrapper.find('.skip-link').exists()).toBe(true)
      expect(wrapper.find('.skip-link').text()).toContain('Skip')
    })

    it('hides empty state when photos exist', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1', path: '/photo1.jpg' }],
      })
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })
  })

  describe('props handling', () => {
    it('accepts modelValue prop', () => {
      const photos = [{ id: 1, ouruid: 'uid1' }]
      createWrapper({ modelValue: photos })
      expect(wrapper.props('modelValue')).toEqual(photos)
    })

    it('accepts type prop', () => {
      createWrapper({ type: 'User' })
      expect(wrapper.props('type')).toBe('User')
    })

    it('defaults type to Message', () => {
      createWrapper()
      expect(wrapper.props('type')).toBe('Message')
    })

    it('accepts maxPhotos prop', () => {
      createWrapper({ maxPhotos: 5 })
      expect(wrapper.props('maxPhotos')).toBe(5)
    })

    it('defaults maxPhotos to 10', () => {
      createWrapper()
      expect(wrapper.props('maxPhotos')).toBe(10)
    })

    it('accepts recognise prop', () => {
      createWrapper({ recognise: true })
      expect(wrapper.props('recognise')).toBe(true)
    })

    it('defaults recognise to false', () => {
      createWrapper()
      expect(wrapper.props('recognise')).toBe(false)
    })
  })

  describe('featured photo display', () => {
    it('shows featured photo when photos exist', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1', path: '/photo1.jpg' }],
      })
      expect(wrapper.find('.featured-photo').exists()).toBe(true)
    })

    it('renders PhotoCard for featured photo', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1', path: '/photo1.jpg' }],
      })
      expect(wrapper.find('.featured-photo .photo-card').exists()).toBe(true)
    })

    it('shows first photo as featured', () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1', path: '/photo1.jpg' },
          { id: 2, ouruid: 'uid2', path: '/photo2.jpg' },
        ],
      })
      expect(
        wrapper.find('.featured-photo .photo-card').attributes('data-ouruid')
      ).toBe('uid1')
    })

    it('shows rotate button when photo has id', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1', path: '/photo1.jpg' }],
      })
      expect(
        wrapper
          .find('.featured-photo .photo-card')
          .attributes('data-show-rotate')
      ).toBe('true')
    })

    it('hides rotate button when photo has no id', () => {
      createWrapper({
        modelValue: [{ tempId: 'temp-1', preview: 'blob://preview' }],
      })
      expect(
        wrapper
          .find('.featured-photo .photo-card')
          .attributes('data-show-rotate')
      ).toBe('false')
    })
  })

  describe('thumbnail carousel', () => {
    it('hides carousel with single photo', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1' }],
      })
      expect(wrapper.find('.thumbnail-carousel').exists()).toBe(false)
    })

    it('shows carousel with multiple photos', () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })
      expect(wrapper.find('.thumbnail-carousel').exists()).toBe(true)
    })

    it('renders carousel container with multiple photos', () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
          { id: 3, ouruid: 'uid3' },
        ],
      })
      // The carousel container exists with draggable inside
      expect(wrapper.find('.thumbnail-carousel').exists()).toBe(true)
      // Verify the component has access to all photos for draggable
      expect(wrapper.vm.photos.length).toBe(3)
    })

    it('has correct number of photos in carousel data', () => {
      const photos = [
        { id: 1, ouruid: 'uid1' },
        { id: 2, ouruid: 'uid2' },
        { id: 3, ouruid: 'uid3' },
      ]
      createWrapper({ modelValue: photos })
      // Verify the photos array is passed correctly
      expect(wrapper.props('modelValue').length).toBe(3)
    })
  })

  describe('add more photos', () => {
    it('shows Add More button when photos exist', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1' }],
      })
      expect(wrapper.find('.add-more-section').exists()).toBe(true)
    })

    it('hides Add More when at max photos', () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
        maxPhotos: 2,
      })
      expect(wrapper.find('.add-more-section').exists()).toBe(false)
    })

    it('shows Add More when below max', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1' }],
        maxPhotos: 3,
      })
      expect(wrapper.find('.add-more-section').exists()).toBe(true)
    })
  })

  describe('photo selection', () => {
    it('selectPhoto function reorders photos correctly', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
          { id: 3, ouruid: 'uid3' },
        ],
      })

      // Access component's internal method via vm
      // When selecting photo at index 2, it should move to front
      wrapper.vm.selectPhoto(2)
      await flushPromises()

      // Check emitted update
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      // The clicked photo (id: 3) should now be first
      expect(emitted[emitted.length - 1][0][0].id).toBe(3)
    })

    it('does not reorder when selecting first photo', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      // Get initial emission count
      const initialLength = wrapper.emitted('update:modelValue')?.length || 0

      // Selecting index 0 should not change order
      wrapper.vm.selectPhoto(0)
      await flushPromises()

      // Should still have same emission count (no change)
      const afterLength = wrapper.emitted('update:modelValue')?.length || 0
      expect(afterLength).toBe(initialLength)
    })
  })

  describe('photo removal', () => {
    it('emits update when photo removed', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      await wrapper.find('.featured-photo .remove-btn').trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      // Should have one photo left
      expect(emitted[emitted.length - 1][0].length).toBe(1)
      expect(emitted[emitted.length - 1][0][0].id).toBe(2)
    })

    it('removes photo by tempId when no id', async () => {
      createWrapper({
        modelValue: [
          { tempId: 'temp-1', preview: '/preview1.jpg' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      await wrapper.find('.featured-photo .remove-btn').trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted[emitted.length - 1][0].length).toBe(1)
      expect(emitted[emitted.length - 1][0][0].id).toBe(2)
    })
  })

  describe('photo rotation', () => {
    it('calls imageStore.post on rotate', async () => {
      createWrapper({
        modelValue: [{ id: 42, ouruid: 'uid1', path: '/photo1.jpg' }],
      })

      await wrapper.find('.featured-photo .rotate-btn').trigger('click')
      await flushPromises()

      expect(mockImageStore.post).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 42,
          rotate: 90,
          type: 'Message',
        })
      )
    })

    it('accumulates rotation degrees', async () => {
      createWrapper({
        modelValue: [
          {
            id: 42,
            ouruid: 'uid1',
            path: '/photo1.jpg',
            externalmods: { rotate: 90 },
          },
        ],
      })

      await wrapper.find('.featured-photo .rotate-btn').trigger('click')
      await flushPromises()

      expect(mockImageStore.post).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 42,
          rotate: 180,
        })
      )
    })

    it('wraps rotation at 360 degrees', async () => {
      createWrapper({
        modelValue: [
          {
            id: 42,
            ouruid: 'uid1',
            path: '/photo1.jpg',
            externalmods: { rotate: 270 },
          },
        ],
      })

      await wrapper.find('.featured-photo .rotate-btn').trigger('click')
      await flushPromises()

      expect(mockImageStore.post).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 42,
          rotate: 0,
        })
      )
    })

    it('does not rotate photo without id', async () => {
      createWrapper({
        modelValue: [{ tempId: 'temp-1', preview: '/preview.jpg' }],
      })

      await wrapper.find('.featured-photo .rotate-btn').trigger('click')
      await flushPromises()

      expect(mockImageStore.post).not.toHaveBeenCalled()
    })
  })

  describe('skip action', () => {
    it('emits skip when skip link clicked', async () => {
      createWrapper()
      await wrapper.find('.skip-link a').trigger('click')
      expect(wrapper.emitted('skip')).toBeTruthy()
    })
  })

  describe('web browser mode (non-app)', () => {
    beforeEach(() => {
      mockMobileStore.isApp = false
    })

    it('does not show source modal for web browsers', async () => {
      createWrapper()
      await wrapper.find('.add-photos-button').trigger('click')
      // In web mode, clicking opens Uppy modal, not source modal
      expect(wrapper.find('.source-options').exists()).toBe(false)
    })
  })

  describe('app mode', () => {
    beforeEach(() => {
      mockMobileStore.isApp = true
    })

    it('shows source modal in app mode', async () => {
      createWrapper()
      await wrapper.find('.add-photos-button').trigger('click')
      expect(wrapper.find('.source-options').exists()).toBe(true)
    })

    it('shows Take Photo option', async () => {
      createWrapper()
      await wrapper.find('.add-photos-button').trigger('click')
      const options = wrapper.findAll('.source-option')
      expect(options[0].text()).toContain('Take Photo')
    })

    it('shows Choose from Gallery option', async () => {
      createWrapper()
      await wrapper.find('.add-photos-button').trigger('click')
      const options = wrapper.findAll('.source-option')
      expect(options[1].text()).toContain('Gallery')
    })
  })

  describe('quality warning modal', () => {
    it('shows quality modal when showQuality emitted', async () => {
      createWrapper({
        modelValue: [
          {
            id: 1,
            ouruid: 'uid1',
            qualityWarning: {
              severity: 'warning',
              title: 'Photo could be better',
              message: 'The photo appears blurry',
            },
          },
        ],
      })

      await wrapper.find('.featured-photo .quality-btn').trigger('click')

      // Modal should now be visible
      const modals = wrapper.findAll('.b-modal')
      const qualityModal = modals.find(
        (m) => m.attributes('data-title') === 'Photo could be better'
      )
      expect(qualityModal).toBeTruthy()
    })
  })

  describe('upload retry', () => {
    it('retry button exists on photo cards', () => {
      createWrapper({
        modelValue: [
          {
            tempId: 'temp-1',
            preview: '/preview.jpg',
            error: true,
            uploading: false,
          },
        ],
      })

      expect(wrapper.find('.featured-photo .retry-btn').exists()).toBe(true)
    })
  })

  describe('drag and drop', () => {
    it('has dragenter handler on container', () => {
      createWrapper()
      const container = wrapper.find('.app-photo-uploader')
      // The component listens for dragenter
      expect(container.exists()).toBe(true)
    })

    it('onDragStart suppresses modelValue sync', () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
          { id: 3, ouruid: 'uid3' },
        ],
      })

      wrapper.vm.onDragStart()

      expect(wrapper.vm.dragging).toBe(true)
      expect(wrapper.vm.suppressModelValueSync).toBe(true)
    })

    it('onDragEnd re-enables modelValue sync after nextTick', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      wrapper.vm.onDragStart()
      expect(wrapper.vm.suppressModelValueSync).toBe(true)

      wrapper.vm.onDragEnd()
      expect(wrapper.vm.dragging).toBe(false)
      // Still suppressed immediately after onDragEnd
      expect(wrapper.vm.suppressModelValueSync).toBe(true)

      // After nextTick, suppression is lifted
      await flushPromises()
      expect(wrapper.vm.suppressModelValueSync).toBe(false)
    })

    it('does not reset photos from modelValue during drag', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
          { id: 3, ouruid: 'uid3' },
        ],
      })

      // Simulate drag start
      wrapper.vm.onDragStart()

      // Simulate vuedraggable reordering the array (swap index 1 and 2)
      const reordered = [
        wrapper.vm.photos[0],
        wrapper.vm.photos[2],
        wrapper.vm.photos[1],
      ]
      wrapper.vm.photos = reordered

      // Simulate parent updating modelValue back (this is the round-trip
      // that previously caused the revert bug)
      await wrapper.setProps({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 3, ouruid: 'uid3' },
          { id: 2, ouruid: 'uid2' },
        ],
      })
      await flushPromises()

      // Photos should keep the reordered state, NOT snap back
      expect(wrapper.vm.photos[0].id).toBe(1)
      expect(wrapper.vm.photos[1].id).toBe(3)
      expect(wrapper.vm.photos[2].id).toBe(2)
    })

    it('resumes modelValue sync after drag completes', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      // Simulate full drag cycle
      wrapper.vm.onDragStart()
      wrapper.vm.onDragEnd()
      await flushPromises()

      // Sync should be re-enabled now
      expect(wrapper.vm.suppressModelValueSync).toBe(false)

      // Simulate parent adding a new photo externally
      await wrapper.setProps({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
          { id: 99, ouruid: 'uid99' },
        ],
      })
      await flushPromises()

      // Should sync the new photo from parent
      expect(wrapper.vm.photos.length).toBe(3)
      expect(wrapper.vm.photos[2].id).toBe(99)
    })
  })

  describe('v-model sync', () => {
    it('emits update:modelValue when photos change', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      // Remove a photo
      await wrapper.find('.featured-photo .remove-btn').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('syncs from parent when modelValue changes', async () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1' }],
      })

      // Simulate parent updating modelValue
      await wrapper.setProps({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      // Component should now show 2 photos (featured + thumbnail carousel)
      expect(wrapper.find('.thumbnail-carousel').exists()).toBe(true)
    })
  })

  describe('uploading state', () => {
    it('passes uploading prop to PhotoCard', () => {
      createWrapper({
        modelValue: [
          {
            tempId: 'temp-1',
            preview: '/preview.jpg',
            uploading: true,
            progress: 25,
          },
        ],
      })

      const photoCard = wrapper.find('.featured-photo .photo-card')
      expect(photoCard.attributes('data-uploading')).toBe('true')
    })

    it('passes error prop to PhotoCard', () => {
      createWrapper({
        modelValue: [
          {
            tempId: 'temp-1',
            preview: '/preview.jpg',
            error: true,
            uploading: false,
          },
        ],
      })

      const photoCard = wrapper.find('.featured-photo .photo-card')
      expect(photoCard.attributes('data-error')).toBe('true')
    })
  })

  describe('image sources in PhotoCard', () => {
    it('uses ouruid for server images', () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'server-uid' }],
      })

      expect(
        wrapper.find('.featured-photo .photo-card').attributes('data-ouruid')
      ).toBe('server-uid')
    })

    it('uses preview for local images', () => {
      createWrapper({
        modelValue: [{ tempId: 'temp-1', preview: 'blob://local-preview' }],
      })

      // PhotoCard receives the preview as src
      expect(wrapper.find('.featured-photo .photo-card').exists()).toBe(true)
    })
  })

  describe('thumbnails rendering logic', () => {
    it('has carousel rendered when multiple photos exist', () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      // Verify the carousel renders with photos
      expect(wrapper.find('.thumbnail-carousel').exists()).toBe(true)
      // The component has access to both photos
      expect(wrapper.vm.photos.length).toBe(2)
    })

    it('passes photo data through draggable slots', () => {
      const photos = [
        { id: 1, ouruid: 'uid1' },
        { tempId: 'temp-1', preview: '/preview.jpg' },
      ]
      createWrapper({ modelValue: photos })

      // Verify the photos are accessible in the component
      expect(wrapper.vm.photos.length).toBe(2)
      expect(wrapper.vm.photos[0].ouruid).toBe('uid1')
      expect(wrapper.vm.photos[1].preview).toBe('/preview.jpg')
    })
  })

  describe('computed properties', () => {
    it('selectedPhoto returns first photo when selectedIndex is 0', () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      expect(wrapper.vm.selectedPhoto).not.toBeNull()
      expect(wrapper.vm.selectedPhoto.id).toBe(1)
    })

    it('selectedPhoto returns null when no photos', () => {
      createWrapper({ modelValue: [] })
      expect(wrapper.vm.selectedPhoto).toBeNull()
    })

    it('isApp is false when not in app mode', () => {
      mockMobileStore.isApp = false
      createWrapper()
      expect(wrapper.vm.isApp).toBe(false)
    })

    it('isApp is true when in app mode', () => {
      mockMobileStore.isApp = true
      createWrapper()
      expect(wrapper.vm.isApp).toBe(true)
    })
  })

  describe('component methods', () => {
    it('openPhotoOptions shows source modal in app mode', async () => {
      mockMobileStore.isApp = true
      createWrapper()

      wrapper.vm.openPhotoOptions()
      await flushPromises()

      expect(wrapper.vm.showSourceModal).toBe(true)
    })

    it('removePhoto removes by id', async () => {
      createWrapper({
        modelValue: [
          { id: 1, ouruid: 'uid1' },
          { id: 2, ouruid: 'uid2' },
        ],
      })

      wrapper.vm.removePhoto({ id: 1 })
      await flushPromises()

      expect(wrapper.vm.photos.length).toBe(1)
      expect(wrapper.vm.photos[0].id).toBe(2)
    })

    it('removePhoto removes by tempId', async () => {
      createWrapper({
        modelValue: [
          { tempId: 'temp-1', preview: '/preview1.jpg' },
          { tempId: 'temp-2', preview: '/preview2.jpg' },
        ],
      })

      wrapper.vm.removePhoto({ tempId: 'temp-1' })
      await flushPromises()

      expect(wrapper.vm.photos.length).toBe(1)
      expect(wrapper.vm.photos[0].tempId).toBe('temp-2')
    })
  })

  describe('quality warning handling', () => {
    it('showQualityWarning sets up modal correctly', async () => {
      createWrapper({
        modelValue: [
          {
            id: 1,
            ouruid: 'uid1',
            qualityWarning: {
              severity: 'critical',
              title: 'Poor Quality',
              message: 'Photo is too blurry',
            },
          },
        ],
      })

      wrapper.vm.showQualityWarning(wrapper.vm.photos[0])
      await flushPromises()

      expect(wrapper.vm.showQualityModal).toBe(true)
      expect(wrapper.vm.qualityModalTitle).toBe('Poor Quality')
      expect(wrapper.vm.qualityModalMessage).toBe('Photo is too blurry')
    })

    it('showQualityWarning does nothing without warning', async () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1' }],
      })

      wrapper.vm.showQualityWarning(wrapper.vm.photos[0])
      await flushPromises()

      expect(wrapper.vm.showQualityModal).toBe(false)
    })

    it('continueWithPhoto closes modal', async () => {
      createWrapper()
      wrapper.vm.showQualityModal = true
      wrapper.vm.pendingPhoto = { preview: '/test.jpg', uploading: false }

      wrapper.vm.continueWithPhoto()
      await flushPromises()

      expect(wrapper.vm.showQualityModal).toBe(false)
      expect(wrapper.vm.pendingPhoto).toBeNull()
    })

    it('retakePhoto removes pending photo and reopens options', async () => {
      mockMobileStore.isApp = true
      createWrapper({
        modelValue: [{ tempId: 'temp-1', preview: '/preview.jpg' }],
      })

      wrapper.vm.pendingPhoto = wrapper.vm.photos[0]
      wrapper.vm.showQualityModal = true

      wrapper.vm.retakePhoto()
      await flushPromises()

      expect(wrapper.vm.showQualityModal).toBe(false)
      expect(wrapper.vm.photos.length).toBe(0)
      expect(wrapper.vm.showSourceModal).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty modelValue', () => {
      createWrapper({ modelValue: [] })
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.featured-photo').exists()).toBe(false)
    })

    it('handles photo with only path', () => {
      createWrapper({
        modelValue: [{ id: 1, path: '/images/photo.jpg' }],
      })
      expect(wrapper.find('.featured-photo').exists()).toBe(true)
    })

    it('handles photo with only paththumb', () => {
      createWrapper({
        modelValue: [{ id: 1, paththumb: '/images/thumb.jpg' }],
      })
      expect(wrapper.find('.featured-photo').exists()).toBe(true)
    })

    it('handles externalmods being undefined', async () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1' }],
      })

      // Should not throw when rotating
      wrapper.vm.rotatePhoto(wrapper.vm.photos[0], 90)
      await flushPromises()

      expect(wrapper.vm.photos[0].externalmods.rotate).toBe(90)
    })

    it('handles rotation with no externalmods object', async () => {
      createWrapper({
        modelValue: [{ id: 1, ouruid: 'uid1' }],
      })

      await wrapper.find('.featured-photo .rotate-btn').trigger('click')
      await flushPromises()

      // Should create externalmods object
      expect(wrapper.vm.photos[0].externalmods).toBeDefined()
      expect(wrapper.vm.photos[0].externalmods.rotate).toBe(90)
    })
  })

  describe('uppy integration (web mode)', () => {
    beforeEach(() => {
      mockMobileStore.isApp = false
    })

    it('initializes uppy on mount in web mode', async () => {
      createWrapper()
      await flushPromises()

      expect(wrapper.vm.uppy).not.toBeNull()
    })

    it('opens uppy modal when add photos clicked in web mode', async () => {
      createWrapper()
      await flushPromises()

      await wrapper.find('.add-photos-button').trigger('click')

      expect(wrapper.vm.uppyModalOpen).toBe(true)
    })

    it('closeUppyModal sets uppyModalOpen to false', () => {
      createWrapper()

      wrapper.vm.uppyModalOpen = true
      wrapper.vm.closeUppyModal()

      expect(wrapper.vm.uppyModalOpen).toBe(false)
    })
  })

  describe('retry upload', () => {
    it('retryUpload resets error and uploads again', () => {
      createWrapper({
        modelValue: [
          {
            tempId: 'temp-1',
            preview: 'blob://test',
            error: true,
            uploading: false,
            progress: 0,
          },
        ],
      })

      // Call retry on the photo
      wrapper.vm.retryUpload(wrapper.vm.photos[0])

      expect(wrapper.vm.photos[0].error).toBe(false)
      expect(wrapper.vm.photos[0].uploading).toBe(true)
    })

    it('retryUpload does nothing without preview', () => {
      createWrapper({
        modelValue: [{ id: 1, error: true, uploading: false }],
      })

      wrapper.vm.retryUpload(wrapper.vm.photos[0])

      // Should not change state since there's no preview to retry
      expect(wrapper.vm.photos[0].error).toBe(true)
    })
  })

  describe('drag enter handling', () => {
    beforeEach(() => {
      mockMobileStore.isApp = false
    })

    it('onDragEnter opens uppy in web mode', async () => {
      createWrapper()
      await flushPromises()

      wrapper.vm.onDragEnter()

      expect(wrapper.vm.uppyModalOpen).toBe(true)
    })

    it('onDragEnter does nothing in app mode', async () => {
      mockMobileStore.isApp = true
      createWrapper()
      await flushPromises()

      wrapper.vm.onDragEnter()

      expect(wrapper.vm.uppyModalOpen).toBe(false)
    })
  })
})
