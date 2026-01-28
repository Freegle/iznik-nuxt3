import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import RenegeModal from '~/components/RenegeModal.vue'

const { mockMessages, mockUsers, mockTryst } = vi.hoisted(() => {
  return {
    mockMessages: [
      { id: 1, subject: 'OFFER: Sofa' },
      { id: 2, subject: 'OFFER: Table' },
    ],
    mockUsers: [
      { id: 100, displayname: 'John Smith' },
      { id: 200, displayname: 'Jane Doe' },
    ],
    mockTryst: {
      id: 500,
      arrangedfor: '2024-02-01T14:00:00Z',
    },
  }
})

const mockTrystStore = {
  fetch: vi.fn().mockResolvedValue(undefined),
  getByUser: vi.fn().mockReturnValue(mockTryst),
  delete: vi.fn().mockResolvedValue(undefined),
}

const mockMessageStore = {
  byId: vi.fn((id) => mockMessages.find((m) => m.id === id)),
  renege: vi.fn().mockResolvedValue(undefined),
}

const mockModal = ref(null)

vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => mockTrystStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
  }),
}))

describe('RenegeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTrystStore.getByUser.mockReturnValue(mockTryst)
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(RenegeModal, {
                messages: [1, 2],
                selectedMessage: 1,
                users: mockUsers,
                selectedUser: 100,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot /><slot name="footer" /></div>',
            props: ['scrollable', 'title', 'size'],
            emits: ['shown'],
            methods: {
              show() {},
              hide() {},
            },
          },
          'b-form-select': {
            template:
              '<select class="b-form-select" :value="modelValue" :disabled="disabled"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options', 'disabled'],
          },
          'b-form-checkbox': {
            template:
              '<div class="b-form-checkbox"><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></div>',
            props: ['modelValue', 'size'],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          UserRatings: {
            template: '<div class="user-ratings" :data-id="id" />',
            props: ['id', 'size'],
          },
          DateFormatted: {
            template: '<span class="date-formatted">{{ value }}</span>',
            props: ['value', 'format'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders modal', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('shows warning notice', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('good reason')
    })

    it('shows gift icon', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="gift"]').exists()).toBe(true)
    })

    it('shows user icon', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="user"]').exists()).toBe(true)
    })

    it('shows thumbs-up icon', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="thumbs-up"]').exists()).toBe(true)
    })
  })

  describe('message selection', () => {
    it('shows message options', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.findAll('.b-form-select').at(0)
      expect(select.text()).toContain('OFFER: Sofa')
    })

    it('message select is disabled', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.findAll('.b-form-select').at(0)
      expect(select.attributes('disabled')).toBeDefined()
    })
  })

  describe('user selection', () => {
    it('shows user options', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.findAll('.b-form-select').at(1)
      expect(select.text()).toContain('John Smith')
    })

    it('user select is disabled', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.findAll('.b-form-select').at(1)
      expect(select.attributes('disabled')).toBeDefined()
    })
  })

  describe('tryst handling', () => {
    it('shows tryst section when tryst exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="calendar-alt"]').exists()).toBe(true)
    })

    it('shows tryst date', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.date-formatted').exists()).toBe(true)
    })

    it('shows cancel handover checkbox', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Cancel handover')
    })

    it('hides tryst section when no tryst', async () => {
      mockTrystStore.getByUser.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="calendar-alt"]').exists()).toBe(false)
    })
  })

  describe('user ratings', () => {
    it('shows UserRatings component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
    })

    it('passes correct user id to ratings', async () => {
      const wrapper = await createWrapper({ selectedUser: 100 })
      const ratings = wrapper.find('.user-ratings')
      expect(ratings.attributes('data-id')).toBe('100')
    })
  })

  describe('footer buttons', () => {
    it('shows Cancel button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('shows Unpromise button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Unpromise')
    })
  })

  describe('renege action', () => {
    it('calls messageStore.renege on Unpromise click', async () => {
      const wrapper = await createWrapper()
      const unpromiseBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Unpromise'))
      await unpromiseBtn.trigger('click')
      await flushPromises()
      expect(mockMessageStore.renege).toHaveBeenCalled()
    })

    it('deletes tryst when removeTryst is checked', async () => {
      const wrapper = await createWrapper()
      const unpromiseBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Unpromise'))
      await unpromiseBtn.trigger('click')
      await flushPromises()
      expect(mockTrystStore.delete).toHaveBeenCalledWith(500)
    })
  })

  describe('data fetching', () => {
    it('fetches trysts on mount', async () => {
      await createWrapper()
      expect(mockTrystStore.fetch).toHaveBeenCalled()
    })
  })

  describe('multiple messages', () => {
    it('shows choose prompt for multiple messages', async () => {
      const wrapper = await createWrapper({
        messages: [1, 2],
        selectedMessage: 0,
      })
      const select = wrapper.findAll('.b-form-select').at(0)
      expect(select.text()).toContain('Please choose')
    })
  })

  describe('multiple users', () => {
    it('shows choose prompt for multiple users', async () => {
      const wrapper = await createWrapper({
        users: mockUsers,
        selectedUser: 0,
      })
      const select = wrapper.findAll('.b-form-select').at(1)
      expect(select.text()).toContain('Please choose')
    })
  })
})
