import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ModTeamMember from '~/modtools/components/ModTeamMember.vue'

// Mock team store
const mockRemove = vi.fn()

vi.mock('@/stores/team', () => ({
  useTeamStore: () => ({
    remove: mockRemove,
  }),
}))

// Mock useMe composable
const mockSupportOrAdmin = ref(false)

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: mockSupportOrAdmin,
  }),
}))

describe('ModTeamMember', () => {
  const defaultProps = {
    teamid: 1,
    member: {
      id: 123,
      displayname: 'Test Member',
      profile: {
        turl: 'https://example.com/photo.jpg',
      },
    },
  }

  function mountComponent(props = {}) {
    return mount(ModTeamMember, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['size', 'variant'],
          },
          ProfileImage: {
            template: '<img class="profile-image" />',
            props: ['image', 'name', 'size'],
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'scale'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockSupportOrAdmin.value = false
    mockRemove.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders member displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Member')
    })

    it('renders member id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('renders profile image', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('shows remove button when supportOrAdmin is true', () => {
      mockSupportOrAdmin.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('hides remove button when supportOrAdmin is false', () => {
      mockSupportOrAdmin.value = false
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('methods', () => {
    it('remove calls teamStore.remove', async () => {
      mockSupportOrAdmin.value = true
      const wrapper = mountComponent()
      await wrapper.vm.remove()
      expect(mockRemove).toHaveBeenCalledWith({
        id: 1,
        userid: 123,
      })
    })

    it('remove emits removed event', async () => {
      mockSupportOrAdmin.value = true
      const wrapper = mountComponent()
      await wrapper.vm.remove()
      expect(wrapper.emitted('removed')).toHaveLength(1)
    })

    it('clicking remove button triggers remove', async () => {
      mockSupportOrAdmin.value = true
      const wrapper = mountComponent()
      await wrapper.find('button').trigger('click')
      expect(mockRemove).toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('accepts teamid prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('teamid')).toBe(1)
    })

    it('accepts member prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('member').displayname).toBe('Test Member')
    })
  })
})
