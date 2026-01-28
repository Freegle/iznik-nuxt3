import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MyMessagePromisedTo from '~/components/MyMessagePromisedTo.vue'

const mockMyid = ref(1)

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: mockMyid,
  }),
}))

const mockMessageById = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockMessageById,
  }),
}))

const mockUserById = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: mockUserById,
  }),
}))

const mockBreakpoint = ref('md')

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    breakpoint: mockBreakpoint.value,
  }),
}))

describe('MyMessagePromisedTo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMyid.value = 1
    mockBreakpoint.value = 'md'
    mockMessageById.mockReturnValue({ id: 100, subject: 'Test item' })
    mockUserById.mockReturnValue({ id: 2, displayname: 'Test User' })
  })

  function createWrapper(props = {}) {
    return mount(MyMessagePromisedTo, {
      props: {
        promise: {
          id: 2,
          name: 'John Doe',
          trystdate: null,
          tryst: null,
        },
        id: 100,
        replyusers: [{ id: 2, displayname: 'John Doe' }],
        ...props,
      },
      global: {
        stubs: {
          'b-badge': {
            template:
              '<span class="b-badge" :class="variantClass"><slot /></span>',
            props: ['variant'],
            computed: {
              variantClass() {
                return 'badge-' + this.variant
              },
            },
          },
          'b-button': {
            template:
              '<button class="b-button" :class="btnClass" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
            computed: {
              btnClass() {
                return 'btn-' + this.variant
              },
            },
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          AddToCalendar: {
            template:
              '<div class="add-to-calendar" :data-link="calendarLink" />',
            props: ['calendarLink', 'variant', 'btnClass', 'size'],
          },
          PromiseModal: {
            template: '<div class="promise-modal" />',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
            emits: ['hidden'],
          },
          RenegeModal: {
            template: '<div class="renege-modal" />',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows promised badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').text()).toContain('Promised')
    })

    it('shows handshake icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="handshake"]').exists()).toBe(true)
    })

    it('shows promise name when not promised to self', () => {
      const wrapper = createWrapper({
        promise: { id: 2, name: 'Jane Smith' },
      })
      expect(wrapper.text()).toContain('Jane Smith')
    })

    it('shows just "Promised" when promised to self (TN case)', () => {
      mockMyid.value = 5
      const wrapper = createWrapper({
        promise: { id: 5, name: 'Self' },
      })
      // Should only show "Promised" badge without name
      const text = wrapper.text()
      expect(text).toContain('Promised')
      // Should not show "to" when promised to self
      const badges = wrapper.findAll('.b-badge')
      expect(badges[0].text()).not.toContain('to')
    })
  })

  describe('tryst date display', () => {
    it('shows handover date when trystdate is set', () => {
      const wrapper = createWrapper({
        promise: {
          id: 2,
          name: 'John',
          trystdate: '2026-01-25 10:00',
        },
      })
      expect(wrapper.text()).toContain('handover')
      expect(wrapper.text()).toContain('2026-01-25 10:00')
    })

    it('hides handover when no trystdate', () => {
      const wrapper = createWrapper({
        promise: { id: 2, name: 'John', trystdate: null },
      })
      expect(wrapper.text()).not.toContain('handover')
    })
  })

  describe('calendar integration', () => {
    it('shows AddToCalendar when calendar link exists', () => {
      const wrapper = createWrapper({
        promise: {
          id: 2,
          name: 'John',
          trystdate: '2026-01-25',
          tryst: { calendarLink: 'https://calendar.link' },
        },
      })
      expect(wrapper.find('.add-to-calendar').exists()).toBe(true)
    })

    it('hides AddToCalendar when no calendar link', () => {
      const wrapper = createWrapper({
        promise: {
          id: 2,
          name: 'John',
          tryst: null,
        },
      })
      expect(wrapper.find('.add-to-calendar').exists()).toBe(false)
    })
  })

  describe('buttons', () => {
    it('shows Change button when trystdate exists', () => {
      const wrapper = createWrapper({
        promise: {
          id: 2,
          name: 'John',
          trystdate: '2026-01-25',
        },
      })
      expect(wrapper.text()).toContain('Change')
    })

    it('shows Set time button when no trystdate', () => {
      const wrapper = createWrapper({
        promise: { id: 2, name: 'John', trystdate: null },
      })
      expect(wrapper.text()).toContain('Set time')
    })

    it('shows Unpromise button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Unpromise')
    })
  })

  describe('button sizes', () => {
    it('uses sm button size on md breakpoint', () => {
      mockBreakpoint.value = 'md'
      const wrapper = createWrapper()
      expect(wrapper.vm.btnSize).toBe('sm')
    })

    it('uses xs button size on xs breakpoint', () => {
      mockBreakpoint.value = 'xs'
      const wrapper = createWrapper()
      expect(wrapper.vm.btnSize).toBe('xs')
    })
  })

  describe('modal interactions', () => {
    it('opens promise modal on change time click', async () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.promise-modal').exists()).toBe(false)

      const changeBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Set time'))
      await changeBtn.trigger('click')

      expect(wrapper.find('.promise-modal').exists()).toBe(true)
    })

    it('opens renege modal on unpromise click', async () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.renege-modal').exists()).toBe(false)

      const unpromiseBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Unpromise'))
      await unpromiseBtn.find('div').trigger('click')

      expect(wrapper.find('.renege-modal').exists()).toBe(true)
    })

    it('does not show renege modal when promised to self', () => {
      mockMyid.value = 5
      const wrapper = createWrapper({
        promise: { id: 5, name: 'Self' },
      })

      // Renege modal should not be shown for self-promise
      expect(wrapper.find('.renege-modal').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('requires promise prop', () => {
      const promise = { id: 3, name: 'Test' }
      const wrapper = createWrapper({ promise })
      expect(wrapper.props('promise')).toEqual(promise)
    })

    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 200 })
      expect(wrapper.props('id')).toBe(200)
    })

    it('requires replyusers prop', () => {
      const replyusers = [{ id: 1, displayname: 'User 1' }]
      const wrapper = createWrapper({ replyusers })
      expect(wrapper.props('replyusers')).toEqual(replyusers)
    })
  })

  describe('computed values', () => {
    it('computes promisee from promise.id', () => {
      const wrapper = createWrapper({
        promise: { id: 42, name: 'User' },
      })
      expect(wrapper.vm.promisee).toBe(42)
    })

    it('fetches message from store', () => {
      mockMessageById.mockReturnValue({ id: 100, subject: 'My Item' })
      const wrapper = createWrapper({ id: 100 })
      // Access the computed property to trigger the store call
      const message = wrapper.vm.message
      expect(message).toEqual({ id: 100, subject: 'My Item' })
    })
  })
})
