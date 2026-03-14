import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModModeration from '~/modtools/components/ModModeration.vue'

// Mock store
const mockUserStore = {
  edit: vi.fn(),
  byId: vi.fn(),
  fetch: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModModeration', () => {
  const createMembership = (overrides = {}) => ({
    groupid: 123,
    ourpostingstatus: 'MODERATED',
    ...overrides,
  })

  const createUser = (overrides = {}) => ({
    id: 456,
    displayname: 'Test User',
    trustlevel: null,
    ...overrides,
  })

  function mountComponent(props = {}) {
    const { _userData, ...componentProps } = props
    const userid = componentProps.userid || 456
    const userData = _userData || createUser({ id: userid })

    mockUserStore.byId.mockImplementation((id) => {
      if (id === userid) return userData
      return null
    })

    return mount(ModModeration, {
      props: {
        membership: createMembership(),
        userid,
        ...componentProps,
      },
      global: {
        stubs: {
          'b-form-select': {
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <template v-if="options">
                  <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option>
                </template>
                <slot />
              </select>
            `,
            props: ['modelValue', 'options', 'size', 'readonly'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.edit.mockResolvedValue({})
    mockUserStore.byId.mockReturnValue(createUser())
    mockUserStore.fetch.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders two select elements', () => {
      const wrapper = mountComponent()
      const selects = wrapper.findAll('select')
      expect(selects.length).toBe(2)
    })

    it('renders posting status options', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Moderated')
      expect(wrapper.text()).toContain('Group Settings')
      expect(wrapper.text()).toContain("Can't Post")
    })

    it('renders trust level options', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Volunteering - not asked')
      expect(wrapper.text()).toContain('Volunteering - basic')
      expect(wrapper.text()).toContain('Volunteering - moderate')
      expect(wrapper.text()).toContain('Volunteering - advanced')
      expect(wrapper.text()).toContain('Volunteering - declined')
      expect(wrapper.text()).toContain('Volunteering - disabled')
    })
  })

  describe('postingStatus computed', () => {
    it('returns ourpostingstatus from membership', () => {
      const wrapper = mountComponent({
        membership: createMembership({ ourpostingstatus: 'DEFAULT' }),
      })
      expect(wrapper.vm.postingStatus).toBe('DEFAULT')
    })

    it('defaults to MODERATED when ourpostingstatus is null', () => {
      const wrapper = mountComponent({
        membership: createMembership({ ourpostingstatus: null }),
      })
      expect(wrapper.vm.postingStatus).toBe('MODERATED')
    })

    it('calls userStore.edit when setting postingStatus', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ groupid: 789 }),
        userid: 111,
        _userData: createUser({ id: 111 }),
      })

      // Directly set the computed property to test the setter
      wrapper.vm.postingStatus = 'PROHIBITED'
      await flushPromises()

      expect(mockUserStore.edit).toHaveBeenCalledWith({
        id: 111,
        groupid: 789,
        ourPostingStatus: 'PROHIBITED',
      })
    })

    it('uses userid prop for edit calls', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ groupid: 789 }),
        userid: 999,
        _userData: createUser({ id: 999 }),
      })

      // Directly set the computed property to test the setter
      wrapper.vm.postingStatus = 'DEFAULT'
      await flushPromises()

      expect(mockUserStore.edit).toHaveBeenCalledWith({
        id: 999,
        groupid: 789,
        ourPostingStatus: 'DEFAULT',
      })
    })

    it('uses membership.id as fallback groupid when membership.groupid is null', async () => {
      const wrapper = mountComponent({
        membership: { id: 555, groupid: null, ourpostingstatus: 'MODERATED' },
        userid: 111,
        _userData: createUser({ id: 111 }),
      })

      // Directly set the computed property to test the setter
      wrapper.vm.postingStatus = 'DEFAULT'
      await flushPromises()

      expect(mockUserStore.edit).toHaveBeenCalledWith({
        id: 111,
        groupid: 555,
        ourPostingStatus: 'DEFAULT',
      })
    })
  })

  describe('trustlevel computed', () => {
    it('returns trustlevel from user', () => {
      const wrapper = mountComponent({
        _userData: createUser({ trustlevel: 'Basic' }),
      })
      expect(wrapper.vm.trustlevel).toBe('Basic')
    })

    it('returns null when trustlevel is not set', () => {
      const wrapper = mountComponent({
        _userData: createUser({ trustlevel: null }),
      })
      expect(wrapper.vm.trustlevel).toBeNull()
    })

    it('calls userStore.edit when setting trustlevel', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ groupid: 789 }),
        userid: 111,
        _userData: createUser({ id: 111, trustlevel: null }),
      })

      // Directly set the computed property to test the setter
      wrapper.vm.trustlevel = 'Advanced'
      await flushPromises()

      expect(mockUserStore.edit).toHaveBeenCalledWith({
        id: 111,
        groupid: 789,
        trustlevel: 'Advanced',
      })
    })

    it('uses userid prop for trustlevel edit', async () => {
      const wrapper = mountComponent({
        membership: createMembership({ groupid: 789 }),
        userid: 888,
        _userData: createUser({ id: 888 }),
      })

      // Directly set the computed property to test the setter
      wrapper.vm.trustlevel = 'Moderate'
      await flushPromises()

      expect(mockUserStore.edit).toHaveBeenCalledWith({
        id: 888,
        groupid: 789,
        trustlevel: 'Moderate',
      })
    })
  })

  describe('options computed', () => {
    it('returns correct posting status options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.options).toEqual([
        { value: 'MODERATED', text: 'Moderated' },
        { value: 'DEFAULT', text: 'Group Settings' },
        { value: 'PROHIBITED', text: "Can't Post" },
      ])
    })
  })

  describe('props', () => {
    it('accepts optional userid prop', () => {
      const wrapper = mountComponent({ userid: 999 })
      expect(wrapper.props('userid')).toBe(999)
    })

    it('defaults size to lg', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('size')).toBe('lg')
    })
  })

  describe('trust level values', () => {
    it('handles Basic trust level', () => {
      const wrapper = mountComponent({
        _userData: createUser({ trustlevel: 'Basic' }),
      })
      expect(wrapper.vm.trustlevel).toBe('Basic')
    })

    it('handles Moderate trust level', () => {
      const wrapper = mountComponent({
        _userData: createUser({ trustlevel: 'Moderate' }),
      })
      expect(wrapper.vm.trustlevel).toBe('Moderate')
    })

    it('handles Advanced trust level', () => {
      const wrapper = mountComponent({
        _userData: createUser({ trustlevel: 'Advanced' }),
      })
      expect(wrapper.vm.trustlevel).toBe('Advanced')
    })

    it('handles Declined trust level', () => {
      const wrapper = mountComponent({
        _userData: createUser({ trustlevel: 'Declined' }),
      })
      expect(wrapper.vm.trustlevel).toBe('Declined')
    })

    it('handles Excluded trust level', () => {
      const wrapper = mountComponent({
        _userData: createUser({ trustlevel: 'Excluded' }),
      })
      expect(wrapper.vm.trustlevel).toBe('Excluded')
    })
  })

  describe('posting status values', () => {
    it('handles MODERATED status', () => {
      const wrapper = mountComponent({
        membership: createMembership({ ourpostingstatus: 'MODERATED' }),
      })
      expect(wrapper.vm.postingStatus).toBe('MODERATED')
    })

    it('handles DEFAULT status', () => {
      const wrapper = mountComponent({
        membership: createMembership({ ourpostingstatus: 'DEFAULT' }),
      })
      expect(wrapper.vm.postingStatus).toBe('DEFAULT')
    })

    it('handles PROHIBITED status', () => {
      const wrapper = mountComponent({
        membership: createMembership({ ourpostingstatus: 'PROHIBITED' }),
      })
      expect(wrapper.vm.postingStatus).toBe('PROHIBITED')
    })
  })

  describe('async setters', () => {
    it('setter is async and awaits edit call', async () => {
      let resolveEdit
      mockUserStore.edit.mockReturnValue(
        new Promise((resolve) => {
          resolveEdit = resolve
        })
      )

      const wrapper = mountComponent()

      // Directly set the computed property to test the async setter
      wrapper.vm.postingStatus = 'DEFAULT'

      // Edit should be called immediately
      expect(mockUserStore.edit).toHaveBeenCalled()

      // Resolve the edit
      resolveEdit({})
      await flushPromises()
    })
  })

  describe('groupid resolution', () => {
    it('prefers groupid over id', async () => {
      const wrapper = mountComponent({
        membership: { id: 100, groupid: 200, ourpostingstatus: 'MODERATED' },
        userid: 111,
        _userData: createUser({ id: 111 }),
      })

      // Directly set the computed property to test the setter
      wrapper.vm.postingStatus = 'DEFAULT'
      await flushPromises()

      expect(mockUserStore.edit).toHaveBeenCalledWith(
        expect.objectContaining({ groupid: 200 })
      )
    })

    it('falls back to membership.id when groupid is undefined', async () => {
      const wrapper = mountComponent({
        membership: { id: 300, ourpostingstatus: 'MODERATED' },
        userid: 111,
        _userData: createUser({ id: 111 }),
      })

      // Directly set the computed property to test the setter
      wrapper.vm.postingStatus = 'DEFAULT'
      await flushPromises()

      expect(mockUserStore.edit).toHaveBeenCalledWith(
        expect.objectContaining({ groupid: 300 })
      )
    })
  })
})
