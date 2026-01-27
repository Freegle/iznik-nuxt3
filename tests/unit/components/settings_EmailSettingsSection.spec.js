import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EmailSettingsSection from '~/components/settings/EmailSettingsSection.vue'

const { mockMe, mockMyGroups } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMe: ref({
      id: 123,
      settings: {
        simplemail: 'Full',
        notifications: {
          email: true,
          emailmine: false,
          push: true,
          facebook: true,
        },
        notificationmails: true,
        engagement: true,
      },
      relevantallowed: true,
      newslettersallowed: true,
    }),
    mockMyGroups: ref([
      {
        id: 1,
        nameshort: 'testgroup',
        namedisplay: 'Test Group',
        profile: 'https://example.com/group.jpg',
        role: 'Member',
        emailfrequency: 24,
        eventsallowed: true,
        volunteeringallowed: true,
      },
    ]),
  }
})

const mockSaveAndGet = vi.fn()
const mockSetGroup = vi.fn()
const mockLeaveGroup = vi.fn()

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myGroups: mockMyGroups,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveAndGet: mockSaveAndGet,
    setGroup: mockSetGroup,
    leaveGroup: mockLeaveGroup,
  }),
}))

describe('EmailSettingsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = {
      id: 123,
      settings: {
        simplemail: 'Full',
        notifications: {
          email: true,
          emailmine: false,
          push: true,
          facebook: true,
        },
        notificationmails: true,
        engagement: true,
      },
      relevantallowed: true,
      newslettersallowed: true,
    }
    mockMyGroups.value = [
      {
        id: 1,
        nameshort: 'testgroup',
        namedisplay: 'Test Group',
        profile: 'https://example.com/group.jpg',
        role: 'Member',
        emailfrequency: 24,
        eventsallowed: true,
        volunteeringallowed: true,
      },
    ]
  })

  function createWrapper() {
    return mount(EmailSettingsSection, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue'],
          },
          'b-form-select-option': {
            template: '<option :value="value"><slot /></option>',
            props: ['value'],
          },
          'b-img': {
            template: '<img :src="src" class="b-img" />',
            props: ['src', 'lazy', 'rounded', 'thumbnail'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          SettingsGroup: {
            template:
              '<div class="settings-group" :data-groupid="groupid" @leave="$emit(\'leave\')" />',
            props: [
              'groupid',
              'leave',
              'emailfrequency',
              'eventshide',
              'volunteerhide',
              'label',
            ],
            emits: ['leave', 'update:emailfrequency'],
          },
          SettingsEmailInfo: {
            template: '<div class="settings-email-info" />',
            props: ['simpleEmailSetting'],
          },
          OurToggle: {
            template:
              '<div class="our-toggle" :data-checked="modelValue" @click="$emit(\'change\', !modelValue)" />',
            props: ['modelValue', 'width', 'sync', 'labels', 'color'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('renders section header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('displays Email Settings title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Email Settings')
    })

    it('renders envelope icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="envelope"]').exists()).toBe(true)
    })

    it('renders section content when myGroups exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-content').exists()).toBe(true)
    })

    it('renders message when no groups', async () => {
      mockMyGroups.value = null
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain(
        "You're not a member of any communities yet"
      )
    })
  })

  describe('simple settings view', () => {
    it('renders simple settings by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.email-select').exists()).toBe(true)
    })

    it('renders email level label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Email level:')
    })

    it('renders email level dropdown', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('select').exists()).toBe(true)
    })

    it('renders three email level options', () => {
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')
      expect(options.length).toBe(3)
    })

    it('has Off option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('option[value="None"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Off')
    })

    it('has Basic option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('option[value="Basic"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Basic')
    })

    it('has Standard option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('option[value="Full"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Standard')
    })

    it('renders Show advanced settings button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.link-btn').exists()).toBe(true)
      expect(wrapper.text()).toContain('Show advanced settings')
    })

    it('renders SettingsGroup component when not None', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-group').exists()).toBe(true)
    })

    it('renders SettingsEmailInfo component when not None', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-email-info').exists()).toBe(true)
    })
  })

  describe('no email notifications warning', () => {
    it('shows warning when simpleEmailSettingLocal is None', async () => {
      const wrapper = createWrapper()
      wrapper.vm.simpleEmailSettingLocal = 'None'
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message.danger').exists()).toBe(true)
    })

    it('shows warning message about checking chats', async () => {
      const wrapper = createWrapper()
      wrapper.vm.simpleEmailSettingLocal = 'None'
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain("You won't get email notifications")
      expect(wrapper.text()).toContain('Check')
      expect(wrapper.text()).toContain('regularly')
    })

    it('has link to chats page', async () => {
      const wrapper = createWrapper()
      wrapper.vm.simpleEmailSettingLocal = 'None'
      await wrapper.vm.$nextTick()
      const link = wrapper.find('a[href="/chats"]')
      expect(link.exists()).toBe(true)
    })

    it('does not show warning when email is Full', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message.danger').exists()).toBe(false)
    })
  })

  describe('empty groups message', () => {
    it('shows join message when no groups', async () => {
      mockMyGroups.value = []
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain(
        'Join a community to set email preferences'
      )
    })
  })

  describe('advanced settings view', () => {
    it('shows advanced settings when toggled', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.advanced-options').exists()).toBe(true)
    })

    it('shows group settings when advanced', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.group-settings').exists()).toBe(true)
    })

    it('renders group header with link', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.group-header').exists()).toBe(true)
      expect(wrapper.find('.group-link').exists()).toBe(true)
    })

    it('shows group name', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Test Group')
    })

    it('shows crown icon for moderators', async () => {
      mockMyGroups.value = [{ ...mockMyGroups.value[0], role: 'Moderator' }]
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.v-icon[data-icon="crown"]').exists()).toBe(true)
    })

    it('does not show crown icon for members', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-icon').exists()).toBe(false)
    })
  })

  describe('advanced options toggles', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('renders email replies toggle', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Email me replies to my posts')
    })

    it('renders sent messages copy toggle', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Copy of my sent messages')
    })

    it('renders chitchat toggle', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('ChitChat & notifications')
    })

    it('renders suggested posts toggle', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Suggested posts for you')
    })

    it('renders newsletters toggle', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Newsletters & stories')
    })

    it('renders encouragement toggle', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Encouragement emails')
    })

    it('renders admin note', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAdvanced = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain(
        'We may occasionally send important admin emails'
      )
    })
  })

  describe('computed properties', () => {
    describe('simpleEmailSetting', () => {
      it('returns Full by default', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.simpleEmailSetting).toBe('Full')
      })

      it('returns value from me.value.settings.simplemail', () => {
        const wrapper = createWrapper()
        mockMe.value = {
          ...mockMe.value,
          settings: {
            ...mockMe.value.settings,
            simplemail: 'Basic',
          },
        }
        expect(wrapper.vm.simpleEmailSetting).toBe('Basic')
      })

      it('returns Full when simplemail is not set', () => {
        const wrapper = createWrapper()
        mockMe.value = {
          ...mockMe.value,
          settings: {
            ...mockMe.value.settings,
            simplemail: null,
          },
        }
        expect(wrapper.vm.simpleEmailSetting).toBe('Full')
      })
    })

    describe('notificationSettings', () => {
      it('returns default notification settings', () => {
        mockMe.value.settings.notifications = null
        const wrapper = createWrapper()
        expect(wrapper.vm.notificationSettings.email).toBe(true)
        expect(wrapper.vm.notificationSettings.emailmine).toBe(false)
      })

      it('returns user notification settings', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.notificationSettings.email).toBe(true)
        expect(wrapper.vm.notificationSettings.emailmine).toBe(false)
      })
    })

    describe('notificationmails', () => {
      it('returns true when enabled', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.notificationmails).toBe(true)
      })

      it('returns false when disabled', async () => {
        mockMe.value.settings.notificationmails = false
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.notificationmails).toBe(false)
      })
    })

    describe('relevantallowed', () => {
      it('returns true when enabled', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.relevantallowed).toBe(true)
      })

      it('returns false when disabled', async () => {
        mockMe.value.relevantallowed = false
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.relevantallowed).toBe(false)
      })
    })

    describe('newslettersallowed', () => {
      it('returns true when enabled', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.newslettersallowed).toBe(true)
      })

      it('returns false when disabled', async () => {
        mockMe.value.newslettersallowed = false
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.newslettersallowed).toBe(false)
      })
    })

    describe('simpleSettings', () => {
      it('returns true when simplemail is set', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.simpleSettings).toBe(true)
      })

      it('returns true when all groups have same settings and simplemail is null', () => {
        const wrapper = createWrapper()
        mockMe.value = {
          ...mockMe.value,
          settings: {
            ...mockMe.value.settings,
            simplemail: null,
          },
        }
        mockMyGroups.value = [
          {
            id: 1,
            emailfrequency: 24,
            eventsallowed: true,
            volunteeringallowed: true,
          },
          {
            id: 2,
            emailfrequency: 24,
            eventsallowed: true,
            volunteeringallowed: true,
          },
        ]
        expect(wrapper.vm.simpleSettings).toBe(true)
      })

      it('returns false when groups have different settings and simplemail is null', () => {
        const wrapper = createWrapper()
        mockMe.value = {
          ...mockMe.value,
          settings: {
            ...mockMe.value.settings,
            simplemail: null,
          },
        }
        mockMyGroups.value = [
          {
            id: 1,
            emailfrequency: 24,
            eventsallowed: true,
            volunteeringallowed: true,
          },
          {
            id: 2,
            emailfrequency: 0,
            eventsallowed: true,
            volunteeringallowed: true,
          },
        ]
        expect(wrapper.vm.simpleSettings).toBe(false)
      })
    })
  })

  describe('methods', () => {
    describe('toggleAdvanced', () => {
      it('toggles showAdvanced', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.showAdvanced).toBe(false)
        wrapper.vm.toggleAdvanced({ preventDefault: vi.fn() })
        expect(wrapper.vm.showAdvanced).toBe(true)
      })

      it('prevents default event', () => {
        const wrapper = createWrapper()
        const mockEvent = { preventDefault: vi.fn() }
        wrapper.vm.toggleAdvanced(mockEvent)
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })

    describe('changeNotification', () => {
      it('calls saveAndGet with email setting', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNotification(false, 'email')
        expect(mockSaveAndGet).toHaveBeenCalled()
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNotification(false, 'email')
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('changeRelevant', () => {
      it('calls saveAndGet with relevantallowed', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeRelevant(false)
        expect(mockSaveAndGet).toHaveBeenCalledWith({ relevantallowed: false })
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeRelevant(false)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('changeNotifChitchat', () => {
      it('calls saveAndGet with settings', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNotifChitchat(false)
        expect(mockSaveAndGet).toHaveBeenCalled()
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNotifChitchat(false)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('changeNewsletter', () => {
      it('calls saveAndGet with newslettersallowed', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNewsletter(false)
        expect(mockSaveAndGet).toHaveBeenCalledWith({
          newslettersallowed: false,
        })
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNewsletter(false)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('changeEngagement', () => {
      it('calls saveAndGet with engagement setting', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeEngagement(false)
        expect(mockSaveAndGet).toHaveBeenCalled()
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeEngagement(false)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('leaveGroup', () => {
      it('calls authStore.leaveGroup', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.leaveGroup(1)
        expect(mockLeaveGroup).toHaveBeenCalledWith(123, 1)
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.leaveGroup(1)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('changeAllGroups', () => {
      it('calls setGroup for each group', async () => {
        mockMyGroups.value = [
          { id: 1, emailfrequency: 24 },
          { id: 2, emailfrequency: 24 },
        ]
        const wrapper = createWrapper()
        await wrapper.vm.changeAllGroups('emailfrequency', 0)
        expect(mockSetGroup).toHaveBeenCalledTimes(2)
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeAllGroups('emailfrequency', 0)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })
  })

  describe('reactive state', () => {
    it('initializes showAdvanced as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showAdvanced).toBe(false)
    })

    it('initializes simpleEmailSettingLocal from me', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.simpleEmailSettingLocal).toBe('Full')
    })

    it('initializes notification settings local', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.notificationSettingsLocal.email).toBe(true)
    })
  })

  describe('watch', () => {
    it('updates local values when me changes', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.relevantallowedLocal).toBe(true)

      mockMe.value = {
        ...mockMe.value,
        relevantallowed: false,
      }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.relevantallowedLocal).toBe(false)
    })
  })
})
