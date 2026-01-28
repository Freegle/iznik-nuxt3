import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OutcomeModal from '~/components/OutcomeModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockById = vi.fn()
const mockUpdate = vi.fn()
const mockFetch = vi.fn()
const mockAddBy = vi.fn()
const mockRemoveBy = vi.fn()
const mockBusEmit = vi.fn()

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockById,
    update: mockUpdate,
    fetch: mockFetch,
    addBy: mockAddBy,
    removeBy: mockRemoveBy,
  }),
}))

vi.stubGlobal('useNuxtApp', () => ({
  $bus: { $emit: mockBusEmit },
}))

describe('OutcomeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockById.mockReturnValue({
      id: 123,
      subject: 'Test Item',
      type: 'Offer',
      availablenow: 1,
      availableinitially: 1,
      groups: [{ groupid: 456 }],
      replies: [],
    })
  })

  function createWrapper(props = {}) {
    return mount(OutcomeModal, {
      props: {
        id: 123,
        type: 'Taken',
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot name="title" /><slot /><slot name="footer" /></div>',
            props: ['scrollable', 'size', 'noStacking', 'dialogClass'],
          },
          'b-badge': {
            template: '<span class="b-badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'b-button': {
            template:
              '<button :class="variant" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'disabled', 'pressed'],
          },
          'b-button-group': {
            template: '<div class="btn-group"><slot /></div>',
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows', 'maxRows'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          OutcomeBy: {
            template: '<div class="outcome-by" />',
            props: [
              'availablenow',
              'type',
              'msgid',
              'left',
              'takenBy',
              'chooseError',
              'invalid',
            ],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'disabled'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'scale', 'color'],
          },
        },
        mocks: {
          $bus: {
            $emit: mockBusEmit,
          },
        },
        provide: {
          useNuxtApp: () => ({
            $bus: { $emit: mockBusEmit },
          }),
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('displays message subject in title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test Item')
    })

    it('renders OutcomeBy component for Taken type', () => {
      const wrapper = createWrapper({ type: 'Taken' })
      expect(wrapper.find('.outcome-by').exists()).toBe(true)
    })

    it('shows withdrawal notice for Withdrawn type', () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('Mark as')
    })
  })

  describe('message display', () => {
    it('shows TAKEN for Offer messages', () => {
      mockById.mockReturnValue({
        id: 123,
        subject: 'Test Item',
        type: 'Offer',
        availablenow: 1,
        availableinitially: 1,
        groups: [{ groupid: 456 }],
        replies: [],
      })
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.text()).toContain('TAKEN')
    })

    it('shows RECEIVED for Wanted messages', () => {
      mockById.mockReturnValue({
        id: 123,
        subject: 'Test Item',
        type: 'Wanted',
        availablenow: 1,
        availableinitially: 1,
        groups: [{ groupid: 456 }],
        replies: [],
      })
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.text()).toContain('RECEIVED')
    })

    it('shows available count badge when more than 1 available', () => {
      mockById.mockReturnValue({
        id: 123,
        subject: 'Test Item',
        type: 'Offer',
        availablenow: 3,
        availableinitially: 3,
        groups: [{ groupid: 456 }],
        replies: [],
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('3 left')
    })
  })

  describe('happiness selection', () => {
    it('renders happiness buttons when completion is shown', () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.text()).toContain('Happy')
      expect(wrapper.text()).toContain('Fine')
      expect(wrapper.text()).toContain('Sad')
    })

    it('renders happiness icons', () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.find('.v-icon[data-icon="smile"]').exists()).toBe(true)
      expect(wrapper.find('.v-icon[data-icon="meh"]').exists()).toBe(true)
      expect(wrapper.find('.v-icon[data-icon="frown"]').exists()).toBe(true)
    })

    it('updates happiness when button clicked', async () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      const happyBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Happy'))

      await happyBtn.trigger('click')

      expect(wrapper.vm.happiness).toBe('Happy')
    })
  })

  describe('comments section', () => {
    it('renders comments textarea when completion shown', () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('shows public comments notice for happy/fine outcomes', () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.text()).toContain('may be public')
    })
  })

  describe('footer buttons', () => {
    it('renders cancel button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('renders submit button with correct label for Taken', () => {
      const wrapper = createWrapper({ type: 'Taken' })
      expect(wrapper.text()).toContain('Mark as TAKEN')
    })

    it('renders submit button with correct label for Withdrawn', () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      expect(wrapper.text()).toContain('Withdraw')
    })

    it('disables submit button when no users selected for Taken', () => {
      const wrapper = createWrapper({ type: 'Taken' })
      const submitBtn = wrapper.find('.spin-button')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('cancel functionality', () => {
    it('calls hide when cancel clicked', async () => {
      const wrapper = createWrapper()
      const cancelBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Cancel'))

      await cancelBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })

    it('resets tookUsers when cancel clicked', async () => {
      const wrapper = createWrapper()
      wrapper.vm.tookUsers = [{ userid: 1, count: 1 }]

      const cancelBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Cancel'))
      await cancelBtn.trigger('click')

      expect(wrapper.vm.tookUsers).toEqual([])
    })

    it('resets happiness when cancel clicked', async () => {
      const wrapper = createWrapper({ type: 'Withdrawn' })
      wrapper.vm.happiness = 'Happy'

      const cancelBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Cancel'))
      await cancelBtn.trigger('click')

      expect(wrapper.vm.happiness).toBeNull()
    })
  })

  describe('computed properties', () => {
    describe('message', () => {
      it('returns message from store by id', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.message.id).toBe(123)
        expect(wrapper.vm.message.subject).toBe('Test Item')
      })
    })

    describe('left', () => {
      it('returns availablenow minus taken count', () => {
        mockById.mockReturnValue({
          id: 123,
          subject: 'Test Item',
          type: 'Offer',
          availablenow: 5,
          availableinitially: 5,
          groups: [{ groupid: 456 }],
          replies: [],
        })
        const wrapper = createWrapper()
        wrapper.vm.tookUsers = [
          { userid: 1, count: 2 },
          { userid: 2, count: 1 },
        ]
        expect(wrapper.vm.left).toBe(2)
      })

      it('ignores users with negative userid', () => {
        mockById.mockReturnValue({
          id: 123,
          subject: 'Test Item',
          type: 'Offer',
          availablenow: 3,
          availableinitially: 3,
          groups: [{ groupid: 456 }],
          replies: [],
        })
        const wrapper = createWrapper()
        wrapper.vm.tookUsers = [{ userid: -1, count: 1 }]
        expect(wrapper.vm.left).toBe(3)
      })
    })

    describe('showCompletion', () => {
      it('returns true for Withdrawn type', () => {
        const wrapper = createWrapper({ type: 'Withdrawn' })
        expect(wrapper.vm.showCompletion).toBe(true)
      })

      it('returns true when availableinitially is 1', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.showCompletion).toBe(true)
      })

      it('returns true when left is 0', () => {
        mockById.mockReturnValue({
          id: 123,
          subject: 'Test Item',
          type: 'Offer',
          availablenow: 2,
          availableinitially: 2,
          groups: [{ groupid: 456 }],
          replies: [],
        })
        const wrapper = createWrapper()
        wrapper.vm.tookUsers = [{ userid: 1, count: 2 }]
        expect(wrapper.vm.showCompletion).toBe(true)
      })
    })

    describe('groupid', () => {
      it('returns first group id from message', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.groupid).toBe(456)
      })

      it('returns null when no groups', () => {
        mockById.mockReturnValue({
          id: 123,
          subject: 'Test Item',
          type: 'Offer',
          availablenow: 1,
          availableinitially: 1,
          groups: [],
          replies: [],
        })
        const wrapper = createWrapper()
        expect(wrapper.vm.groupid).toBeNull()
      })
    })

    describe('buttonLabel', () => {
      it('returns Submit when no type', () => {
        const wrapper = createWrapper({ type: null })
        expect(wrapper.vm.buttonLabel).toBe('Submit')
      })

      it('returns Withdraw for Withdrawn type', () => {
        const wrapper = createWrapper({ type: 'Withdrawn' })
        expect(wrapper.vm.buttonLabel).toBe('Withdraw')
      })

      it('returns Mark as TAKEN for Taken type', () => {
        const wrapper = createWrapper({ type: 'Taken' })
        expect(wrapper.vm.buttonLabel).toBe('Mark as TAKEN')
      })

      it('returns Mark as RECEIVED for Received type', () => {
        const wrapper = createWrapper({ type: 'Received' })
        expect(wrapper.vm.buttonLabel).toBe('Mark as RECEIVED')
      })
    })
  })

  describe('took method', () => {
    it('updates tookUsers', () => {
      const wrapper = createWrapper()
      const users = [{ userid: 1, count: 2 }]
      wrapper.vm.took(users)
      expect(wrapper.vm.tookUsers).toEqual(users)
    })
  })

  describe('onHide', () => {
    it('emits hidden event', () => {
      const wrapper = createWrapper()
      wrapper.vm.onHide()
      expect(wrapper.emitted('hidden')).toBeTruthy()
    })

    it('resets tookUsers', () => {
      const wrapper = createWrapper()
      wrapper.vm.tookUsers = [{ userid: 1, count: 1 }]
      wrapper.vm.onHide()
      expect(wrapper.vm.tookUsers).toEqual([])
    })

    it('resets happiness', () => {
      const wrapper = createWrapper()
      wrapper.vm.happiness = 'Happy'
      wrapper.vm.onHide()
      expect(wrapper.vm.happiness).toBeNull()
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 999 })
      expect(wrapper.props('id')).toBe(999)
    })

    it('has optional takenBy defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('takenBy')).toBeNull()
    })

    it('has optional type defaulting to null', () => {
      const wrapper = createWrapper({ type: undefined })
      expect(wrapper.props('type')).toBeNull()
    })

    it('accepts takenBy object', () => {
      const takenBy = { userid: 1, displayname: 'John' }
      const wrapper = createWrapper({ takenBy })
      expect(wrapper.props('takenBy')).toEqual(takenBy)
    })
  })
})
