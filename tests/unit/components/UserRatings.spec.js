import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import UserRatings from '~/components/UserRatings.vue'

const mockFetch = vi.fn()
const mockRate = vi.fn()
const mockById = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    fetch: mockFetch,
    rate: mockRate,
    byId: mockById,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: ref(100),
  }),
}))

describe('UserRatings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({})
    mockRate.mockResolvedValue({})
    mockById.mockReturnValue({
      id: 1,
      displayname: 'Test User',
      info: {
        ratings: {
          Up: 5,
          Down: 2,
          Mine: null,
        },
      },
    })
  })

  function createWrapper(props = {}) {
    return mount(UserRatings, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :disabled="disabled" :class="[variant, { mine: $attrs.class?.mine }]" @click="$emit(\'click\')"><slot /></button>',
            props: ['size', 'variant', 'disabled'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
          UserRatingsDownModal: {
            template: '<div class="down-modal" />',
            props: ['id'],
            emits: ['rated'],
          },
          UserRatingsRemoveModal: {
            template: '<div class="remove-modal" />',
            props: ['id'],
            emits: ['rated'],
          },
        },
        directives: {
          'b-tooltip': {},
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders thumbs up and down buttons', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('button')).toHaveLength(2)
    })

    it('displays rating counts', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('2')
    })

    it('shows thumbs up icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="thumbs-up"]').exists()).toBe(true)
    })

    it('shows thumbs down icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="thumbs-down"]').exists()).toBe(true)
    })

    it('shows user name when showName is true', () => {
      const wrapper = createWrapper({ showName: true })
      expect(wrapper.text()).toContain('Test User')
    })

    it('hides user name by default', () => {
      const wrapper = createWrapper({ showName: false })
      expect(wrapper.text()).not.toContain('Test User')
    })
  })

  describe('button variants', () => {
    it('uses primary variant when Up > 0', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons[0].classes()).toContain('primary')
    })

    it('uses warning variant when Down > 0', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons[1].classes()).toContain('warning')
    })

    it('uses white variant when counts are 0', () => {
      mockById.mockReturnValue({
        id: 1,
        info: { ratings: { Up: 0, Down: 0, Mine: null } },
      })
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons[0].classes()).toContain('white')
      expect(buttons[1].classes()).toContain('white')
    })
  })

  describe('disabled state', () => {
    it('disables buttons when disabled prop is true', () => {
      const wrapper = createWrapper({ disabled: true })
      const buttons = wrapper.findAll('button')
      expect(buttons[0].attributes('disabled')).toBeDefined()
      expect(buttons[1].attributes('disabled')).toBeDefined()
    })

    it('disables buttons when viewing own ratings', () => {
      mockById.mockReturnValue({
        id: 100, // Same as myid
        info: { ratings: { Up: 0, Down: 0, Mine: null } },
      })
      const wrapper = createWrapper({ id: 100 })
      const buttons = wrapper.findAll('button')
      expect(buttons[0].attributes('disabled')).toBeDefined()
    })
  })

  describe('rating actions', () => {
    const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() }

    it('calls rate with Up when thumbs up clicked', async () => {
      const wrapper = createWrapper()
      // Call the method directly since click.stop needs proper event
      await wrapper.vm.up(mockEvent)
      expect(mockRate).toHaveBeenCalledWith(1, 'Up', undefined, undefined)
    })

    it('shows down modal when thumbs down clicked', async () => {
      const wrapper = createWrapper()
      // Call the method directly since click.stop needs proper event
      await wrapper.vm.down(mockEvent)
      expect(wrapper.vm.showDown).toBe(true)
    })

    it('shows remove modal when clicking already rated up', async () => {
      mockById.mockReturnValue({
        id: 1,
        info: { ratings: { Up: 1, Down: 0, Mine: 'Up' } },
      })
      const wrapper = createWrapper()
      // Call the method directly since click.stop needs proper event
      await wrapper.vm.up(mockEvent)
      expect(wrapper.vm.showRemove).toBe(true)
    })
  })

  describe('external modals', () => {
    const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() }

    it('emits show-down-modal when externalModals is true', async () => {
      const wrapper = createWrapper({ externalModals: true })
      // Call the method directly since click.stop needs proper event
      await wrapper.vm.down(mockEvent)
      expect(wrapper.emitted('show-down-modal')).toBeTruthy()
      expect(wrapper.emitted('show-down-modal')[0]).toEqual([1])
    })

    it('emits modal-opening before showing modal', async () => {
      const wrapper = createWrapper({ externalModals: true })
      // Call the method directly since click.stop needs proper event
      await wrapper.vm.down(mockEvent)
      expect(wrapper.emitted('modal-opening')).toBeTruthy()
    })
  })

  describe('size prop', () => {
    it.each(['sm', 'md', 'lg'])('accepts %s size', (size) => {
      const wrapper = createWrapper({ size })
      expect(wrapper.props('size')).toBe(size)
    })
  })

  describe('fetches user data', () => {
    it('fetches user on mount', () => {
      createWrapper({ id: 42 })
      expect(mockFetch).toHaveBeenCalledWith(42)
    })
  })
})
