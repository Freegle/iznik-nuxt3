import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import ModMissingProfile from '~/modtools/components/ModMissingProfile.vue'

// Mock useMe composable - myGroups must be a computed
const mockMyGroups = ref([])

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroups: computed(() => mockMyGroups.value),
  }),
}))

describe('ModMissingProfile', () => {
  function mountComponent() {
    return mount(ModMissingProfile, {
      global: {
        stubs: {
          NoticeMessage: true,
          'b-button': true,
          'v-icon': true,
        },
        mocks: {
          pluralise: () => 'groups are',
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMyGroups.value = []
  })

  describe('missing computed property - the actual logic', () => {
    it('handles empty myGroups array', () => {
      mockMyGroups.value = []
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toEqual([])
    })

    it('handles null myGroups gracefully - THIS IS THE BUG WE SHOULD HAVE CAUGHT', () => {
      mockMyGroups.value = null
      const wrapper = mountComponent()
      // If the code doesn't handle null, this will throw "myGroups is not iterable"
      expect(wrapper.vm.missing).toEqual([])
    })

    it('handles undefined myGroups gracefully', () => {
      mockMyGroups.value = undefined
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toEqual([])
    })

    it('filters out non-Freegle groups', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Other',
          role: 'Moderator',
          publish: true,
          tagline: null,
          profile: null,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toHaveLength(0)
    })

    it('filters out non-moderator roles', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Member',
          publish: true,
          tagline: null,
          profile: null,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toHaveLength(0)
    })

    it('filters out unpublished groups', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: false,
          tagline: null,
          profile: null,
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toHaveLength(0)
    })

    it('includes Moderator with missing tagline', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          tagline: null,
          profile: 'has-profile.jpg',
          namedisplay: 'Test',
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toHaveLength(1)
    })

    it('includes Owner with missing profile', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Owner',
          publish: true,
          tagline: 'Has tagline',
          profile: null,
          namedisplay: 'Test',
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toHaveLength(1)
    })

    it('excludes groups with both tagline AND profile', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          tagline: 'Has tagline',
          profile: 'has-profile.jpg',
          namedisplay: 'Test',
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toHaveLength(0)
    })

    it('correctly counts multiple missing groups', () => {
      mockMyGroups.value = [
        {
          id: 1,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          tagline: null,
          profile: null,
          namedisplay: 'Group 1',
        },
        {
          id: 2,
          type: 'Freegle',
          role: 'Owner',
          publish: true,
          tagline: 'Has',
          profile: null,
          namedisplay: 'Group 2',
        },
        {
          id: 3,
          type: 'Freegle',
          role: 'Moderator',
          publish: true,
          tagline: 'Has',
          profile: 'has.jpg',
          namedisplay: 'Group 3 - Complete',
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.missing).toHaveLength(2)
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
})
