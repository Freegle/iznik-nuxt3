import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsGroup from '~/components/SettingsGroup.vue'

const mockAuthStore = {
  user: { id: 1 },
  setGroup: vi.fn().mockResolvedValue(undefined),
}

const mockMyGroups = [
  {
    id: 123,
    emailfrequency: 24,
    eventsallowed: 1,
    volunteeringallowed: 1,
  },
]

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroups: { value: mockMyGroups },
  }),
}))

describe('SettingsGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.user = { id: 1 }
    mockMyGroups[0] = {
      id: 123,
      emailfrequency: 24,
      eventsallowed: 1,
      volunteeringallowed: 1,
    }
  })

  function createWrapper(props = {}) {
    return mount(SettingsGroup, {
      props: {
        groupid: 123,
        ...props,
      },
      global: {
        stubs: {
          OurToggle: {
            template:
              '<button class="our-toggle" :data-model-value="modelValue" @click="$emit(\'update:modelValue\', !modelValue)"><slot /></button>',
            props: ['modelValue', 'size', 'labels'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label'],
          },
          'b-form-select': {
            template:
              '<select class="b-form-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings-group container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-group').exists()).toBe(true)
    })

    it('renders email frequency select', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-select').exists()).toBe(true)
    })

    it('displays default label for email frequency', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.setting-label').text()).toBe('OFFER/WANTED emails')
    })

    it('displays custom label when provided', () => {
      const wrapper = createWrapper({ label: 'Custom Label' })
      expect(wrapper.find('.setting-label').text()).toBe('Custom Label')
    })

    it('renders community events toggle by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Community events')
    })

    it('renders volunteer opportunities toggle by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Volunteer opportunities')
    })

    it('hides events toggle when eventshide is true', () => {
      const wrapper = createWrapper({ eventshide: true })
      expect(wrapper.text()).not.toContain('Community events')
    })

    it('hides volunteer toggle when volunteerhide is true', () => {
      const wrapper = createWrapper({ volunteerhide: true })
      expect(wrapper.text()).not.toContain('Volunteer opportunities')
    })

    it('shows leave button when leave prop is true', () => {
      const wrapper = createWrapper({ leave: true })
      const leaveBtn = wrapper.find('.spin-button')
      expect(leaveBtn.exists()).toBe(true)
      expect(leaveBtn.text()).toContain('Leave this community')
    })

    it('hides leave button when leave prop is false', () => {
      const wrapper = createWrapper({ leave: false })
      expect(wrapper.text()).not.toContain('Leave this community')
    })
  })

  describe('computed emailfreq', () => {
    it('returns membership emailfrequency as string', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.emailfreq).toBe('24')
    })

    it('returns emailfrequency prop when no membership', () => {
      mockMyGroups.length = 0
      const wrapper = createWrapper({ emailfrequency: -1 })
      expect(wrapper.vm.emailfreq).toBe('-1')
    })
  })

  describe('computed eventsallowed', () => {
    it('returns true when membership.eventsallowed is 1', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.eventsallowed).toBe(true)
    })

    it('returns false when membership.eventsallowed is 0', () => {
      mockMyGroups[0].eventsallowed = 0
      const wrapper = createWrapper()
      expect(wrapper.vm.eventsallowed).toBe(false)
    })
  })

  describe('computed volunteeringallowed', () => {
    it('returns true when membership.volunteeringallowed is 1', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.volunteeringallowed).toBe(true)
    })

    it('returns false when membership.volunteeringallowed is 0', () => {
      mockMyGroups[0].volunteeringallowed = 0
      const wrapper = createWrapper()
      expect(wrapper.vm.volunteeringallowed).toBe(false)
    })
  })

  describe('computed highlightEmailFrequencyIfOn', () => {
    it('returns frequency-on when emailfrequency is not 0', () => {
      const wrapper = createWrapper({ emailfrequency: 24 })
      expect(wrapper.vm.highlightEmailFrequencyIfOn).toBe('frequency-on')
    })

    it('returns frequency-off when emailfrequency is 0', () => {
      const wrapper = createWrapper({ emailfrequency: 0 })
      expect(wrapper.vm.highlightEmailFrequencyIfOn).toBe('frequency-off')
    })
  })

  describe('emits', () => {
    it('emits leave when leave button is clicked', async () => {
      const wrapper = createWrapper({ leave: true })
      await wrapper.find('.spin-button').trigger('click')
      expect(wrapper.emitted('leave')).toBeTruthy()
    })

    it('emits update:emailfrequency when email frequency changes', async () => {
      const wrapper = createWrapper()
      wrapper.vm.emailfreq = '0'
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:emailfrequency')).toBeTruthy()
    })
  })

  describe('changeValue method', () => {
    it('calls authStore.setGroup with correct params', async () => {
      const wrapper = createWrapper()
      wrapper.vm.emailfreq = '0'
      await wrapper.vm.$nextTick()

      expect(mockAuthStore.setGroup).toHaveBeenCalledWith({
        userid: 1,
        groupid: 123,
        emailfrequency: 0,
      })
    })

    it('does not call setGroup when no groupid', async () => {
      const wrapper = createWrapper({ groupid: null })
      wrapper.vm.emailfreq = '0'
      await wrapper.vm.$nextTick()

      expect(mockAuthStore.setGroup).not.toHaveBeenCalled()
    })
  })

  describe('membershipMT prop', () => {
    it('uses membershipMT when provided', () => {
      const mtMembership = {
        emailfrequency: -1,
        eventsallowed: 0,
        volunteeringallowed: 0,
      }
      const wrapper = createWrapper({ membershipMT: mtMembership })
      expect(wrapper.vm.emailfreq).toBe('-1')
    })
  })
})
