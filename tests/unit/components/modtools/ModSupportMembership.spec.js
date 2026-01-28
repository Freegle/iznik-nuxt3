/* eslint-disable no-template-curly-in-string */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMockMemberStore } from '../../mocks/stores'
import ModSupportMembership from '~/modtools/components/ModSupportMembership.vue'

// Create mock store instance
const mockMemberStore = createMockMemberStore()

// Mock the store import
vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

// Mock useModMe composable
const mockCheckWork = vi.fn()
vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    checkWork: mockCheckWork,
  }),
}))

describe('ModSupportMembership', () => {
  const createMembership = (overrides = {}) => ({
    id: 100, // groupid
    membershipid: 200,
    nameshort: 'TestGroup',
    added: '2024-01-15T10:00:00Z',
    role: 'Member',
    emailfrequency: -1,
    ourpostingstatus: 'DEFAULT',
    eventsallowed: 1,
    volunteeringallowed: 1,
    ...overrides,
  })

  const defaultProps = {
    membership: createMembership(),
    userid: 456,
  }

  function mountComponent(props = {}) {
    return mount(ModSupportMembership, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /><slot name="body" /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'md'],
          },
          'b-form-group': {
            template:
              '<div class="form-group" :data-label="label"><slot /></div>',
            props: ['label'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value); $emit(\'change\', $event.target.value)"><slot /></select>',
            props: ['modelValue'],
          },
          'v-icon': {
            template:
              '<i :class="[`icon-${icon}`, $attrs.class]" :title="title" />',
            props: ['icon', 'title'],
            inheritAttrs: false,
          },
          ModRole: {
            template:
              '<div class="mod-role" :data-userid="userid" :data-groupid="groupid" :data-role="role" />',
            props: ['userid', 'groupid', 'role'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :data-variant="variant" :data-label="label" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label'],
          },
          OurToggle: {
            template:
              '<div class="our-toggle" :data-value="modelValue" @click="$emit(\'change\', !modelValue)"><slot /></div>',
            props: [
              'modelValue',
              'height',
              'width',
              'fontSize',
              'sync',
              'labels',
              'variant',
            ],
          },
        },
        mocks: {
          datetimeshort: (val) => `short:${val}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMemberStore.update = vi.fn().mockResolvedValue({})
    mockMemberStore.remove = vi.fn().mockResolvedValue({})
  })

  describe('rendering', () => {
    it('displays the group name', () => {
      const wrapper = mountComponent({
        membership: createMembership({ nameshort: 'MyGroup' }),
      })
      expect(wrapper.text()).toContain('MyGroup')
    })

    it('displays the added date', () => {
      const wrapper = mountComponent({
        membership: createMembership({ added: '2024-06-01T12:00:00Z' }),
      })
      expect(wrapper.text()).toContain('short:2024-06-01T12:00:00Z')
    })
  })

  describe('role icons', () => {
    it('shows crown icon with warning color for Owner role', () => {
      const wrapper = mountComponent({
        membership: createMembership({ role: 'Owner' }),
      })
      const icon = wrapper.find('.icon-crown.text-warning')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('title')).toBe('Owner')
    })

    it('shows crown icon with info color for Moderator role', () => {
      const wrapper = mountComponent({
        membership: createMembership({ role: 'Moderator' }),
      })
      const icon = wrapper.find('.icon-crown.text-info')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('title')).toBe('Moderator')
    })

    it('shows user icon with success color for Member role', () => {
      const wrapper = mountComponent({
        membership: createMembership({ role: 'Member' }),
      })
      const icon = wrapper.find('.icon-user.text-success')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('title')).toBe('Member')
    })
  })

  describe('ModRole component', () => {
    it('passes correct props to ModRole', () => {
      const wrapper = mountComponent({
        membership: createMembership({ id: 789, role: 'Moderator' }),
        userid: 123,
      })
      const modRole = wrapper.find('.mod-role')
      expect(modRole.attributes('data-userid')).toBe('123')
      expect(modRole.attributes('data-groupid')).toBe('789')
      expect(modRole.attributes('data-role')).toBe('Moderator')
    })
  })

  describe('email frequency select', () => {
    it('shows all email frequency options', () => {
      const wrapper = mountComponent()
      const options = wrapper.findAll('select')[0].findAll('option')

      expect(options.length).toBe(7)
      expect(options[0].text()).toBe('Immediately')
      expect(options[1].text()).toBe('Every Hour')
      expect(options[2].text()).toBe('Every 2 Hours')
      expect(options[3].text()).toBe('Every 4 Hours')
      expect(options[4].text()).toBe('Every 8 Hours')
      expect(options[5].text()).toBe('Every day')
      expect(options[6].text()).toBe('Never')
    })

    it('has correct values for frequency options', () => {
      const wrapper = mountComponent()
      const options = wrapper.findAll('select')[0].findAll('option')

      expect(options[0].attributes('value')).toBe('-1')
      expect(options[1].attributes('value')).toBe('1')
      expect(options[2].attributes('value')).toBe('2')
      expect(options[3].attributes('value')).toBe('4')
      expect(options[4].attributes('value')).toBe('8')
      expect(options[5].attributes('value')).toBe('24')
      expect(options[6].attributes('value')).toBe('0')
    })
  })

  describe('posting status select', () => {
    it('shows all posting status options', () => {
      const wrapper = mountComponent()
      const options = wrapper.findAll('select')[1].findAll('option')

      expect(options.length).toBe(3)
      expect(options[0].text()).toBe('Moderated')
      expect(options[1].text()).toBe('Group Settings')
      expect(options[2].text()).toBe("Can't Post")
    })

    it('has correct values for posting status options', () => {
      const wrapper = mountComponent()
      const options = wrapper.findAll('select')[1].findAll('option')

      expect(options[0].attributes('value')).toBe('MODERATED')
      expect(options[1].attributes('value')).toBe('DEFAULT')
      expect(options[2].attributes('value')).toBe('PROHIBITED')
    })
  })

  describe('changeFrequency', () => {
    it('calls memberStore.update with correct params', async () => {
      const wrapper = mountComponent({
        membership: createMembership({
          id: 100,
          emailfrequency: 24,
        }),
        userid: 456,
      })

      await wrapper.vm.changeFrequency()

      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 100,
        emailfrequency: 24,
      })
    })

    it('updates when frequency select changes', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ emailfrequency: -1 }),
        userid: 456,
      })

      const select = wrapper.findAll('select')[0]
      await select.setValue('4')

      expect(mockMemberStore.update).toHaveBeenCalled()
    })
  })

  describe('changePostingStatus', () => {
    it('calls memberStore.update with correct params', async () => {
      const wrapper = mountComponent({
        membership: createMembership({
          id: 100,
          ourpostingstatus: 'MODERATED',
        }),
        userid: 456,
      })

      await wrapper.vm.changePostingStatus()

      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 100,
        ourpostingstatus: 'MODERATED',
      })
    })

    it('updates when posting status select changes', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ ourpostingstatus: 'DEFAULT' }),
        userid: 456,
      })

      const select = wrapper.findAll('select')[1]
      await select.setValue('PROHIBITED')

      expect(mockMemberStore.update).toHaveBeenCalled()
    })
  })

  describe('changeEvents', () => {
    it('calls memberStore.update with eventsallowed true', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ id: 100 }),
        userid: 456,
      })

      await wrapper.vm.changeEvents(true)

      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 100,
        eventsallowed: true,
      })
    })

    it('calls memberStore.update with eventsallowed false', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ id: 100 }),
        userid: 456,
      })

      await wrapper.vm.changeEvents(false)

      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 100,
        eventsallowed: false,
      })
    })
  })

  describe('changeVolunteering', () => {
    it('calls memberStore.update with volunteeringallowed true', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ id: 100 }),
        userid: 456,
      })

      await wrapper.vm.changeVolunteering(true)

      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 100,
        volunteeringallowed: true,
      })
    })

    it('calls memberStore.update with volunteeringallowed false', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ id: 100 }),
        userid: 456,
      })

      await wrapper.vm.changeVolunteering(false)

      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 100,
        volunteeringallowed: false,
      })
    })
  })

  describe('OurToggle components', () => {
    it('renders events toggle with correct label', () => {
      const wrapper = mountComponent()
      const formGroups = wrapper.findAll('.form-group')
      const eventsGroup = formGroups.find(
        (g) => g.attributes('data-label') === 'Community Event mails:'
      )
      expect(eventsGroup).toBeDefined()
    })

    it('renders volunteering toggle with correct label', () => {
      const wrapper = mountComponent()
      const formGroups = wrapper.findAll('.form-group')
      const volGroup = formGroups.find(
        (g) => g.attributes('data-label') === 'Volunteer Opportunity mails:'
      )
      expect(volGroup).toBeDefined()
    })

    it('events toggle reflects eventsallowed value', () => {
      const wrapper = mountComponent({
        membership: createMembership({ eventsallowed: 1 }),
      })
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles[0].attributes('data-value')).toBe('true')
    })

    it('events toggle reflects eventsallowed false value', () => {
      const wrapper = mountComponent({
        membership: createMembership({ eventsallowed: 0 }),
      })
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles[0].attributes('data-value')).toBe('false')
    })

    it('volunteering toggle reflects volunteeringallowed value', () => {
      const wrapper = mountComponent({
        membership: createMembership({ volunteeringallowed: 1 }),
      })
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles[1].attributes('data-value')).toBe('true')
    })
  })

  describe('remove function', () => {
    it('calls memberStore.remove with correct params', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          id: 100,
          membershipid: 200,
        }),
        userid: 456,
      })

      wrapper.vm.remove(() => {})

      expect(mockMemberStore.remove).toHaveBeenCalledWith(456, 100, 200)
    })

    it('emits fetchuser event', () => {
      const wrapper = mountComponent()
      wrapper.vm.remove(() => {})

      expect(wrapper.emitted('fetchuser')).toBeTruthy()
      expect(wrapper.emitted('fetchuser').length).toBe(1)
    })

    it('calls callback if provided', () => {
      const wrapper = mountComponent()
      const callback = vi.fn()

      wrapper.vm.remove(callback)

      expect(callback).toHaveBeenCalled()
    })

    it('calls checkWork with true', () => {
      const wrapper = mountComponent()
      wrapper.vm.remove(() => {})

      expect(mockCheckWork).toHaveBeenCalledWith(true)
    })
  })

  describe('SpinButton for remove', () => {
    it('renders remove button with correct props', () => {
      const wrapper = mountComponent()
      const spinButton = wrapper.find('.spin-button')

      expect(spinButton.exists()).toBe(true)
      expect(spinButton.attributes('data-variant')).toBe('white')
      expect(spinButton.attributes('data-label')).toBe('Remove')
    })

    it('triggers remove when clicked', async () => {
      const wrapper = mountComponent()
      const spinButton = wrapper.find('.spin-button')

      await spinButton.trigger('click')

      expect(mockMemberStore.remove).toHaveBeenCalled()
    })
  })

  describe('props validation', () => {
    it('accepts membership and userid props', () => {
      const membership = createMembership({ nameshort: 'CustomGroup' })
      const wrapper = mountComponent({
        membership,
        userid: 789,
      })

      expect(wrapper.props('membership').nameshort).toBe('CustomGroup')
      expect(wrapper.props('userid')).toBe(789)
    })
  })

  describe('edge cases', () => {
    it('handles membership with null eventsallowed', () => {
      const wrapper = mountComponent({
        membership: createMembership({ eventsallowed: null }),
      })
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles[0].attributes('data-value')).toBe('false')
    })

    it('handles membership with null volunteeringallowed', () => {
      const wrapper = mountComponent({
        membership: createMembership({ volunteeringallowed: null }),
      })
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles[1].attributes('data-value')).toBe('false')
    })

    it('handles membership with 0 eventsallowed (falsy)', () => {
      const wrapper = mountComponent({
        membership: createMembership({ eventsallowed: 0 }),
      })
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles[0].attributes('data-value')).toBe('false')
    })

    it('handles membership with truthy non-1 eventsallowed', () => {
      const wrapper = mountComponent({
        membership: createMembership({ eventsallowed: 2 }),
      })
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles[0].attributes('data-value')).toBe('true')
    })
  })

  describe('form group labels', () => {
    it('renders email frequency label', () => {
      const wrapper = mountComponent()
      const formGroups = wrapper.findAll('.form-group')
      const freqGroup = formGroups.find(
        (g) => g.attributes('data-label') === 'OFFER and WANTED posts:'
      )
      expect(freqGroup).toBeDefined()
    })

    it('renders moderation status label', () => {
      const wrapper = mountComponent()
      const formGroups = wrapper.findAll('.form-group')
      const modGroup = formGroups.find(
        (g) => g.attributes('data-label') === 'Moderation status:'
      )
      expect(modGroup).toBeDefined()
    })
  })
})
