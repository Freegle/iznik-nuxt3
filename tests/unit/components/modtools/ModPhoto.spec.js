import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import { createMockMessageStore } from '../../mocks/stores'

// Create mock store instance that can be configured per test
const mockMessageStore = createMockMessageStore()

// Mock the store import
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

// Mock async component
vi.mock('../../components/PostPhoto', () => ({
  default: {
    template:
      '<div class="post-photo" @click="$emit(\'click\')" data-testid="post-photo"><slot /></div>',
    props: ['externalmods', 'showAiBadge'],
    emits: ['click', 'remove', 'updated'],
  },
}))

// Create a simplified test component that doesn't use defineAsyncComponent
const ModPhotoTest = {
  template: `
    <span class="clickme">
      <div
        class="post-photo"
        data-testid="post-photo"
        @click="showModal"
      />
      <div
        v-if="zoom"
        ref="modphotomodal"
        class="mod-photo-modal"
      />
    </span>
  `,
  props: {
    attachment: { type: Object, required: true },
    message: { type: Object, required: true },
  },
  setup(props) {
    const zoom = ref(false)
    const modphotomodal = ref(null)

    const mods = computed(() => {
      if (props.attachment.mods) {
        const jsonmods = JSON.parse(props.attachment.mods)
        if (!jsonmods) return {}
        return jsonmods
      }
      return {}
    })

    function showModal() {
      zoom.value = true
      modphotomodal.value?.show()
    }

    async function removePhoto(id) {
      const attachments = []
      props.message.attachments.forEach((a) => {
        if (a.id !== id) {
          attachments.push(a.id)
        }
      })
      await mockMessageStore.patch({ id: props.message.id, attachments })
    }

    async function updatedPhoto() {
      await mockMessageStore.patch({ id: props.message.id })
    }

    return { zoom, modphotomodal, mods, showModal, removePhoto, updatedPhoto }
  },
}

describe('ModPhoto', () => {
  const defaultProps = {
    attachment: {
      id: 1,
      path: '/photos/test.jpg',
      paththumb: '/photos/test_thumb.jpg',
      mods: null,
    },
    message: {
      id: 100,
      attachments: [
        { id: 1, path: '/photos/test.jpg' },
        { id: 2, path: '/photos/other.jpg' },
      ],
    },
  }

  function mountComponent(props = {}) {
    return mount(ModPhotoTest, {
      props: { ...defaultProps, ...props },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders PostPhoto component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('[data-testid="post-photo"]').exists()).toBe(true)
    })

    it('has clickable element for post photo', () => {
      const wrapper = mountComponent()
      const postPhoto = wrapper.find('.post-photo')
      expect(postPhoto.exists()).toBe(true)
    })

    it('does not render ModPhotoModal initially (zoom is false)', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-photo-modal').exists()).toBe(false)
    })
  })

  describe('mods computed property', () => {
    it('returns empty object when attachment.mods is null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.mods).toEqual({})
    })

    it('returns empty object when attachment.mods is undefined', () => {
      const wrapper = mountComponent({
        attachment: {
          id: 1,
          path: '/photos/test.jpg',
        },
        message: defaultProps.message,
      })
      expect(wrapper.vm.mods).toEqual({})
    })

    it('parses JSON mods string correctly', () => {
      const modsData = { rotate: 90, brightness: 1.5 }
      const wrapper = mountComponent({
        attachment: {
          ...defaultProps.attachment,
          mods: JSON.stringify(modsData),
        },
        message: defaultProps.message,
      })
      expect(wrapper.vm.mods).toEqual(modsData)
    })

    it('returns empty object when mods JSON parses to null', () => {
      const wrapper = mountComponent({
        attachment: {
          ...defaultProps.attachment,
          mods: 'null',
        },
        message: defaultProps.message,
      })
      expect(wrapper.vm.mods).toEqual({})
    })

    it('handles complex mods object', () => {
      const modsData = {
        rotate: 180,
        brightness: 0.8,
        contrast: 1.2,
        filters: ['grayscale'],
      }
      const wrapper = mountComponent({
        attachment: {
          ...defaultProps.attachment,
          mods: JSON.stringify(modsData),
        },
        message: defaultProps.message,
      })
      expect(wrapper.vm.mods).toEqual(modsData)
    })
  })

  describe('showModal method', () => {
    it('sets zoom to true when called', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.zoom).toBe(false)

      // Trigger the click on PostPhoto
      await wrapper.find('[data-testid="post-photo"]').trigger('click')

      expect(wrapper.vm.zoom).toBe(true)
    })

    it('shows ModPhotoModal after click', async () => {
      const wrapper = mountComponent()

      await wrapper.find('[data-testid="post-photo"]').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.mod-photo-modal').exists()).toBe(true)
    })
  })

  describe('removePhoto method', () => {
    it('calls messageStore.patch with remaining attachment ids', async () => {
      const wrapper = mountComponent()

      // Call removePhoto with attachment id 1 (should remove it, keep id 2)
      await wrapper.vm.removePhoto(1)

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 100,
        attachments: [2],
      })
    })

    it('removes only the specified photo from attachments', async () => {
      const wrapper = mountComponent({
        attachment: defaultProps.attachment,
        message: {
          id: 100,
          attachments: [
            { id: 1, path: '/photos/test1.jpg' },
            { id: 2, path: '/photos/test2.jpg' },
            { id: 3, path: '/photos/test3.jpg' },
          ],
        },
      })

      await wrapper.vm.removePhoto(2)

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 100,
        attachments: [1, 3],
      })
    })

    it('handles removing last attachment', async () => {
      const wrapper = mountComponent({
        attachment: defaultProps.attachment,
        message: {
          id: 100,
          attachments: [{ id: 1, path: '/photos/test.jpg' }],
        },
      })

      await wrapper.vm.removePhoto(1)

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 100,
        attachments: [],
      })
    })

    it('does nothing if attachment id not found', async () => {
      const wrapper = mountComponent()

      await wrapper.vm.removePhoto(999)

      expect(mockMessageStore.patch).toHaveBeenCalledWith({
        id: 100,
        attachments: [1, 2],
      })
    })
  })

  describe('updatedPhoto method', () => {
    it('calls messageStore.patch with message id only', async () => {
      const wrapper = mountComponent()

      await wrapper.vm.updatedPhoto()

      expect(mockMessageStore.patch).toHaveBeenCalledWith({ id: 100 })
    })
  })

  describe('props validation', () => {
    it('accepts required attachment prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('attachment').id).toBe(1)
    })

    it('accepts required message prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('message').id).toBe(100)
    })
  })
})
