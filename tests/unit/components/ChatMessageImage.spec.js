import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatMessageImage from '~/components/ChatMessageImage.vue'

const mockChatmessage = ref({
  id: 1,
  image: { path: '/test.jpg' },
})
const mockMessageIsFromCurrentUser = ref(false)
const mockChatMessageProfileImage = ref('/profile.jpg')
const mockChatMessageProfileName = ref('Test User')

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    chatmessage: mockChatmessage,
    messageIsFromCurrentUser: mockMessageIsFromCurrentUser,
    chatMessageProfileImage: mockChatMessageProfileImage,
    chatMessageProfileName: mockChatMessageProfileName,
  }),
}))

describe('ChatMessageImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChatmessage.value = {
      id: 1,
      image: { path: '/test.jpg' },
    }
    mockMessageIsFromCurrentUser.value = false
    mockChatMessageProfileImage.value = '/profile.jpg'
    mockChatMessageProfileName.value = 'Test User'
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageImage, {
      props: {
        chatid: 1,
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-name="name" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          OurUploadedImage: {
            template:
              '<img class="our-uploaded-image" :src="src" :alt="alt" @click="$emit(\'click\')" />',
            props: ['src', 'modifiers', 'alt', 'width'],
            emits: ['click'],
          },
          NuxtPicture: {
            template:
              '<img class="nuxt-picture" :src="src" :alt="alt" @click="$emit(\'click\')" />',
            props: [
              'format',
              'fit',
              'provider',
              'src',
              'modifiers',
              'alt',
              'width',
              'height',
            ],
            emits: ['click'],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @click="$emit(\'click\')" @error="$emit(\'error\', $event)" />',
            props: ['lazy', 'fluid', 'src'],
            emits: ['click', 'error'],
          },
          'b-modal': {
            template:
              '<div v-if="modelValue" class="b-modal"><slot /><slot name="footer" /></div>',
            props: ['modelValue', 'scrollable', 'size', 'noStacking', 'okOnly'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="btnClass" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
            emits: ['click'],
            computed: {
              btnClass() {
                return 'btn-' + this.variant
              },
            },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('shows profile image on left for other user message', () => {
      mockMessageIsFromCurrentUser.value = false
      const wrapper = createWrapper()
      const profiles = wrapper.findAll('.profile-image')
      expect(profiles.length).toBeGreaterThan(0)
    })

    it('shows profile image on right for current user message', () => {
      mockMessageIsFromCurrentUser.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.myImage').exists()).toBe(true)
    })
  })

  describe('image types', () => {
    it('renders OurUploadedImage when image has ouruid', () => {
      mockChatmessage.value = {
        id: 1,
        image: { ouruid: 'abc123', externalmods: {} },
      }
      const wrapper = createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('renders NuxtPicture when image has externaluid', () => {
      mockChatmessage.value = {
        id: 1,
        image: { externaluid: 'ext123', externalmods: {} },
      }
      const wrapper = createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('renders b-img when image has path only', () => {
      mockChatmessage.value = {
        id: 1,
        image: { path: '/fallback.jpg' },
      }
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('zoom modal', () => {
    it('does not show modal initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(false)
    })

    it('shows modal when image is clicked', async () => {
      mockChatmessage.value = {
        id: 1,
        image: { path: '/test.jpg' },
      }
      const wrapper = createWrapper()

      await wrapper.find('.b-img').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('modal has delete button', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.btn-outline-danger').exists()).toBe(true)
      expect(wrapper.text()).toContain('Delete')
    })

    it('modal has close button', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.btn-white').exists()).toBe(true)
      expect(wrapper.text()).toContain('Close')
    })

    it('emits delete event when delete clicked', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = true
      await wrapper.vm.$nextTick()

      await wrapper.find('.btn-outline-danger').trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
    })

    it('closes modal when close clicked', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = true
      await wrapper.vm.$nextTick()

      await wrapper.find('.btn-white').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.zoom).toBe(false)
    })
  })

  describe('error handling', () => {
    it('sets placeholder on image error', () => {
      mockChatmessage.value = {
        id: 1,
        image: { path: '/broken.jpg' },
      }
      const wrapper = createWrapper()

      const mockEvent = { target: { src: '' } }
      wrapper.vm.imageError(mockEvent)

      expect(mockEvent.target.src).toBe('/placeholder.jpg')
    })
  })

  describe('CSS classes', () => {
    it('applies myImage class for current user messages', () => {
      mockMessageIsFromCurrentUser.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.myImage').exists()).toBe(true)
    })

    it('applies justify-content-end for current user messages', () => {
      mockMessageIsFromCurrentUser.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.justify-content-end').exists()).toBe(true)
    })

    it('applies justify-content-start for other user messages', () => {
      mockMessageIsFromCurrentUser.value = false
      const wrapper = createWrapper()
      expect(wrapper.find('.justify-content-start').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires chatid prop', () => {
      const wrapper = createWrapper({ chatid: 5 })
      expect(wrapper.props('chatid')).toBe(5)
    })

    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 10 })
      expect(wrapper.props('id')).toBe(10)
    })

    it('has optional last prop', () => {
      const wrapper = createWrapper({ last: true })
      expect(wrapper.props('last')).toBe(true)
    })

    it('has optional pov prop', () => {
      const wrapper = createWrapper({ pov: 123 })
      expect(wrapper.props('pov')).toBe(123)
    })

    it('has optional highlightEmails prop', () => {
      const wrapper = createWrapper({ highlightEmails: true })
      expect(wrapper.props('highlightEmails')).toBe(true)
    })
  })
})
