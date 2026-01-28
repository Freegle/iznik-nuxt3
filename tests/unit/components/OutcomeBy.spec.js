import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import OutcomeBy from '~/components/OutcomeBy.vue'

const { mockMessage } = vi.hoisted(() => {
  return {
    mockMessage: {
      id: 1,
      subject: 'OFFER: Sofa',
      by: { userid: 100, displayname: 'Jane Doe', count: 1 },
      replies: [
        { userid: 100, displayname: 'Jane Doe' },
        { userid: 200, displayname: 'Bob Smith' },
      ],
      promises: [],
    },
  }
})

const mockMessageStore = {
  fetch: vi.fn().mockResolvedValue(mockMessage),
  byId: vi.fn().mockReturnValue(mockMessage),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue({ id: 100, displayname: 'Jane Doe' }),
  byId: vi.fn().mockReturnValue({ id: 100, displayname: 'Jane Doe' }),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('OutcomeBy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.fetch.mockResolvedValue(mockMessage)
    mockMessageStore.byId.mockReturnValue(mockMessage)
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(OutcomeBy, {
                type: 'Taken',
                availablenow: 1,
                msgid: 1,
                left: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          UserRatings: {
            template: '<div class="user-ratings" :data-id="id" />',
            props: ['id', 'size'],
          },
          NumberIncrementDecrement: {
            template:
              '<div class="number-increment" :data-value="modelValue" @click="$emit(\'update:modelValue\', modelValue + 1)"><slot /></div>',
            props: [
              'modelValue',
              'label',
              'labelSROnly',
              'appendText',
              'min',
              'max',
            ],
            emits: ['update:modelValue'],
          },
          'b-form-select': {
            template:
              '<select class="b-form-select" :value="modelValue" @change="$emit(\'update:modelValue\', parseInt($event.target.value))"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text || opt.html }}</option></select>',
            props: ['modelValue', 'options', 'size', 'state'],
            emits: ['update:modelValue'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders outcome by container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.layout').exists()).toBe(true)
    })

    it('shows please tell us label for single item', async () => {
      const wrapper = await createWrapper({ availablenow: 1 })
      expect(wrapper.text()).toContain('Please tell us who took this item')
    })

    it('shows selected user name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Jane Doe')
    })

    it('shows user ratings', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
    })
  })

  describe('user selection dropdown', () => {
    it('renders user select dropdown', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-form-select').exists()).toBe(true)
    })

    it('includes available users in dropdown', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.find('.b-form-select')
      expect(select.text()).toContain('Bob Smith')
    })

    it('includes Someone else option', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.find('.b-form-select')
      expect(select.text()).toContain('Someone else')
    })
  })

  describe('multiple items', () => {
    it('shows split message for multiple items', async () => {
      const wrapper = await createWrapper({ availablenow: 3, left: 3 })
      expect(wrapper.text()).toContain('split these between several people')
    })

    it('shows Number taken control for multiple items', async () => {
      const wrapper = await createWrapper({ availablenow: 3, left: 3 })
      expect(wrapper.find('.number-increment').exists()).toBe(true)
    })

    it('hides took control for single item', async () => {
      const wrapper = await createWrapper({ availablenow: 1, left: 1 })
      const tookControl = wrapper.find('.took')
      expect(tookControl.classes()).toContain('d-none')
    })

    it('shows Other people option for multiple items', async () => {
      const wrapper = await createWrapper({ availablenow: 3, left: 3 })
      const select = wrapper.find('.b-form-select')
      expect(select.text()).toContain('Other people')
    })
  })

  describe('error states', () => {
    it('applies error styling when chooseError is true', async () => {
      const wrapper = await createWrapper({ chooseError: true })
      expect(wrapper.find('.text-danger').exists()).toBe(true)
    })

    it('shows invalid feedback when invalid is true', async () => {
      const wrapper = await createWrapper({ invalid: true })
      expect(wrapper.text()).toContain('Please select someone')
    })
  })

  describe('emitted events', () => {
    it('emits tookUsers immediately', async () => {
      const wrapper = await createWrapper()
      const innerComponent = wrapper.findComponent(OutcomeBy)
      expect(innerComponent.emitted('tookUsers')).toBeTruthy()
    })

    it('emits tookUsers with initial user', async () => {
      const wrapper = await createWrapper()
      const innerComponent = wrapper.findComponent(OutcomeBy)
      const emitted = innerComponent.emitted('tookUsers')
      expect(emitted[0][0]).toEqual(
        expect.arrayContaining([expect.objectContaining({ userid: 100 })])
      )
    })
  })

  describe('data fetching', () => {
    it('fetches message on mount', async () => {
      await createWrapper()
      expect(mockMessageStore.fetch).toHaveBeenCalledWith(1)
    })

    it('does not fetch when msgid is 0', async () => {
      mockMessageStore.fetch.mockClear()
      await createWrapper({ msgid: 0 })
      expect(mockMessageStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('takenBy prop', () => {
    it('includes takenBy user in selected users', async () => {
      const wrapper = await createWrapper({
        takenBy: { userid: 300, displayname: 'Charlie Brown' },
      })
      expect(wrapper.text()).toContain('Charlie Brown')
    })
  })

  describe('responsive display', () => {
    it('has desktop user ratings', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.d-none.d-md-block .user-ratings').exists()).toBe(
        true
      )
    })

    it('has mobile user ratings', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.d-block.d-md-none .user-ratings').exists()).toBe(
        true
      )
    })

    it('has desktop select dropdown', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.d-none.d-md-block .b-form-select').exists()).toBe(
        true
      )
    })

    it('has mobile select dropdown', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.d-block.d-md-none .b-form-select').exists()).toBe(
        true
      )
    })
  })

  describe('help text', () => {
    it('shows reliability help text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('helps us identify reliable freeglers')
    })

    it('shows come back later message for multiple items', async () => {
      const wrapper = await createWrapper({ availablenow: 3, left: 3 })
      expect(wrapper.text()).toContain('save and come back later')
    })

    it('does not show come back later for single item', async () => {
      const wrapper = await createWrapper({ availablenow: 1, left: 1 })
      expect(wrapper.text()).not.toContain('save and come back later')
    })
  })
})
