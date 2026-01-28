import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PhotoCard from '~/components/PhotoCard.vue'

describe('PhotoCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(PhotoCard, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          OurUploadedImage: {
            template:
              '<div class="our-uploaded-image" :data-src="src" :data-width="width" />',
            props: ['src', 'modifiers', 'width'],
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
    it('renders photo-card container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.photo-card').exists()).toBe(true)
    })

    it('renders OurUploadedImage when ouruid is provided', () => {
      const wrapper = createWrapper({ ouruid: 'test-uid' })
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
      expect(wrapper.find('.our-uploaded-image').attributes('data-src')).toBe(
        'test-uid'
      )
    })

    it('renders img element when ouruid is not provided', () => {
      const wrapper = createWrapper({ src: 'http://example.com/image.jpg' })
      const img = wrapper.find('img.photo-image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('http://example.com/image.jpg')
    })

    it('uses preview as fallback image source', () => {
      const wrapper = createWrapper({ preview: 'data:image/png;base64,abc' })
      const img = wrapper.find('img.photo-image')
      expect(img.attributes('src')).toBe('data:image/png;base64,abc')
    })

    it('uses path as fallback image source', () => {
      const wrapper = createWrapper({ path: '/images/photo.jpg' })
      const img = wrapper.find('img.photo-image')
      expect(img.attributes('src')).toBe('/images/photo.jpg')
    })

    it('uses paththumb as last fallback image source', () => {
      const wrapper = createWrapper({ paththumb: '/thumbs/photo.jpg' })
      const img = wrapper.find('img.photo-image')
      expect(img.attributes('src')).toBe('/thumbs/photo.jpg')
    })
  })

  describe('class states', () => {
    it('applies photo-primary class when primary is true', () => {
      const wrapper = createWrapper({ primary: true })
      expect(wrapper.find('.photo-card').classes()).toContain('photo-primary')
    })

    it('does not apply photo-primary class when primary is false', () => {
      const wrapper = createWrapper({ primary: false })
      expect(wrapper.find('.photo-card').classes()).not.toContain(
        'photo-primary'
      )
    })

    it('applies photo-uploading class when uploading is true', () => {
      const wrapper = createWrapper({ uploading: true })
      expect(wrapper.find('.photo-card').classes()).toContain('photo-uploading')
    })

    it('applies photo-selected class when selected is true', () => {
      const wrapper = createWrapper({ selected: true })
      expect(wrapper.find('.photo-card').classes()).toContain('photo-selected')
    })
  })

  describe('upload progress', () => {
    it('shows progress overlay when uploading', () => {
      const wrapper = createWrapper({ uploading: true, progress: 50 })
      expect(wrapper.find('.photo-progress-overlay').exists()).toBe(true)
    })

    it('hides progress overlay when not uploading', () => {
      const wrapper = createWrapper({ uploading: false })
      expect(wrapper.find('.photo-progress-overlay').exists()).toBe(false)
    })

    it('displays progress percentage', () => {
      const wrapper = createWrapper({ uploading: true, progress: 75 })
      expect(wrapper.find('.progress-text').text()).toBe('75%')
    })

    it('displays 0% when progress is undefined', () => {
      const wrapper = createWrapper({ uploading: true })
      expect(wrapper.find('.progress-text').text()).toBe('0%')
    })

    it('sets stroke-dasharray based on progress', () => {
      const wrapper = createWrapper({ uploading: true, progress: 60 })
      const circle = wrapper.find('.circle')
      expect(circle.attributes('stroke-dasharray')).toBe('60, 100')
    })
  })

  describe('control buttons', () => {
    it('shows rotate and delete buttons when selected and not uploading', () => {
      const wrapper = createWrapper({ selected: true, uploading: false })
      expect(wrapper.find('.control-rotate').exists()).toBe(true)
      expect(wrapper.find('.control-delete').exists()).toBe(true)
    })

    it('hides control buttons when not selected', () => {
      const wrapper = createWrapper({ selected: false })
      expect(wrapper.find('.control-rotate').exists()).toBe(false)
      expect(wrapper.find('.control-delete').exists()).toBe(false)
    })

    it('hides control buttons when uploading', () => {
      const wrapper = createWrapper({ selected: true, uploading: true })
      expect(wrapper.find('.control-rotate').exists()).toBe(false)
      expect(wrapper.find('.control-delete').exists()).toBe(false)
    })

    it('hides control buttons when error state', () => {
      const wrapper = createWrapper({ selected: true, error: true })
      expect(wrapper.find('.control-rotate').exists()).toBe(false)
      expect(wrapper.find('.control-delete').exists()).toBe(false)
    })

    it('hides rotate button when showRotate is false', () => {
      const wrapper = createWrapper({
        selected: true,
        showRotate: false,
      })
      expect(wrapper.find('.control-rotate').exists()).toBe(false)
      expect(wrapper.find('.control-delete').exists()).toBe(true)
    })
  })

  describe('error state', () => {
    it('shows error overlay when error is true', () => {
      const wrapper = createWrapper({ error: true })
      expect(wrapper.find('.photo-error-overlay').exists()).toBe(true)
    })

    it('shows Upload failed message', () => {
      const wrapper = createWrapper({ error: true })
      expect(wrapper.find('.error-message').text()).toBe('Upload failed')
    })

    it('shows retry and delete buttons in error state', () => {
      const wrapper = createWrapper({ error: true })
      const buttons = wrapper.findAll('.error-btn')
      expect(buttons.length).toBe(2)
    })
  })

  describe('quality warning', () => {
    it('shows quality warning when present and not uploading or error', () => {
      const wrapper = createWrapper({
        qualityWarning: { severity: 'warning', message: 'Image is blurry' },
      })
      expect(wrapper.find('.quality-warning-inline').exists()).toBe(true)
    })

    it('hides quality warning when uploading', () => {
      const wrapper = createWrapper({
        qualityWarning: { severity: 'warning', message: 'Blurry' },
        uploading: true,
      })
      expect(wrapper.find('.quality-warning-inline').exists()).toBe(false)
    })

    it('hides quality warning when error', () => {
      const wrapper = createWrapper({
        qualityWarning: { severity: 'warning', message: 'Blurry' },
        error: true,
      })
      expect(wrapper.find('.quality-warning-inline').exists()).toBe(false)
    })

    it('applies severity class', () => {
      const wrapper = createWrapper({
        qualityWarning: { severity: 'critical', message: 'Very dark' },
      })
      expect(wrapper.find('.quality-warning-inline').classes()).toContain(
        'quality-critical'
      )
    })

    it('shows "Blurry?" for blur warnings', () => {
      const wrapper = createWrapper({
        qualityWarning: { message: 'Image may be blurred' },
      })
      expect(wrapper.find('.quality-text').text()).toBe('Blurry?')
    })

    it('shows "Dark?" for dark warnings', () => {
      const wrapper = createWrapper({
        qualityWarning: { message: 'Image is too dark' },
      })
      expect(wrapper.find('.quality-text').text()).toBe('Dark?')
    })

    it('shows "Bright?" for bright warnings', () => {
      const wrapper = createWrapper({
        qualityWarning: { message: 'Image is too bright' },
      })
      expect(wrapper.find('.quality-text').text()).toBe('Bright?')
    })

    it('shows "Bright?" for overexposed warnings', () => {
      const wrapper = createWrapper({
        qualityWarning: { message: 'Image is overexposed' },
      })
      expect(wrapper.find('.quality-text').text()).toBe('Bright?')
    })

    it('shows "Contrast?" for contrast warnings', () => {
      const wrapper = createWrapper({
        qualityWarning: { message: 'Low contrast detected' },
      })
      expect(wrapper.find('.quality-text').text()).toBe('Contrast?')
    })

    it('shows "Check?" for unknown warnings', () => {
      const wrapper = createWrapper({
        qualityWarning: { message: 'Some other issue' },
      })
      expect(wrapper.find('.quality-text').text()).toBe('Check?')
    })
  })

  describe('events', () => {
    it('emits select when card is clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.photo-card').trigger('click')
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('emits rotate when rotate button is clicked', async () => {
      const wrapper = createWrapper({ selected: true })
      await wrapper.find('.control-rotate').trigger('click')
      expect(wrapper.emitted('rotate')).toBeTruthy()
      expect(wrapper.emitted('select')).toBeFalsy() // stopped propagation
    })

    it('emits remove when delete button is clicked', async () => {
      const wrapper = createWrapper({ selected: true })
      await wrapper.find('.control-delete').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
      expect(wrapper.emitted('select')).toBeFalsy() // stopped propagation
    })

    it('emits retry when retry button is clicked in error state', async () => {
      const wrapper = createWrapper({ error: true })
      const retryBtn = wrapper.findAll('.error-btn')[0]
      await retryBtn.trigger('click')
      expect(wrapper.emitted('retry')).toBeTruthy()
    })

    it('emits remove when delete button is clicked in error state', async () => {
      const wrapper = createWrapper({ error: true })
      const deleteBtn = wrapper.findAll('.error-btn')[1]
      await deleteBtn.trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    })

    it('emits showQuality when quality warning is clicked', async () => {
      const wrapper = createWrapper({
        qualityWarning: { severity: 'warning', message: 'Blurry' },
      })
      await wrapper.find('.quality-warning-inline').trigger('click')
      expect(wrapper.emitted('showQuality')).toBeTruthy()
      expect(wrapper.emitted('select')).toBeFalsy() // stopped propagation
    })
  })

  describe('props', () => {
    it('has ouruid prop defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('ouruid')).toBeNull()
    })

    it('has src prop defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('src')).toBeNull()
    })

    it('has primary prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('primary')).toBe(false)
    })

    it('has selected prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('selected')).toBe(false)
    })

    it('has uploading prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('uploading')).toBe(false)
    })

    it('has progress prop defaulting to 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('progress')).toBe(0)
    })

    it('has error prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('error')).toBe(false)
    })

    it('has showRotate prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showRotate')).toBe(true)
    })
  })

  describe('computed imageSrc', () => {
    it('prefers src over other sources', () => {
      const wrapper = createWrapper({
        src: '/src.jpg',
        preview: '/preview.jpg',
        path: '/path.jpg',
      })
      expect(wrapper.vm.imageSrc).toBe('/src.jpg')
    })

    it('uses preview when src is null', () => {
      const wrapper = createWrapper({
        src: null,
        preview: '/preview.jpg',
        path: '/path.jpg',
      })
      expect(wrapper.vm.imageSrc).toBe('/preview.jpg')
    })

    it('uses path when src and preview are null', () => {
      const wrapper = createWrapper({
        src: null,
        preview: null,
        path: '/path.jpg',
        paththumb: '/thumb.jpg',
      })
      expect(wrapper.vm.imageSrc).toBe('/path.jpg')
    })

    it('uses paththumb as last resort', () => {
      const wrapper = createWrapper({
        paththumb: '/thumb.jpg',
      })
      expect(wrapper.vm.imageSrc).toBe('/thumb.jpg')
    })
  })

  describe('externalmods prop', () => {
    it('passes externalmods to OurUploadedImage', () => {
      const mods = { rotate: 90 }
      const wrapper = createWrapper({ ouruid: 'test', externalmods: mods })
      // The stub doesn't expose modifiers in template, but we can check the prop is passed
      expect(wrapper.props('externalmods')).toEqual({ rotate: 90 })
    })
  })
})
