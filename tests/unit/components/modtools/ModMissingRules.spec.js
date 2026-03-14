import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import ModMissingRules from '~/modtools/components/ModMissingRules.vue'

// Mock useMe composable - myGroups must be a computed
const mockMyGroups = ref([])

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroups: computed(() => mockMyGroups.value),
  }),
}))

// Mock modgroup store
const mockModGroupStore = {
  list: {},
  fetchIfNeedBeMT: vi.fn(),
}

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

describe('ModMissingRules', () => {
  const defaultProps = {}

  function mountComponent(props = {}) {
    return mount(ModMissingRules, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          NoticeMessage: true,
          'b-button': true,
          'v-icon': true,
          ExternalLink: true,
          NuxtLink: true,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMyGroups.value = []
    mockModGroupStore.list = {}
  })

  describe('invalid computed property - groups missing rules', () => {
    it('handles empty myGroups array', () => {
      mockMyGroups.value = []
      mockModGroupStore.list = {}
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toEqual([])
    })

    it('handles null myGroups gracefully', () => {
      mockMyGroups.value = null
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: null,
          namedisplay: 'Test',
        },
      }
      const wrapper = mountComponent()
      // If the code doesn't handle null, this will throw "Cannot read properties of null"
      expect(wrapper.vm.invalid).toEqual([])
    })

    it('handles undefined myGroups gracefully', () => {
      mockMyGroups.value = undefined
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toEqual([])
    })

    it('includes Freegle Owner groups without rules', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: null,
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(1)
      expect(wrapper.vm.invalid[0].namedisplay).toBe('Test Group')
    })

    it('excludes groups where user is not Owner', () => {
      mockMyGroups.value = [{ id: 1, role: 'Moderator' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: null,
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('excludes non-Freegle groups', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Other',
          publish: true,
          rules: null,
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('excludes unpublished groups', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: false,
          rules: null,
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })

    it('excludes groups with rules', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: '{}',
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.invalid).toHaveLength(0)
    })
  })

  describe('newRulesMissing computed property - groups with incomplete rules', () => {
    it('handles null myGroups gracefully', () => {
      mockMyGroups.value = null
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: '{}',
          namedisplay: 'Test',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.newRulesMissing).toEqual([])
    })

    it('includes Owner groups missing new rule fields', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: '{}',
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.newRulesMissing).toHaveLength(1)
      expect(wrapper.vm.newRulesMissing[0].missing).toBeTruthy()
    })

    it('excludes groups with all new rules filled in', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: JSON.stringify({
            limitgroups: true,
            wastecarrier: false,
            carboot: true,
            chineselanterns: false,
            carseats: true,
            pondlife: false,
            copyright: true,
            porn: false,
          }),
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.newRulesMissing).toHaveLength(0)
    })

    it('detects rules with non-boolean values as missing', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: JSON.stringify({
            limitgroups: 'yes', // String instead of boolean
            wastecarrier: true,
            carboot: true,
            chineselanterns: true,
            carseats: true,
            pondlife: true,
            copyright: true,
            porn: true,
          }),
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.newRulesMissing).toHaveLength(1)
      expect(wrapper.vm.newRulesMissing[0].missing).toContain('limitgroups')
    })

    it('limits missing rules display to 3 with ellipsis', () => {
      mockMyGroups.value = [{ id: 1, role: 'Owner' }]
      mockModGroupStore.list = {
        1: {
          id: 1,
          type: 'Freegle',
          publish: true,
          rules: '{}', // All 8 rules missing
          namedisplay: 'Test Group',
        },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.newRulesMissing[0].missing).toContain('...')
    })
  })

  describe('groups computed property', () => {
    it('returns values from modGroupStore.list', () => {
      mockModGroupStore.list = {
        1: { id: 1, namedisplay: 'Group 1' },
        2: { id: 2, namedisplay: 'Group 2' },
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.groups).toHaveLength(2)
    })
  })

  describe('methods', () => {
    it('expand sets summary to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.summary).toBe(true)
      wrapper.vm.expand()
      expect(wrapper.vm.summary).toBe(false)
    })
  })

  describe('onMounted', () => {
    it('fetches groups from store when myGroups has values', async () => {
      mockMyGroups.value = [{ id: 1 }, { id: 2 }]
      mountComponent()
      // Wait for mount hooks to run
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(mockModGroupStore.fetchIfNeedBeMT).toHaveBeenCalledWith(1)
      expect(mockModGroupStore.fetchIfNeedBeMT).toHaveBeenCalledWith(2)
    })

    it('handles null myGroups in onMounted gracefully', async () => {
      mockMyGroups.value = null
      mountComponent()
      // Should not throw
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(mockModGroupStore.fetchIfNeedBeMT).not.toHaveBeenCalled()
    })

    it('sets summary to false when expanded prop is true', async () => {
      mockMyGroups.value = []
      const wrapper = mountComponent({ expanded: true })
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(wrapper.vm.summary).toBe(false)
    })
  })
})
