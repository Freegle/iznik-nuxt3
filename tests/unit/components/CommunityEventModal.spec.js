import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import CommunityEventModal from '~/components/CommunityEventModal.vue'

const mockEvent = {
  id: 123,
  userid: 456,
  title: 'Test Event',
  description: 'Test description',
  location: 'Test Location',
  dates: [
    {
      uniqueid: 'date-1',
      start: new Date('2024-01-15'),
      end: new Date('2024-01-15'),
      starttime: '10:00',
      endtime: '12:00',
      string: {
        start: 'Mon 15 Jan 10:00',
        end: 'Mon 15 Jan 12:00',
        past: false,
      },
    },
  ],
  groups: [1],
  image: {
    id: 1,
    path: '/test/image.jpg',
  },
  contactname: 'Test Contact',
  contactemail: 'test@example.com',
  contactphone: '01onal23456',
  contacturl: 'https://example.com',
  url: 'https://freegle.org/event/123',
}

const mockUser = { id: 456, displayname: 'Test User' }
const mockGroup = {
  id: 1,
  namedisplay: 'Test Group',
  settings: { communityevents: true },
}

const { mockModal } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
  }
})

const mockHide = vi.fn()

const mockCommunityEventStore = {
  fetch: vi.fn().mockResolvedValue(mockEvent),
  byId: vi.fn().mockReturnValue(mockEvent),
  add: vi.fn().mockResolvedValue(123),
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  setPhoto: vi.fn().mockResolvedValue(undefined),
  addGroup: vi.fn().mockResolvedValue(undefined),
  removeGroup: vi.fn().mockResolvedValue(undefined),
  setDates: vi.fn().mockResolvedValue(undefined),
}

const mockComposeStore = {
  uploading: false,
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue(mockUser),
  byId: vi.fn().mockReturnValue(mockUser),
}

const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue(mockGroup),
  get: vi.fn().mockReturnValue(mockGroup),
}

const mockImageStore = {
  post: vi.fn().mockResolvedValue(undefined),
}

const mockAuthStore = {
  user: { id: 456 },
}

vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => mockCommunityEventStore,
}))

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/image', () => ({
  useImageStore: () => mockImageStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.mock('~/composables/useId', () => ({
  uid: (prefix) => prefix + 'test-id',
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: false,
  }),
}))

