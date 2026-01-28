import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import MicroVolunteeringCheckMessage from '~/components/MicroVolunteeringCheckMessage.vue'

// Mock stores
const mockMessageById = vi.fn()
const mockMessageFetch = vi.fn()
const mockMicroVolunteeringRespond = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockMessageById,
    fetch: mockMessageFetch,
  }),
}))

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => ({
    respond: mockMicroVolunteeringRespond,
  }),
}))

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useTimeAgo: () => ref('2 hours ago'),
}))

// Mock child components
vi.mock('~/components/SpinButton', () => ({
  default: {
    name: 'SpinButton',
    template:
      '<button :class="variant" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
    props: ['variant', 'label', 'disabled', 'iconName', 'size'],
    emits: ['handle'],
  },
}))

vi.mock('~/components/NoticeMessage', () => ({
  default: {
    name: 'NoticeMessage',
    template: '<div class="notice-message" :class="variant"><slot /></div>',
    props: ['variant'],
  },
}))

vi.mock('~/components/MessageTag', () => ({
  default: {
    name: 'MessageTag',
    template: '<span class="message-tag">Tag</span>',
    props: ['id', 'inline'],
  },
}))

vi.mock('~/components/OurUploadedImage', () => ({
  default: {
    name: 'OurUploadedImage',
    template: '<img class="our-uploaded-image" :src="src" />',
    props: ['src', 'modifiers', 'alt', 'width', 'height'],
  },
}))

vi.mock('~/components/ProxyImage', () => ({
  default: {
    name: 'ProxyImage',
    template: '<img class="proxy-image" :src="src" />',
    props: ['src', 'alt', 'width', 'height', 'fit', 'className'],
  },
}))

vi.mock('~/components/MessagePhotosModal', () => ({
  default: {
    name: 'MessagePhotosModal',
    template: '<div class="message-photos-modal"></div>',
    props: ['id'],
    emits: ['hidden'],
  },
}))

