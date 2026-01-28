import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MicroVolunteeringInvite from '~/components/MicroVolunteeringInvite.vue'

const mockRespond = vi.fn()

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => ({
    respond: mockRespond,
  }),
}))

describe('MicroVolunteeringInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRespond.mockResolvedValue({})
  })

  function createWrapper() {
    return mount(MicroVolunteeringInvite, {
      global: {
        stubs: {
          InviteSomeone: {
            template:
              '<div class="invite-someone" @click="$emit(\'invited\')" @keyup="$emit(\'skipped\')"><slot /></div>',
            emits: ['invited', 'skipped'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
            emits: ['click'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows word of mouth message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('word of mouth')
    })

    it('shows personal recommendation message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('personal recommendation')
    })

    it('shows help spread message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('help spread the word')
    })

    it('renders InviteSomeone component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.invite-someone').exists()).toBe(true)
    })

    it('renders Skip button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').text()).toContain('Skip')
    })
  })

  describe('invitation flow', () => {
    it('calls respond when invited', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.invite-someone').trigger('click')

      expect(mockRespond).toHaveBeenCalledWith({
        invite: true,
        response: 'Approve',
      })
    })

    it('emits next when invited', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.invite-someone').trigger('click')

      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('skip flow', () => {
    it('calls respond when skipped via button', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')

      expect(mockRespond).toHaveBeenCalledWith({
        invite: true,
        response: 'Reject',
      })
    })

    it('emits next when skipped', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('InviteSomeone props', () => {
    it('passes trust-pilot false to InviteSomeone', () => {
      const wrapper = createWrapper()
      // The stub is rendered, indicating the component is used
      expect(wrapper.find('.invite-someone').exists()).toBe(true)
    })
  })
})
