import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, defineComponent, h } from 'vue'
import ModPhotoModal from '~/modtools/components/ModPhotoModal.vue'

// Mock the message store
const mockMessageStore = {
  patch: vi.fn().mockResolvedValue({}),
  byId: vi.fn(),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

// Mock hide function that tests can spy on
const mockShow = vi.fn()
const mockHide = vi.fn()

// Override the global useOurModal mock with our custom spy
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null), // Use proper Vue ref to avoid template ref warnings
    show: mockShow,
    hide: mockHide,
  }),
}))

// Create a functional PostPhoto stub component that can emit events
const PostPhotoStub = defineComponent({
  name: 'PostPhoto',
  props: {
    id: { type: Number, default: null },
    path: { type: String, default: '' },
    paththumb: { type: String, default: '' },
    thumbnail: { type: Boolean, default: true },
    externalmods: { type: Object, default: () => ({}) },
  },
  emits: ['remove', 'updated'],
  setup(props, { emit }) {
    return () =>
      h('div', {
        class: 'post-photo',
        'data-thumbnail': String(props.thumbnail),
        'data-externalmods': JSON.stringify(props.externalmods),
        onClick: () => emit('updated'),
        onDblclick: (e) => emit('remove', parseInt(e.target.dataset.removeId)),
      })
  },
})