describe('MicroVolunteeringCheckMessage', () => {
  const mockMessage = {
    id: 123,
    subject: 'OFFER: Test item',
    textbody: 'This is a test description',
    type: 'Offer',
    date: '2023-01-01T10:00:00Z',
    area: 'Test Area',
    attachments: [
      {
        id: 1,
        ouruid: 'abc123',
        path: '/images/test.jpg',
      },
    ],
  }

  function createWrapper(props = {}, messageData = mockMessage) {
    mockMessageById.mockReturnValue(messageData)
    mockMessageFetch.mockResolvedValue(messageData)

    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(
            Suspense,
            {},
            {
              default: () =>
                h(MicroVolunteeringCheckMessage, {
                  id: 123,
                  ...props,
                }),
              fallback: () => h('div', 'Loading...'),
            }
          )
      },
    })

    return mount(TestWrapper, {
      global: {
        stubs: {
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" :disabled="disabled" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
            props: ['modelValue', 'disabled', 'placeholder', 'rows'],
            emits: ['update:modelValue'],
          },
          NuxtPicture: true,
          'v-icon': {
            template: '<i :class="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders when message is found', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain("someone else's post")
    })

    it('shows warning when message not found', async () => {
      mockMessageById.mockReturnValue(null)
      const wrapper = createWrapper({}, null)
      await flushPromises()
      expect(wrapper.text()).toContain("couldn't find that message")
    })

    it('displays message subject without type prefix', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Test item')
    })

    it('displays message description', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('This is a test description')
    })

    it('displays area when available', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Test Area')
    })

    it('shows photo when attachments exist', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('shows no photo placeholder when no attachments', async () => {
      const messageNoPhoto = { ...mockMessage, attachments: [] }
      const wrapper = createWrapper({}, messageNoPhoto)
      await flushPromises()
      expect(wrapper.text()).toContain('No photo')
    })

    it('shows photo count for multiple attachments', async () => {
      const messageMultiPhoto = {
        ...mockMessage,
        attachments: [
          { id: 1, ouruid: 'abc' },
          { id: 2, ouruid: 'def' },
          { id: 3, ouruid: 'ghi' },
        ],
      }
      const wrapper = createWrapper({}, messageMultiPhoto)
      await flushPromises()
      expect(wrapper.find('.photo-count').exists()).toBe(true)
      expect(wrapper.find('.photo-count').text()).toContain('3')
    })
  })

  describe('approval flow', () => {
    it('renders approve button', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Yes, that looks ok')
    })

    it('renders not right button', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain("something's not right")
    })

    it('calls store respond with Approve on approval', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const approveBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes'))
      await approveBtn.trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringRespond).toHaveBeenCalledWith({
        msgid: 123,
        response: 'Approve',
      })
    })
  })

  describe('rejection flow', () => {
    it('shows comment form when not right clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const notRightBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await notRightBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain("What's wrong?")
    })

    it('shows category options', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const notRightBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await notRightBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('This could be better')
      expect(wrapper.text()).toContain("shouldn't be on Freegle")
    })

    it('allows selecting category', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const notRightBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await notRightBtn.trigger('click')
      await flushPromises()

      const categoryBtn = wrapper.findAll('.category-btn')[0]
      await categoryBtn.trigger('click')
      await flushPromises()

      expect(categoryBtn.classes()).toContain('active')
    })

    it('disables send button without category', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const notRightBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await notRightBtn.trigger('click')
      await flushPromises()

      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send feedback'))
      expect(sendBtn.attributes('disabled')).toBeDefined()
    })

    it('disables send button without comments', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const notRightBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await notRightBtn.trigger('click')
      await flushPromises()

      // Select category
      const categoryBtn = wrapper.findAll('.category-btn')[0]
      await categoryBtn.trigger('click')
      await flushPromises()

      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send feedback'))
      expect(sendBtn.attributes('disabled')).toBeDefined()
    })

    it('calls store respond with Reject on submit', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const notRightBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await notRightBtn.trigger('click')
      await flushPromises()

      // Select category
      const categoryBtn = wrapper.findAll('.category-btn')[0]
      await categoryBtn.trigger('click')
      await flushPromises()

      // Enter comments
      const textarea = wrapper.find('textarea')
      await textarea.setValue('Test comment')
      await flushPromises()

      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send feedback'))
      await sendBtn.trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringRespond).toHaveBeenCalledWith({
        msgid: 123,
        response: 'Reject',
        comments: 'Test comment',
        msgcategory: 'CouldBeBetter',
      })
    })
  })

  describe('computed properties', () => {
    it('strips OFFER prefix from subject', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.title-subject').text()).toBe('Test item')
    })

    it('strips WANTED prefix from subject', async () => {
      const messageWanted = {
        ...mockMessage,
        subject: 'WANTED: Looking for chair',
      }
      const wrapper = createWrapper({}, messageWanted)
      await flushPromises()
      expect(wrapper.find('.title-subject').text()).toBe('Looking for chair')
    })

    it('applies offer class for Offer messages', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.message-card').classes()).toContain('offer')
    })

    it('applies wanted class for Wanted messages', async () => {
      const messageWanted = { ...mockMessage, type: 'Wanted' }
      const wrapper = createWrapper({}, messageWanted)
      await flushPromises()
      expect(wrapper.find('.message-card').classes()).toContain('wanted')
    })

    it('returns search icon for wanted messages', async () => {
      const messageWanted = { ...mockMessage, type: 'Wanted', attachments: [] }
      const wrapper = createWrapper({}, messageWanted)
      await flushPromises()
      expect(wrapper.find('.placeholder-icon').classes()).toContain('search')
    })

    it('returns gift icon for offer messages', async () => {
      const messageOffer = { ...mockMessage, type: 'Offer', attachments: [] }
      const wrapper = createWrapper({}, messageOffer)
      await flushPromises()
      expect(wrapper.find('.placeholder-icon').classes()).toContain('gift')
    })
  })

  describe('photo modal', () => {
    it('opens photo modal on photo click', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      await wrapper.find('.photo-area').trigger('click')
      await flushPromises()

      expect(wrapper.find('.message-photos-modal').exists()).toBe(true)
    })

    it('does not open modal when no attachments', async () => {
      const messageNoPhoto = { ...mockMessage, attachments: [] }
      const wrapper = createWrapper({}, messageNoPhoto)
      await flushPromises()

      await wrapper.find('.photo-area').trigger('click')
      await flushPromises()

      expect(wrapper.find('.message-photos-modal').exists()).toBe(false)
    })
  })

  describe('emits', () => {
    it('emits next after approval', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const approveBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes'))
      await approveBtn.trigger('click')
      await flushPromises()

      const component = wrapper.findComponent(MicroVolunteeringCheckMessage)
      expect(component.emitted('next')).toBeTruthy()
    })

    it('emits next after rejection with comments', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const notRightBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await notRightBtn.trigger('click')
      await flushPromises()

      const categoryBtn = wrapper.findAll('.category-btn')[1]
      await categoryBtn.trigger('click')
      await flushPromises()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Bad content')
      await flushPromises()

      const sendBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Send feedback'))
      await sendBtn.trigger('click')
      await flushPromises()

      const component = wrapper.findComponent(MicroVolunteeringCheckMessage)
      expect(component.emitted('next')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      createWrapper({ id: 456 })
      expect(mockMessageFetch).toHaveBeenCalledWith(456, true)
    })
  })
})