describe('CommunityEventModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCommunityEventStore.byId.mockReturnValue({ ...mockEvent })
    mockCommunityEventStore.fetch.mockResolvedValue({ ...mockEvent })
    mockGroupStore.get.mockReturnValue({ ...mockGroup })
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(CommunityEventModal, { id: 123, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot name="header" /><slot name="default" /><slot name="footer" /></div>',
            props: ['scrollable', 'size', 'noStacking'],
          },
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
            props: ['cols', 'md'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'disabled'],
            emits: ['click'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :data-label="label" :disabled="disabled" @click="handleClick"><slot />{{ label }}</button>',
            props: ['iconName', 'variant', 'label', 'disabled'],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['lazy', 'fluid', 'src'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt', 'width'],
          },
          NuxtPicture: {
            template:
              '<picture class="nuxt-picture"><img :src="src" /></picture>',
            props: ['format', 'width', 'provider', 'src', 'modifiers', 'alt'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'size', 'flip'],
          },
          'b-form-group': {
            template: '<div class="b-form-group"><slot /></div>',
            props: ['label', 'labelFor', 'state'],
          },
          'b-form-invalid-feedback': {
            template: '<div class="b-form-invalid-feedback"><slot /></div>',
          },
          VeeForm: {
            template: '<form class="vee-form"><slot /></form>',
          },
          Field: {
            template:
              '<input class="field" :id="id" :type="type" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              'id',
              'modelValue',
              'name',
              'type',
              'rules',
              'placeholder',
              'as',
              'rows',
              'maxRows',
              'spellcheck',
            ],
            emits: ['update:modelValue'],
          },
          ErrorMessage: {
            template: '<span class="error-message" />',
            props: ['name'],
          },
          GroupSelect: {
            template:
              '<select class="group-select" :value="modelValue" @change="$emit(\'update:modelValue\', parseInt($event.target.value))"><option value="0">Select</option><option value="1">Group 1</option></select>',
            props: ['modelValue', 'systemwide'],
            emits: ['update:modelValue'],
          },
          OurUploader: {
            template: '<div class="our-uploader" />',
            props: ['modelValue', 'type'],
            emits: ['update:modelValue'],
          },
          StartEndCollection: {
            template: '<div class="start-end-collection" />',
            props: ['modelValue', 'time'],
            emits: ['update:modelValue'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          DonationButton: {
            template: '<button class="donation-button">Donate</button>',
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
          EmailValidator: {
            template:
              '<input class="email-validator" :value="email" @input="$emit(\'update:email\', $event.target.value)" />',
            props: ['email', 'size', 'label', 'required'],
            emits: ['update:email'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('view mode', () => {
    it('renders modal', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('shows event title in header', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('h4').text()).toBe('Test Event')
    })

    it('shows event URL', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('https://freegle.org/event/123')
    })

    it('shows event description', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test description')
    })

    it('shows event location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test Location')
    })

    it('shows event dates', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Mon 15 Jan 10:00')
    })
  })

  describe('contact information', () => {
    it('shows contact name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test Contact')
    })

    it('shows contact email', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('shows contact phone', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('01onal23456')
    })

    it('shows contact URL', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('https://example.com')
    })
  })

  describe('posted by info', () => {
    it('shows user who posted', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Posted by Test User')
    })

    it('shows group name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test Group')
    })
  })

  describe('image display', () => {
    it('shows b-img when event has standard image', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.view-mode .b-img').exists()).toBe(true)
    })

    it('shows OurUploadedImage when image has ouruid', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        image: { ouruid: 'our-123', imagemods: '{}' },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })
  })

  describe('action buttons (view mode)', () => {
    it('shows Close button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Close')
    })

    it('shows Edit button when canmodify', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Edit')
    })

    it('shows Delete button when canmodify', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Delete')
    })

    it('hides Edit/Delete when user not owner', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        userid: 999,
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.spin-button[data-label="Edit"]').exists()).toBe(
        false
      )
    })
  })

  describe('edit mode', () => {
    it('enters edit mode when startEdit is true', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      // The component uses VeeForm imported from vee-validate, which renders as <form novalidate>
      // Check for form element with title field to confirm edit mode
      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('#title').exists()).toBe(true)
    })

    it('shows group select in edit mode', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.find('.group-select').exists()).toBe(true)
    })

    it('shows title field in edit mode', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.find('#title').exists()).toBe(true)
    })

    it('shows description textarea in edit mode', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.find('#description').exists()).toBe(true)
    })

    it('shows location field in edit mode', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.find('#location').exists()).toBe(true)
    })

    it('shows StartEndCollection for dates', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.find('.start-end-collection').exists()).toBe(true)
    })

    it('shows contact fields', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.find('#contactname').exists()).toBe(true)
      expect(wrapper.find('.email-validator').exists()).toBe(true)
      expect(wrapper.find('#contactphone').exists()).toBe(true)
      expect(wrapper.find('#contacturl').exists()).toBe(true)
    })
  })

  describe('edit mode actions', () => {
    it('shows Save button in edit mode', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.text()).toContain('Save')
    })

    it('shows Cancel button in edit mode', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.text()).toContain('Cancel')
    })

    it('hides modal on Cancel click', async () => {
      const wrapper = await createWrapper({ startEdit: true })
      const cancelButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Cancel'))
      await cancelButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('add mode (no id)', () => {
    it('shows Add Community Event header when no id', async () => {
      mockCommunityEventStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper({ id: null, startEdit: true })
      expect(wrapper.text()).toContain('Add Community Event')
    })

    it('shows Add Event button when adding', async () => {
      mockCommunityEventStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper({ id: null, startEdit: true })
      expect(wrapper.text()).toContain('Add Event')
    })
  })

  describe('delete functionality', () => {
    it('calls delete on Delete click', async () => {
      const wrapper = await createWrapper()
      const deleteButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Delete'))
      await deleteButton.trigger('click')
      expect(mockCommunityEventStore.delete).toHaveBeenCalledWith(123)
    })

    it('hides modal after delete', async () => {
      const wrapper = await createWrapper()
      const deleteButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Delete'))
      await deleteButton.trigger('click')
      await flushPromises()
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('data fetching', () => {
    it('fetches event on mount', async () => {
      await createWrapper({ id: 456 })
      expect(mockCommunityEventStore.fetch).toHaveBeenCalledWith(456)
    })

    it('fetches user after event fetch', async () => {
      await createWrapper()
      expect(mockUserStore.fetch).toHaveBeenCalled()
    })

    it('fetches group after event fetch', async () => {
      await createWrapper()
      expect(mockGroupStore.fetch).toHaveBeenCalled()
    })
  })

  describe('added state', () => {
    it('shows success message when added', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(CommunityEventModal)
      component.vm.added = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Your event has been added')
    })

    it('shows donation button when added', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(CommunityEventModal)
      component.vm.added = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.donation-button').exists()).toBe(true)
    })
  })

  describe('community events disabled', () => {
    it('shows warning when group has events disabled', async () => {
      mockGroupStore.get.mockReturnValue({
        ...mockGroup,
        settings: { communityevents: false },
      })
      const wrapper = await createWrapper({ startEdit: true })
      expect(wrapper.text()).toContain(
        'This community has chosen not to allow Community Events'
      )
    })
  })

  describe('icons', () => {
    it('shows map marker icon for location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="map-marker-alt"]').exists()).toBe(true)
    })

    it('shows calendar icon for dates', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="calendar-alt"]').exists()).toBe(true)
    })

    it('shows contact icons', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="user"]').exists()).toBe(true)
      expect(wrapper.find('[data-icon="envelope"]').exists()).toBe(true)
      expect(wrapper.find('[data-icon="globe-europe"]').exists()).toBe(true)
      expect(wrapper.find('[data-icon="phone"]').exists()).toBe(true)
    })
  })
})