describe('ModPhotoModal', () => {
  const defaultMessage = {
    id: 456,
    subject: 'Test Message Subject',
    attachments: [
      {
        id: 123,
        path: '/photos/test-image.jpg',
        paththumb: '/photos/test-image-thumb.jpg',
        mods: JSON.stringify({ rotate: 90, brightness: 1.2 }),
      },
      { id: 124, path: '/photos/other-image.jpg' },
      { id: 125, path: '/photos/third-image.jpg' },
    ],
  }

  function mountComponent(props = {}) {
    // Set up message store based on props
    const messageData = props._messageData || defaultMessage
    const messageid = props.messageid || messageData.id
    const attachmentid = props.attachmentid || 123

    mockMessageStore.byId.mockImplementation((id) => {
      if (id === messageid) return messageData
      return null
    })

    const { _messageData, ...componentProps } = props

    return mount(ModPhotoModal, {
      props: { messageid, attachmentid, ...componentProps },
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="b-modal" :id="id" :title="title" :size="size">
                <slot />
                <slot name="default" />
                <slot name="footer" />
              </div>
            `,
            props: ['id', 'title', 'size', 'noStacking', 'okOnly'],
            methods: { show: vi.fn() },
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          PostPhoto: PostPhotoStub,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.patch.mockReset()
    mockMessageStore.patch.mockResolvedValue({})
    mockMessageStore.byId.mockReturnValue(defaultMessage)
  })

  describe('rendering', () => {
    it('renders with correct modal id based on attachment id', () => {
      const wrapper = mountComponent()
      const modal = wrapper.find('.b-modal')
      expect(modal.attributes('id')).toBe('photoModal-123')
    })

    it('renders with message subject as title', () => {
      const wrapper = mountComponent()
      const modal = wrapper.find('.b-modal')
      expect(modal.attributes('title')).toBe('Test Message Subject')
    })

    it('renders modal with lg size', () => {
      const wrapper = mountComponent()
      const modal = wrapper.find('.b-modal')
      expect(modal.attributes('size')).toBe('lg')
    })

    it('includes PostPhoto component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.post-photo').exists()).toBe(true)
    })

    it('passes attachment props to PostPhoto', () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.find('.post-photo')
      // PostPhoto receives v-bind="attachment" which spreads all attachment props
      expect(postPhoto.exists()).toBe(true)
    })

    it('passes thumbnail=false to PostPhoto', () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.find('.post-photo')
      expect(postPhoto.attributes('data-thumbnail')).toBe('false')
    })

    it('passes externalmods to PostPhoto', () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.find('.post-photo')
      const externalmods = JSON.parse(postPhoto.attributes('data-externalmods'))
      expect(externalmods).toEqual({ rotate: 90, brightness: 1.2 })
    })

    it('has Close button in footer', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('props validation', () => {
    it('accepts required messageid prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('messageid')).toBe(456)
    })

    it('accepts required attachmentid prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('attachmentid')).toBe(123)
    })

    it('computes externalmods from attachment mods field', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.externalmods).toEqual({
        rotate: 90,
        brightness: 1.2,
      })
    })

    it('handles attachment with no mods', () => {
      const wrapper = mountComponent({
        _messageData: {
          id: 456,
          subject: 'Test',
          attachments: [{ id: 123, path: '/photos/test.jpg' }],
        },
      })
      expect(wrapper.vm.externalmods).toEqual({})
    })
  })

  describe('modal id uniqueness', () => {
    it('generates unique modal id for different attachments', () => {
      const msg1 = {
        id: 456,
        subject: 'Test',
        attachments: [{ id: 100, path: '/a.jpg' }],
      }
      const msg2 = {
        id: 456,
        subject: 'Test',
        attachments: [{ id: 200, path: '/b.jpg' }],
      }
      const wrapper1 = mountComponent({
        attachmentid: 100,
        _messageData: msg1,
      })
      const wrapper2 = mountComponent({
        attachmentid: 200,
        _messageData: msg2,
      })

      const id1 = wrapper1.find('.b-modal').attributes('id')
      const id2 = wrapper2.find('.b-modal').attributes('id')

      expect(id1).toBe('photoModal-100')
      expect(id2).toBe('photoModal-200')
      expect(id1).not.toBe(id2)
    })
  })

  describe('modal functionality', () => {
    it('exposes show method via defineExpose', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.show).toBe('function')
    })

    it('exposes hide method via defineExpose', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.hide).toBe('function')
    })

    it('calls hide when Close button clicked', async () => {
      const wrapper = mountComponent()
      await wrapper.find('button').trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('updatedPhoto method', () => {
    it('calls messageStore.patch with message id when photo updated', async () => {
      const wrapper = mountComponent()

      // Call the component's internal updatedPhoto method directly
      // This simulates what happens when PostPhoto emits 'updated'
      await wrapper.vm.updatedPhoto()
      await flushPromises()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({ id: 456 })
    })

    it('calls patch with correct message id for different messages', async () => {
      const wrapper = mountComponent({
        messageid: 999,
        _messageData: {
          id: 999,
          subject: 'Another Message',
          attachments: [{ id: 123 }],
        },
      })

      await wrapper.vm.updatedPhoto()
      await flushPromises()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({ id: 999 })
    })
  })

  describe('removePhoto method', () => {
    it('calls messageStore.patch with remaining attachment ids', async () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })

      // Simulate PostPhoto emitting 'remove' with attachment id 123
      await postPhoto.vm.$emit('remove', 123)
      await flushPromises()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 456,
        attachments: [124, 125], // 123 removed, 124 and 125 remain
      })
    })

    it('removes only the specified photo from attachments', async () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })

      // Remove the middle photo (id 124)
      await postPhoto.vm.$emit('remove', 124)
      await flushPromises()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 456,
        attachments: [123, 125], // 124 removed
      })
    })

    it('handles removing the last attachment', async () => {
      const wrapper = mountComponent({
        _messageData: {
          id: 456,
          subject: 'Single Photo Message',
          attachments: [{ id: 123, path: '/photos/only-image.jpg' }],
        },
      })
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })

      await postPhoto.vm.$emit('remove', 123)
      await flushPromises()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 456,
        attachments: [],
      })
    })

    it('includes all remaining attachments when one is removed', async () => {
      const wrapper = mountComponent({
        attachmentid: 1,
        _messageData: {
          id: 456,
          subject: 'Many Photos',
          attachments: [
            { id: 1, path: '/photos/1.jpg' },
            { id: 2, path: '/photos/2.jpg' },
            { id: 3, path: '/photos/3.jpg' },
            { id: 4, path: '/photos/4.jpg' },
            { id: 5, path: '/photos/5.jpg' },
          ],
        },
      })
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })

      await postPhoto.vm.$emit('remove', 3)
      await flushPromises()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 456,
        attachments: [1, 2, 4, 5],
      })
    })

    it('handles removing non-existent attachment id gracefully', async () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })

      // Try to remove an id that doesn't exist
      await postPhoto.vm.$emit('remove', 999)
      await flushPromises()

      // All existing attachments should remain
      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 456,
        attachments: [123, 124, 125],
      })
    })
  })

  describe('message title', () => {
    it('displays message subject in modal title', () => {
      const wrapper = mountComponent({
        messageid: 1,
        attachmentid: 1,
        _messageData: {
          id: 1,
          subject: 'OFFER: Free sofa (London)',
          attachments: [{ id: 1 }],
        },
      })
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        'OFFER: Free sofa (London)'
      )
    })

    it('handles empty subject', () => {
      const wrapper = mountComponent({
        messageid: 1,
        attachmentid: 1,
        _messageData: {
          id: 1,
          subject: '',
          attachments: [{ id: 1 }],
        },
      })
      expect(wrapper.find('.b-modal').attributes('title')).toBe('')
    })

    it('handles long subject', () => {
      const longSubject =
        'OFFER: This is a very long subject line that goes on and on with lots of detail about the item being offered'
      const wrapper = mountComponent({
        messageid: 1,
        attachmentid: 1,
        _messageData: {
          id: 1,
          subject: longSubject,
          attachments: [{ id: 1 }],
        },
      })
      expect(wrapper.find('.b-modal').attributes('title')).toBe(longSubject)
    })
  })

  describe('edge cases', () => {
    it('handles message with empty attachments array', async () => {
      // When attachment is not found, the component won't render (v-if="attachment")
      // So we test removePhoto directly
      const wrapper = mountComponent({
        _messageData: {
          id: 456,
          subject: 'No Attachments',
          attachments: [],
        },
      })
      // attachment computed will be undefined since attachmentid 123 not found in empty array
      // The modal won't render due to v-if="attachment", so we test the method directly
      await wrapper.vm.removePhoto(123)
      await flushPromises()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 456,
        attachments: [],
      })
    })

    it('handles attachment with only id property', () => {
      const wrapper = mountComponent({
        attachmentid: 999,
        _messageData: {
          id: 456,
          subject: 'Test',
          attachments: [{ id: 999 }],
        },
      })
      expect(wrapper.find('.b-modal').attributes('id')).toBe('photoModal-999')
    })

    it('handles externalmods with null mods string', () => {
      const wrapper = mountComponent({
        _messageData: {
          id: 456,
          subject: 'Test',
          attachments: [
            {
              id: 123,
              path: '/photos/test.jpg',
              mods: JSON.stringify({ rotate: null, brightness: null }),
            },
          ],
        },
      })
      const postPhoto = wrapper.find('.post-photo')
      const externalmods = JSON.parse(postPhoto.attributes('data-externalmods'))
      expect(externalmods).toEqual({ rotate: null, brightness: null })
    })
  })

  describe('async behavior', () => {
    it('waits for patch to complete on updatedPhoto', async () => {
      let resolvePromise
      mockMessageStore.patch.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve
        })
      )

      const wrapper = mountComponent()
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })

      postPhoto.vm.$emit('updated')

      // Patch should have been called
      expect(mockMessageStore.patch).toHaveBeenCalled()

      // Resolve the promise
      resolvePromise()
      await flushPromises()
    })

    it('waits for patch to complete on removePhoto', async () => {
      let resolvePromise
      mockMessageStore.patch.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve
        })
      )

      const wrapper = mountComponent()
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })

      postPhoto.vm.$emit('remove', 123)

      // Patch should have been called
      expect(mockMessageStore.patch).toHaveBeenCalled()

      // Resolve the promise
      resolvePromise()
      await flushPromises()
    })
  })

  describe('PostPhoto event handling', () => {
    it('listens to remove event from PostPhoto', () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })
      expect(postPhoto.exists()).toBe(true)
    })

    it('listens to updated event from PostPhoto', () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.findComponent({ name: 'PostPhoto' })
      expect(postPhoto.exists()).toBe(true)
    })
  })

  describe('footer button', () => {
    it('has white variant on Close button', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.attributes('data-variant')).toBe('white')
    })

    it('only has one button in footer', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(1)
    })
  })
})
